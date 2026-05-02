from django.db import models
from django.conf import settings

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Types could be 'info', 'success', 'warning', 'appointment'
    type = models.CharField(max_length=50, default='info')

    def __str__(self):
        return f"{self.title} for {self.user.username}"


class SupportTicket(models.Model):
    STATUS_CHOICES = (
        ('Open', 'Open'),
        ('In_Progress', 'In Progress'),
        ('Resolved', 'Resolved'),
        ('Closed', 'Closed')
    )
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='support_tickets')
    subject = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='Open')
    admin_reply = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Ticket #{self.id} - {self.subject}"


class AdBanner(models.Model):
    title = models.CharField(max_length=100)
    image_url = models.URLField(max_length=500, blank=True, null=True)
    hyperlink = models.URLField(max_length=500, blank=True, null=True)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Promo Banner: {self.title} ({'Active' if self.is_active else 'Inactive'})"
