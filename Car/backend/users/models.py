from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    ROLE_CHOICES = (
        ('Customer', 'Customer'),
        ('Admin', 'Admin'),
        ('WorkshopManager', 'Workshop Manager'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Customer')
    phone = models.CharField(max_length=15, unique=True, null=True, blank=True)
    otp = models.CharField(max_length=6, null=True, blank=True)
    otp_created_at = models.DateTimeField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.username} - {self.role}"

class TrustRequest(models.Model):
    STATUS_CHOICES = (
        ('Processing', 'Processing'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trust_requests')
    license_number = models.CharField(max_length=50)
    expiry_date = models.DateField()
    license_photo = models.ImageField(upload_to='licenses/', null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Processing')
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Auto-update user verification status
        super().save(*args, **kwargs)
        if self.status == 'Approved':
            self.user.is_verified = True
            self.user.save()
        elif self.status == 'Rejected':
            # If rejected, they are no longer verified unless they have another approved request
            # But usually, it's safer to check if any other approved exists
            has_other_approved = TrustRequest.objects.filter(user=self.user, status='Approved').exists()
            if not has_other_approved:
                self.user.is_verified = False
                self.user.save()

    def __str__(self):
        return f"Trust Request: {self.user.username} - {self.status}"
