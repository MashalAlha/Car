from django.db import models
from django.conf import settings

class Car(models.Model):
    BODY_TYPE_CHOICES = [
        ('Sedan', 'Sedan'),
        ('SUV', 'SUV'),
        ('Coupe', 'Coupe'),
        ('Convertible', 'Convertible'),
        ('Hatchback', 'Hatchback'),
        ('Pickup', 'Pickup'),
        ('Van', 'Van'),
    ]
    
    TIER_CHOICES = [
        ('Luxury', 'Luxury'),
        ('Performance', 'Performance'),
        ('Economy', 'Economy'),
        ('Classic', 'Classic'),
    ]

    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year = models.IntegerField()
    description = models.TextField(blank=True, null=True)
    body_type = models.CharField(max_length=50, choices=BODY_TYPE_CHOICES, default='Sedan')
    category_tier = models.CharField(max_length=50, choices=TIER_CHOICES, default='Luxury')
    specs = models.JSONField(default=dict, blank=True)
    
    is_for_sale = models.BooleanField(default=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    is_for_rent = models.BooleanField(default=False)
    daily_rent_price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    
    # image_url acts as a primary image, in a real scenario we'd use ImageField
    image_url = models.URLField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.year} {self.make} {self.model}"

class Purchase(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    car = models.ForeignKey(Car, on_delete=models.SET_NULL, null=True)
    price_paid = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default='pending') # pending, approved, delivered, rejected, cancelled
    delivery_date = models.DateField(null=True, blank=True)
    delivery_time = models.TimeField(null=True, blank=True)
    
    # Administrative Lifecycle
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_purchases')
    rejection_reason = models.TextField(blank=True, null=True)
    contract_notes = models.TextField(blank=True, null=True)
    
    # Virtual Payment Tracking
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    payment_status = models.BooleanField(default=False)

    def __str__(self):
        return f"Purchase: {self.user.username} - {self.car} (Status: {self.status})"

class Rental(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    car = models.ForeignKey(Car, on_delete=models.SET_NULL, null=True)
    start_date = models.DateField()
    end_date = models.DateField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default='pending')

    # Virtual Tracking & Telematics
    engine_status = models.BooleanField(default=True)
    geofence_radius = models.FloatField(default=50.0) # in km
    last_lat = models.FloatField(default=25.1972) # Showroom Lat (Mock)
    last_lng = models.FloatField(default=55.2744) # Showroom Lng (Mock)

    # Virtual Payment Tracking
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    payment_method = models.CharField(max_length=50, blank=True, null=True)
    payment_status = models.BooleanField(default=False)

    def __str__(self):
        return f"Rental: {self.user.username} - {self.car} ({self.start_date} to {self.end_date})"

class CarImage(models.Model):
    car = models.ForeignKey(Car, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='cars/')
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.car.make} {self.car.model}"
