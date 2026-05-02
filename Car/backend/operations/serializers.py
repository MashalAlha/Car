from rest_framework import serializers
from .models import Notification, SupportTicket, AdBanner

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['user', 'title', 'message', 'type', 'created_at']

class SupportTicketSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = '__all__'
        read_only_fields = ['user', 'status', 'admin_reply', 'created_at', 'updated_at']

class AdBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdBanner
        fields = '__all__'
