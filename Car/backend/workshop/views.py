from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction, models
from .models import ServiceType, Appointment, WorkOrder, Workshop, Worker, WorkOrderPart
from .serializers import ServiceTypeSerializer, AppointmentSerializer, WorkOrderSerializer, WorkshopSerializer, WorkerSerializer

class ServiceTypeViewSet(viewsets.ReadOnlyModelViewSet):
    """Publicly viewable service types"""
    queryset = ServiceType.objects.all()
    serializer_class = ServiceTypeSerializer
    permission_classes = [permissions.AllowAny]


class CustomerAppointmentViewSet(viewsets.ModelViewSet):
    """Customers booking and viewing their own appointments"""
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(customer=self.request.user)

    def perform_create(self, serializer):
        from rest_framework.exceptions import ValidationError
        
        data = serializer.validated_data
        workshop = data.get('workshop')
        scheduled_date = data.get('scheduled_date')
        scheduled_time = data.get('scheduled_time')
        is_home_service = data.get('is_home_service', False)
        service = data.get('service')

        from datetime import datetime, timedelta
        
        # 1. Overlap Check: account for duration
        duration_hours = float(service.estimated_duration_hours) if service else 1.0
        start_dt = datetime.combine(scheduled_date, scheduled_time)
        end_dt = start_dt + timedelta(hours=duration_hours)

        overlapping = Appointment.objects.filter(
            workshop=workshop, 
            scheduled_date=scheduled_date,
            status__in=['Pending', 'Approved', 'Maintenance_Done']
        )
        for appt in overlapping:
            appt_duration = float(appt.service.estimated_duration_hours) if appt.service else 1.0
            appt_start = datetime.combine(appt.scheduled_date, appt.scheduled_time)
            appt_end = appt_start + timedelta(hours=appt_duration)
            
            if start_dt < appt_end and end_dt > appt_start:
                 raise ValidationError({"detail": f"The workshop is busy during this time ({appt_start.strftime('%H:%M')} - {appt_end.strftime('%H:%M')}). Please choose another slot."})

        # 2. Location Type Validation
        if is_home_service and workshop.service_location_type == 'Internal':
            raise ValidationError({"detail": "The selected workshop only provides on-site services at their HQ."})
        if not is_home_service and workshop.service_location_type == 'Mobile':
            raise ValidationError({"detail": "The selected workshop only provides mobile/home services."})

        # 3. Fee Calculation
        fee = workshop.mobile_fee if is_home_service else workshop.on_site_fee
        total = (service.base_price if service else 0) + fee

        # 4. Save
        # Note: Frontend should send payment_status = 'Paid' and transaction_id after successful mock payment
        appointment = serializer.save(
            customer=self.request.user,
            total_amount=total
        )

        # 5. Create WorkOrder specifically for the selected workshop
        WorkOrder.objects.create(appointment=appointment, workshop=workshop)

    @action(detail=True, methods=['get'])
    def track(self, request, pk=None):
        appointment = self.get_object()
        try:
            work_order = appointment.workorder
            return Response({
                "appointment_status": appointment.status,
                "work_order_status": work_order.status,
                "technician": work_order.assigned_technician.username if work_order.assigned_technician else None,
                "notes": work_order.technician_notes
            })
        except WorkOrder.DoesNotExist:
            return Response({"detail": "Work order not found for this appointment."}, status=404)

    @action(detail=True, methods=['post'])
    def pay_maintenance(self, request, pk=None):
        appointment = self.get_object()
        # Mock payment processing logic here
        
        appointment.status = 'Completed'
        appointment.payment_status = 'Paid'
        appointment.save()
        
        try:
            work_order = appointment.workorder
            work_order.status = 'Completed'
            work_order.save()
            return Response({"detail": "Payment successful. Order completed."})
        except WorkOrder.DoesNotExist:
            return Response({"detail": "Appointment completed, but no WorkOrder was found."}, status=200)


class ManagerDashboardViewSet(viewsets.ModelViewSet):
    """Workshop Manager Dashboard Actions"""
    serializer_class = WorkOrderSerializer
    permission_classes = [permissions.IsAuthenticated] # Should verify role='WorkshopManager' in production

    def get_queryset(self):
        user = self.request.user
        base_qs = WorkOrder.objects.select_related(
            'appointment__customer', 
            'appointment__service', 
            'workshop'
        ).order_by('-id')
        
        if user.role == 'Admin':
            return base_qs.all()
            
        # Robust lookup for managed workshop
        workshop = Workshop.objects.filter(manager=user).first()
        if workshop:
            return base_qs.filter(workshop=workshop).prefetch_related('parts', 'parts__part')
            
        return base_qs.none()

    @action(detail=False, methods=['get'])
    def metrics(self, request):
        from django.utils import timezone
        qs = self.get_queryset()
        
        today = timezone.now().date()
        active_orders = qs.exclude(status='Completed').count()
        unassigned = qs.filter(status='Unassigned').count()
        
        # Today's local context appointments
        user = request.user
        appt_qs = Appointment.objects.filter(scheduled_date=today)
        if user.role != 'Admin':
            workshop = Workshop.objects.filter(manager=user).first()
            if workshop:
                appt_qs = appt_qs.filter(workshop=workshop)
            else:
                appt_qs = Appointment.objects.none()
                
        total_today = appt_qs.count()
        
        return Response({
            "active_orders": active_orders,
            "unassigned_appointments": unassigned,
            "expected_appointments_today": total_today
        })

    @action(detail=True, methods=['post'])
    def assign_technician(self, request, pk=None):
        work_order = self.get_object()
        worker_id = request.data.get('worker_id')
        
        try:
            worker = Worker.objects.get(id=worker_id)
            work_order.assigned_technician = worker
            work_order.status = 'In_Progress'
            work_order.save()
            
            # Update appointment status too
            work_order.appointment.status = 'Approved'
            work_order.appointment.save()
            
            return Response({"detail": f"Assigned to {worker.name}"})
        except Worker.DoesNotExist:
            return Response({"error": "Worker not found in registry"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_part(self, request, pk=None):
        work_order = self.get_object()
        part_id = request.data.get('part_id')
        quantity = int(request.data.get('quantity', 1))
        
        from store.models import Part
        try:
            part = Part.objects.get(id=part_id)
            
            with transaction.atomic():
                wop, created = WorkOrderPart.objects.get_or_create(
                    work_order=work_order,
                    part=part,
                    defaults={'price_at_time': part.price, 'quantity': 0}
                )
                wop.quantity += quantity
                wop.save()
                
                # Update running cost
                delta = (part.price * quantity)
                work_order.additional_parts_cost += delta
                work_order.save()

                # CRITICAL: Inventory Deduction
                part.stock_quantity = models.F('stock_quantity') - quantity
                part.save()

                # Sync with appointment if payment already requested
                if work_order.status == 'Awaiting_Payment':
                    work_order.appointment.total_amount += delta
                    work_order.appointment.save()
            
            # CRITICAL: Refetch the instance to break any prefetch cache from get_object()
            work_order = WorkOrder.objects.prefetch_related('parts', 'parts__part').get(pk=work_order.pk)
            
            # Return updated order directly for instant UI sync
            serializer = WorkOrderSerializer(work_order, context={'request': request})
            return Response(serializer.data)
        except Part.DoesNotExist:
            return Response({"error": "Part not found in inventory"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def remove_part(self, request, pk=None):
        work_order = self.get_object()
        part_id = request.data.get('part_id')
        
        from store.models import Part
        try:
            part = Part.objects.get(id=part_id)
            wop = WorkOrderPart.objects.filter(work_order=work_order, part=part).first()
            
            if not wop:
                return Response({"error": "Part not found in this requisition"}, status=status.HTTP_404_NOT_FOUND)
            
            with transaction.atomic():
                # Restore stock
                part.stock_quantity = models.F('stock_quantity') + wop.quantity
                part.save()

                # Deduct cost
                delta = (wop.price_at_time * wop.quantity)
                work_order.additional_parts_cost -= delta
                work_order.save()

                # Sync with appointment if payment already requested
                if work_order.status == 'Awaiting_Payment':
                    work_order.appointment.total_amount -= delta
                    work_order.appointment.save()
                
                # Delete record
                wop.delete()

            # CRITICAL: Refetch the instance to break any prefetch cache from get_object()
            work_order = WorkOrder.objects.prefetch_related('parts', 'parts__part').get(pk=work_order.pk)
            
            # Return updated order
            serializer = WorkOrderSerializer(work_order, context={'request': request})
            return Response(serializer.data)
        except Part.DoesNotExist:
            return Response({"error": "Part not found"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def update_unforeseen_costs(self, request, pk=None):
        work_order = self.get_object()
        amount = request.data.get('unforeseen_costs', 0)
        try:
            new_val = float(amount)
            delta = new_val - float(work_order.unforeseen_costs)
            
            work_order.unforeseen_costs = new_val
            work_order.save()

            # Sync with appointment if payment already requested
            if work_order.status == 'Awaiting_Payment':
                work_order.appointment.total_amount += delta
                work_order.appointment.save()

            # Refetch for fresh totals
            work_order = WorkOrder.objects.prefetch_related('parts', 'parts__part').get(pk=work_order.pk)
            
            serializer = WorkOrderSerializer(work_order, context={'request': request})
            return Response(serializer.data)
        except (ValueError, TypeError):
            return Response({"error": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def request_payment(self, request, pk=None):
        work_order = self.get_object()
        work_order.status = 'Awaiting_Payment'
        work_order.save()
        
        # Update Appointment status to reflect the transition
        appointment = work_order.appointment
        appointment.status = 'Maintenance_Done'
        # Finalize the total amount on the appointment
        # Only add the extras (parts + unforeseen)
        appointment.total_amount += (work_order.additional_parts_cost + work_order.unforeseen_costs)
        appointment.save()
        
        return Response({"detail": "Maintenance finished. Payment requested from customer."})

    @action(detail=True, methods=['post'])
    def complete_order(self, request, pk=None):
        work_order = self.get_object()
        work_order.status = 'Completed'
        work_order.save()
        
        appointment = work_order.appointment
        appointment.status = 'Completed'
        appointment.payment_status = 'Paid'
        appointment.save()
        
        return Response({"detail": "Order finalized and closed."})

    @action(detail=True, methods=['post'])
    def reject_order(self, request, pk=None):
        work_order = self.get_object()
        if work_order.status != 'Unassigned':
            return Response({"error": "Only unassigned orders can be rejected."}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            notes = request.data.get('manager_notes', 'N/A')
            work_order.status = 'Rejected'
            work_order.manager_notes = notes
            work_order.save()
            
            # Restore stock for any parts added to this requisition
            for wop in work_order.parts.all():
                wop.part.stock_quantity = models.F('stock_quantity') + wop.quantity
                wop.part.save()
                wop.delete() # Clear the requisition as it's rejected

            appointment = work_order.appointment
            appointment.status = 'Rejected'
            appointment.save()
        
        return Response({"detail": "Order rejected and stock restored."})

    @action(detail=True, methods=['post'])
    def cancel_order(self, request, pk=None):
        work_order = self.get_object()
        if work_order.status != 'In_Progress':
            return Response({"error": "Only in-progress orders can be cancelled. Already settled orders cannot be cancelled."}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            notes = request.data.get('manager_notes', 'N/A')
            work_order.status = 'Cancelled'
            work_order.manager_notes = notes
            work_order.save()
            
            # Restore stock
            for wop in work_order.parts.all():
                wop.part.stock_quantity = models.F('stock_quantity') + wop.quantity
                wop.part.save()
                wop.delete()

            appointment = work_order.appointment
            appointment.status = 'Cancelled'
            appointment.save()
        
        return Response({"detail": "Order cancelled and stock restored."})

class WorkshopViewSet(viewsets.ModelViewSet):
    """Admin management of Workshop Facilities"""
    serializer_class = WorkshopSerializer
    permission_classes = [permissions.IsAuthenticated] 

    def get_queryset(self):
        user = self.request.user
        # Allow all authenticated users to see the workshop list for booking
        if user.is_authenticated:
            # If it's a manager, they might still want to see just their own in the management context,
            # but for the booking flow (list view), all workshops should be available.
            return Workshop.objects.all()
        return Workshop.objects.none()

    @action(detail=False, methods=['get'])
    def eligible_managers(self, request):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        # WorkshopManager explicitly without a managed_workshop
        managers = User.objects.filter(role='WorkshopManager', managed_workshop__isnull=True)
        data = [{"id": m.id, "username": m.username} for m in managers]
        return Response(data)

    @action(detail=True, methods=['get'])
    def booked_slots(self, request, pk=None):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({"error": "date parameter is required"}, status=400)
        
        workshop = self.get_object()
        from .models import Appointment
        appointments = Appointment.objects.filter(
            workshop=workshop, 
            scheduled_date=date_str,
            status__in=['Pending', 'Approved', 'Maintenance_Done']
        )
        
        slots = []
        for appt in appointments:
            duration = float(appt.service.estimated_duration_hours) if appt.service else 1.0
            slots.append({
                "start": appt.scheduled_time.strftime("%H:%M"),
                "duration": duration,
                "service": appt.service.name if appt.service else "Unknown"
            })
        return Response(slots)

class WorkerViewSet(viewsets.ModelViewSet):
    """Management of Workshop Workers"""
    serializer_class = WorkerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'Admin':
            return Worker.objects.all()
        elif hasattr(user, 'managed_workshop'):
            return Worker.objects.filter(workshop=user.managed_workshop)
        return Worker.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'Admin':
            serializer.save()
        elif hasattr(user, 'managed_workshop'):
            serializer.save(workshop=user.managed_workshop)
        else:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must be a workshop manager to add workers.")
