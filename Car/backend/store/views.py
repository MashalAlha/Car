from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction, models
from django.db.models import Q
from .models import PartCategory, CarModelLookup, Part, StoreOrder, OrderItem
from .serializers import PartCategorySerializer, CarModelLookupSerializer, PartSerializer, StoreOrderSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from decimal import Decimal

class PartViewSet(viewsets.ReadOnlyModelViewSet):
    """Browse catalog of parts globally or via strict compatibility matching."""
    queryset = Part.objects.all()
    serializer_class = PartSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_accessory']
    search_fields = ['name', 'description', 'sku', 'brand', 'car_make', 'car_model']
    ordering_fields = ['price']

class AdminPartViewSet(viewsets.ModelViewSet):
    """Full CRUD for administrators to manage the boutique catalog."""
    queryset = Part.objects.all()
    serializer_class = PartSerializer
    permission_classes = [permissions.IsAdminUser] # In production use IsAdminUser or IsAuthenticated + role check
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'is_accessory']
    search_fields = ['name', 'sku', 'brand']

    @action(detail=False, methods=['get'])
    def compatibility(self, request):
        """
        Pass ?make=X&model=Y&year=Z
        Returns parts specifically verified to fit that vehicle.
        """
        make = request.query_params.get('make')
        model = request.query_params.get('model')
        year = request.query_params.get('year')

        if not all([make, model, year]):
            return Response({"detail": "make, model, and year parameters are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            year = int(year)
        except ValueError:
            return Response({"detail": "year must be an integer."}, status=status.HTTP_400_BAD_REQUEST)

        # Find matching lookups first
        lookups = CarModelLookup.objects.filter(
            make__iexact=make,
            model__iexact=model,
            year_start__lte=year,
            year_end__gte=year
        )

        if not lookups.exists():
            return Response([], status=status.HTTP_200_OK)

        # Parts that have ANY of the matching lookups
        parts = Part.objects.filter(compatible_cars__in=lookups).distinct()
        serializer = self.get_serializer(parts, many=True)
        return Response(serializer.data)


class StoreOrderViewSet(viewsets.ModelViewSet):
    """Customer-facing order management."""
    serializer_class = StoreOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return StoreOrder.objects.filter(user=self.request.user).order_by('-created_at').select_related('workshop_appointment', 'workshop_appointment__workshop').prefetch_related('orderitem_set', 'orderitem_set__part')

    def create(self, request, *args, **kwargs):
        """
        Expects payload: 
        {
           "items": [{"part_id": 1, "quantity": 2}],
           "requires_installation": true,
           "workshop_id": 5,
           "scheduled_date": "2026-05-01",
           "scheduled_time": "10:00",
           "is_home_service": false,
           "address_notes": "",
           "workshop_fee": 50.00,
           "payment_transaction_id": "MOCK-TXN-xxx"
        }
        """
        items_data = request.data.get('items', [])
        requires_install = request.data.get('requires_installation', False)
        payment_txn_id = request.data.get('payment_transaction_id', '')

        if not items_data:
            return Response({"detail": "Cart is empty."}, status=status.HTTP_400_BAD_REQUEST)

        # Calculate total and create order
        total_price = Decimal('0.00')
        initial_status = 'Paid'
        workshop_appointment = None
        workshop_fee = Decimal('0.00')

        with transaction.atomic():
            # If workshop installation requested, create appointment + work order
            if requires_install:
                workshop_id = request.data.get('workshop_id')
                scheduled_date = request.data.get('scheduled_date')
                scheduled_time = request.data.get('scheduled_time')
                is_home_service = request.data.get('is_home_service', False)
                address_notes = request.data.get('address_notes', '')
                workshop_fee = Decimal(str(request.data.get('workshop_fee', 0)))

                if not all([workshop_id, scheduled_date, scheduled_time]):
                    return Response({"detail": "Workshop booking details are required for installation."}, status=status.HTTP_400_BAD_REQUEST)

                from workshop.models import Workshop, Appointment, WorkOrder, ServiceType

                try:
                    workshop = Workshop.objects.get(id=workshop_id)
                except Workshop.DoesNotExist:
                    return Response({"detail": "Workshop not found."}, status=status.HTTP_400_BAD_REQUEST)

                # Find or create a generic installation service type
                service, _ = ServiceType.objects.get_or_create(
                    name='Parts & Accessories Installation',
                    defaults={
                        'description': 'Professional installation of purchased parts and accessories',
                        'estimated_duration_hours': 2.0,
                        'base_price': Decimal('0.00'),
                        'workshop_category': 'Maintenance_Accessories'
                    }
                )

                workshop_appointment = Appointment.objects.create(
                    customer=request.user,
                    workshop=workshop,
                    service=service,
                    scheduled_date=scheduled_date,
                    scheduled_time=scheduled_time,
                    is_home_service=is_home_service,
                    address_notes=address_notes,
                    total_amount=workshop_fee,
                    payment_status='Paid',
                    payment_transaction_id=payment_txn_id,
                    status='Pending'
                )

                # Create work order for the workshop manager
                WorkOrder.objects.create(
                    appointment=workshop_appointment,
                    workshop=workshop,
                    status='Unassigned'
                )

                initial_status = 'Ready_For_Installation'

            order = StoreOrder.objects.create(
                user=request.user,
                total_price=Decimal('0.00'),
                status=initial_status,
                requires_installation=requires_install,
                workshop_appointment=workshop_appointment,
                workshop_fee=workshop_fee,
                payment_transaction_id=payment_txn_id
            )

            for item in items_data:
                try:
                    part = Part.objects.get(id=item.get('part_id'))
                    qty = int(item.get('quantity', 1))
                    price_at_time = part.price
                    total_price += (price_at_time * qty)
                    
                    OrderItem.objects.create(
                        order=order,
                        part=part,
                        quantity=qty,
                        price_at_time=price_at_time
                    )
                    
                    # Stock deduction using F() to prevent race conditions
                    part.stock_quantity = models.F('stock_quantity') - qty
                    part.save()

                except Part.DoesNotExist:
                    continue

            order.total_price = total_price + workshop_fee
            order.save()

        return Response(StoreOrderSerializer(order, context={'request': request}).data, status=status.HTTP_201_CREATED)


class AdminStoreOrderViewSet(viewsets.ModelViewSet):
    """Admin dashboard for product-only orders (no workshop installation)."""
    serializer_class = StoreOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, 'role') or user.role != 'Admin':
            return StoreOrder.objects.none()
        return StoreOrder.objects.filter(
            requires_installation=False
        ).order_by('-created_at').select_related('user').prefetch_related('orderitem_set', 'orderitem_set__part')

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Advance order through the fulfillment pipeline."""
        order = self.get_object()
        new_status = request.data.get('status')
        
        VALID_TRANSITIONS = {
            'Paid': ['Prepared'],
            'Prepared': ['Out_For_Delivery'],
            'Out_For_Delivery': ['Delivered'],
        }

        allowed = VALID_TRANSITIONS.get(order.status, [])
        if new_status not in allowed:
            return Response(
                {"error": f"Cannot transition from '{order.status}' to '{new_status}'. Allowed: {allowed}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        order.save()
        return Response(StoreOrderSerializer(order, context={'request': request}).data)


class WorkshopInstallationOrderViewSet(viewsets.ReadOnlyModelViewSet):
    """Workshop manager view for installation orders from the store."""
    serializer_class = StoreOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base_qs = StoreOrder.objects.filter(
            requires_installation=True
        ).select_related(
            'user', 'workshop_appointment', 'workshop_appointment__workshop'
        ).prefetch_related('orderitem_set', 'orderitem_set__part').order_by('-created_at')

        if hasattr(user, 'role') and user.role == 'Admin':
            return base_qs

        # Workshop manager: only their workshop's orders
        from workshop.models import Workshop
        workshop = Workshop.objects.filter(manager=user).first()
        if workshop:
            return base_qs.filter(workshop_appointment__workshop=workshop)
        return StoreOrder.objects.none()

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Mark installation order as delivered with/without installation."""
        order = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['Delivered_With_Installation', 'Delivered_Only']:
            return Response(
                {"error": "Status must be 'Delivered_With_Installation' or 'Delivered_Only'."},
                status=status.HTTP_400_BAD_REQUEST
            )

        order.status = new_status
        order.save()

        # Also update the linked appointment if exists
        if order.workshop_appointment:
            order.workshop_appointment.status = 'Completed'
            order.workshop_appointment.save()
            # Update work order too
            try:
                wo = order.workshop_appointment.workorder
                wo.status = 'Completed'
                wo.save()
            except Exception:
                pass

        return Response(StoreOrderSerializer(order, context={'request': request}).data)
