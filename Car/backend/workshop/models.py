from django.db import models
from django.conf import settings

CATEGORY_CHOICES = (
    ('Polishing_Ceramic', 'Full Polishing and Ceramic Workshop'),
    ('Diagnostic_Inspection', 'Diagnostic Inspection Workshop'),
    ('Maintenance_Accessories', 'Maintenance and Accessories Installation Workshop'),
)

LOCATION_TYPE_CHOICES = (
    ('Internal', 'Internal Only'),
    ('Mobile', 'Mobile Only'),
    ('Both', 'Internal & Mobile'),
)

class Workshop(models.Model):
    name = models.CharField(max_length=200)
    working_days = models.CharField(max_length=100)
    working_hours = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    service_location_type = models.CharField(max_length=50, choices=LOCATION_TYPE_CHOICES, default='Both')
    manager = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role': 'WorkshopManager'}, related_name='managed_workshop')
    
    on_site_fee = models.DecimalField(max_digits=10, decimal_places=2, default=50.00)
    mobile_fee = models.DecimalField(max_digits=10, decimal_places=2, default=100.00)

    def __str__(self):
        return self.name

class ServiceType(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    estimated_duration_hours = models.DecimalField(max_digits=4, decimal_places=1)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    workshop_category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Maintenance_Accessories')

    def __str__(self):
        return self.name

class Appointment(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Maintenance_Done', 'Maintenance Done (Pending Payment)'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled'),
        ('Rejected', 'Rejected'),
    )

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='appointments')
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='appointments', null=True)
    service = models.ForeignKey(ServiceType, on_delete=models.SET_NULL, null=True)
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    
    is_home_service = models.BooleanField(default=False)
    gps_coordinates = models.CharField(max_length=150, blank=True, null=True, help_text="Format: lat,long")
    address_notes = models.TextField(blank=True, null=True)
    
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_status = models.CharField(max_length=20, default='Pending')
    payment_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.customer.username} - {self.service.name if self.service else 'Service'} at {self.scheduled_date}"

class WorkOrder(models.Model):
    ORDER_STATUS = (
        ('Unassigned', 'Unassigned'),
        ('In_Progress', 'In Progress'),
        ('Awaiting_Payment', 'Awaiting Payment'),
        ('Completed', 'Completed'),
        ('Rejected', 'Rejected'),
        ('Cancelled', 'Cancelled'),
    )
    
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE)
    workshop = models.ForeignKey(Workshop, on_delete=models.SET_NULL, null=True, blank=True, related_name='work_orders')
    
    # We use Worker model for the specific technician identity 
    assigned_technician = models.ForeignKey('Worker', on_delete=models.SET_NULL, null=True, blank=True, related_name='work_orders')
    
    status = models.CharField(max_length=20, choices=ORDER_STATUS, default='Unassigned')
    manager_notes = models.TextField(blank=True, null=True)
    technician_notes = models.TextField(blank=True, null=True)
    
    additional_parts_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    unforeseen_costs = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Order for {self.appointment.id} - {self.status}"

class WorkOrderPart(models.Model):
    work_order = models.ForeignKey(WorkOrder, on_delete=models.CASCADE, related_name='parts')
    part = models.ForeignKey('store.Part', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.part.name} for Order {self.work_order.id}"

class Worker(models.Model):
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='workers')
    name = models.CharField(max_length=200)
    specialty = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.workshop.name}"
