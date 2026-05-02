from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Car, Purchase, Rental
from .serializers import CarSerializer, PurchaseSerializer, RentalSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.utils import timezone
import datetime

class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all().order_by('-created_at')
    serializer_class = CarSerializer
    permission_classes = [permissions.AllowAny] # Usually IsAdminUser for write, AllowAny for read
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['is_for_sale', 'is_for_rent', 'make', 'year']
    search_fields = ['make', 'model', 'description']
    ordering_fields = ['price', 'daily_rent_price', 'year', 'created_at']

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Returns 4 random vehicles for the home page featured collection."""
        cars = Car.objects.all().order_by('?')[:4]
        serializer = self.get_serializer(cars, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def purchase(self, request, pk=None):
        car = self.get_object()
        
        # Check if an ongoing deal exists (another user's pending/approved purchase)
        if Purchase.objects.filter(car=car, status__in=['pending', 'approved']).exists():
            return Response({
                "detail": "This vehicle is currently involved in an ongoing deal and is under process for purchase. Please choose another car or check back later for availability."
            }, status=status.HTTP_400_BAD_REQUEST)

        if not car.is_for_sale:
            return Response({"detail": "This car is not for sale."}, status=status.HTTP_400_BAD_REQUEST)
            
        transaction_id = request.data.get('transaction_id')
        payment_method = request.data.get('payment_method', 'Virtual Payment Gateway')

        # Create the purchase record
        purchase = Purchase.objects.create(
            user=request.user,
            car=car,
            price_paid=car.price,
            status='pending',
            transaction_id=transaction_id,
            payment_method=payment_method,
            payment_status=True
        )
        
        # Note: We no longer set car.is_for_sale = False here immediately,
        # as requested so it 'remains listed' until fully finalized/delivered.
        
        return Response({
            "detail": "Purchase request submitted successfully. Our acquisition team will review and contact you for delivery scheduling.",
            "purchase_id": purchase.id
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rent(self, request, pk=None):
        car = self.get_object()
        
        # Check if an ongoing deal exists (another user's pending/approved purchase)
        if Purchase.objects.filter(car=car, status__in=['pending', 'approved']).exists():
            return Response({
                "detail": "This vehicle is currently involved in an ongoing deal and is under process for purchase. Please choose another car or check back later for availability."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if user is verified (trustworthy)
        if not request.user.is_verified:
            return Response({"detail": "You must be verified to rent a vehicle. Please submit a trust request."}, status=status.HTTP_403_FORBIDDEN)

        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        if not car.is_for_rent:
            return Response({"detail": "This car is not available for rent."}, status=status.HTTP_400_BAD_REQUEST)

        # Preventing overlapping bookings: Check if vehicle is currently occupied/active
        if Rental.objects.filter(car=car, status='active').exists():
            return Response({"detail": "This vehicle is currently reserved and unavailable for new bookings."}, status=status.HTTP_400_BAD_REQUEST)

        if not start_date or not end_date:
            return Response({"detail": "start_date and end_date are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Basic string to date logic
        try:
            s_date = datetime.datetime.strptime(start_date, '%Y-%m-%d').date()
            e_date = datetime.datetime.strptime(end_date, '%Y-%m-%d').date()
            
            # 1. Prevent rentals in the past
            if s_date < timezone.now().date():
                return Response({"detail": "Rental start date cannot be in the past."}, status=status.HTTP_400_BAD_REQUEST)
            
            # 2. Chronological check
            if e_date < s_date:
                return Response({"detail": "End date must be on or after the start date."}, status=status.HTTP_400_BAD_REQUEST)
                
            # Calculation: same-day rental counted as 1 day minimum
            days_diff = (e_date - s_date).days
            days = max(1, days_diff)
            
        except ValueError:
            return Response({"detail": "Invalid date format or dates. Use YYYY-MM-DD and end after start."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": f"An unexpected error occurred: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
            
        total_price = days * car.daily_rent_price
        
        # Simulated Payment Data from Frontend
        transaction_id = request.data.get('transaction_id', f'MOCK-TXN-{datetime.datetime.now().timestamp()}')
        payment_method = request.data.get('payment_method', 'Visa **** 4242')
        
        rental = Rental.objects.create(
            user=request.user,
            car=car,
            start_date=s_date,
            end_date=e_date,
            total_price=total_price,
            status='pending',
            transaction_id=transaction_id,
            payment_method=payment_method,
            payment_status=True
        )
        
        return Response({"detail": "Rental booked successfully.", "total_price": total_price}, status=status.HTTP_201_CREATED)

class RentalViewSet(viewsets.ModelViewSet):
    """Admin endpoint to view and manage rentals"""
    queryset = Rental.objects.all().order_by('-start_date')
    serializer_class = RentalSerializer
    permission_classes = [permissions.IsAuthenticated] # Should be IsAdminUser in production

    # Include nested depth for easier frontend display without extra requests
    def get_serializer_class(self):
        if self.action in ['list', 'retrieve', 'telematics']:
            class AdminRentalSerializer(RentalSerializer):
                # Include nested depth for easier frontend display
                class Meta(RentalSerializer.Meta):
                    depth = 1
            return AdminRentalSerializer
        return super().get_serializer_class()

    @action(detail=True, methods=['get', 'patch'], permission_classes=[permissions.IsAuthenticated])
    def telematics(self, request, pk=None):
        rental = self.get_object()
        if request.method == 'PATCH':
            # We use the base serializer here so we don't handle nested objects in PATCH
            serializer = RentalSerializer(rental, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # GET returns the expanded admin version
        serializer = self.get_serializer(rental)
        return Response(serializer.data)


class MyRentalsViewSet(viewsets.ReadOnlyModelViewSet):
    """User endpoint to view their own rentals, filterable by ?status=active|completed|rejected"""
    serializer_class = RentalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Rental.objects.filter(user=self.request.user).order_by('-start_date')
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def get_serializer_class(self):
        class UserRentalSerializer(RentalSerializer):
            class Meta(RentalSerializer.Meta):
                depth = 1
        return UserRentalSerializer


class MyPurchasesViewSet(viewsets.ReadOnlyModelViewSet):
    """User endpoint to view their own purchases"""
    serializer_class = PurchaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Purchase.objects.filter(user=self.request.user).order_by('-purchase_date')

    def get_serializer_class(self):
        class UserPurchaseSerializer(PurchaseSerializer):
            class Meta(PurchaseSerializer.Meta):
                depth = 1
        return UserPurchaseSerializer

class AdminPurchaseViewSet(viewsets.ModelViewSet):
    """Admin endpoint to manage all car purchases (Approvals/Scheduling)"""
    queryset = Purchase.objects.all().order_by('-purchase_date')
    serializer_class = PurchaseSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_serializer_class(self):
        # Nested car and user info for the admin listing
        class FullPurchaseSerializer(PurchaseSerializer):
            class Meta(PurchaseSerializer.Meta):
                depth = 1
        return FullPurchaseSerializer

    def perform_update(self, serializer):
        # If status is being set to approved, record the admin who did it
        status = self.request.data.get('status')
        if status == 'approved':
            serializer.save(approved_by=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def cancel_purchase(self, request, pk=None):
        purchase = self.get_object()
        
        # Only allow cancellation if it was previously approved or delivered
        if purchase.status not in ['approved', 'delivered']:
            return Response({"detail": "Only approved or delivered acquisitions can be revoked."}, status=status.HTTP_400_BAD_REQUEST)

        # Restore car availability
        if purchase.car:
            purchase.car.is_for_sale = True
            purchase.car.save()

        purchase.status = 'cancelled'
        purchase.save()

        return Response({"detail": "Acquisition revoked successfully and vehicle returned to inventory."})
