from rest_framework import serializers
from .models import ServiceType, Appointment, WorkOrder, Workshop, Worker, WorkOrderPart
from store.serializers import PartSerializer

class WorkshopSerializer(serializers.ModelSerializer):
    manager_name = serializers.CharField(source='manager.username', read_only=True, default='')
    class Meta:
        model = Workshop
        fields = '__all__'


class ServiceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceType
        fields = '__all__'

class WorkOrderPartSerializer(serializers.ModelSerializer):
    part_details = PartSerializer(source='part', read_only=True)
    
    class Meta:
        model = WorkOrderPart
        fields = '__all__'

class AppointmentSerializer(serializers.ModelSerializer):
    service_details = ServiceTypeSerializer(source='service', read_only=True)
    workshop_name = serializers.CharField(source='workshop.name', read_only=True)
    customer_name = serializers.CharField(source='customer.username', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    
    # Detailed Order info for the customer
    technician_name = serializers.CharField(source='workorder.assigned_technician.name', read_only=True, default='')
    technician_notes = serializers.CharField(source='workorder.technician_notes', read_only=True, default='')
    work_order_status = serializers.CharField(source='workorder.status', read_only=True, default='Unassigned')
    parts = WorkOrderPartSerializer(source='workorder.parts', many=True, read_only=True)
    additional_parts_cost = serializers.DecimalField(source='workorder.additional_parts_cost', max_digits=10, decimal_places=2, read_only=True, default=0.0)
    unforeseen_costs = serializers.DecimalField(source='workorder.unforeseen_costs', max_digits=10, decimal_places=2, read_only=True, default=0.0)
    
    class Meta:
        model = Appointment
        fields = '__all__'
        read_only_fields = ('customer', 'status', 'created_at', 'total_amount', 'payment_status')

class WorkOrderSerializer(serializers.ModelSerializer):
    appointment_details = AppointmentSerializer(source='appointment', read_only=True)
    technician_name = serializers.CharField(source='assigned_technician.name', read_only=True, default='')
    parts = WorkOrderPartSerializer(many=True, read_only=True)
    
    class Meta:
        model = WorkOrder
        fields = '__all__'
        read_only_fields = ('appointment',)

class WorkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = '__all__'
        read_only_fields = ('workshop',)
