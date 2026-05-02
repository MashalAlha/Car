from django.db import models
from django.conf import settings

class PartCategory(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class CarModelLookup(models.Model):
    make = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    year_start = models.IntegerField()
    year_end = models.IntegerField()

    def __str__(self):
        return f"{self.make} {self.model} ({self.year_start}-{self.year_end})"

class Part(models.Model):
    name = models.CharField(max_length=200)
    brand = models.CharField(max_length=100, blank=True, null=True)
    sku = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    
    # Standard Details for specific vehicle fitment
    car_make = models.CharField(max_length=100, blank=True, null=True)
    car_model = models.CharField(max_length=100, blank=True, null=True)
    model_year = models.IntegerField(blank=True, null=True)
    
    category = models.ForeignKey(PartCategory, on_delete=models.SET_NULL, null=True, related_name='parts')
    compatible_cars = models.ManyToManyField(CarModelLookup, related_name='compatible_parts', blank=True)
    
    # Direct image upload
    image = models.ImageField(upload_to='parts/', blank=True, null=True)
    is_accessory = models.BooleanField(default=False)
    installation_available = models.BooleanField(default=False)

    def __str__(self):
        return self.name

class StoreOrder(models.Model):
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('Paid', 'Paid'),
        ('Prepared', 'Prepared'),
        ('Out_For_Delivery', 'Out for Delivery'),
        ('Delivered', 'Delivered'),
        # Workshop-specific statuses
        ('Ready_For_Installation', 'Ready for Installation'),
        ('Delivered_With_Installation', 'Delivered with Installation'),
        ('Delivered_Only', 'Delivered Only'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='store_orders')
    parts = models.ManyToManyField(Part, through='OrderItem')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Pending')
    
    requires_installation = models.BooleanField(default=False)
    workshop_appointment = models.ForeignKey(
        'workshop.Appointment', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='store_orders'
    )
    workshop_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_transaction_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(StoreOrder, on_delete=models.CASCADE)
    part = models.ForeignKey(Part, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)
    price_at_time = models.DecimalField(max_digits=10, decimal_places=2)
