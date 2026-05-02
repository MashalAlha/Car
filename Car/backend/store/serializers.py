from rest_framework import serializers
from .models import PartCategory, CarModelLookup, Part, StoreOrder, OrderItem

class PartCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PartCategory
        fields = '__all__'

class CarModelLookupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarModelLookup
        fields = '__all__'

class PartSerializer(serializers.ModelSerializer):
    category_details = PartCategorySerializer(source='category', read_only=True)
    is_favorited = serializers.SerializerMethodField()
    
    class Meta:
        model = Part
        fields = [
            'id', 'name', 'brand', 'sku', 'description', 'price', 
            'stock_quantity', 'car_make', 'car_model', 'model_year', 
            'category', 'category_details', 'compatible_cars', 'image', 
            'is_accessory', 'installation_available', 'is_favorited'
        ]

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from interactions.models import Favorite
            from django.contrib.contenttypes.models import ContentType
            ctype = ContentType.objects.get_for_model(obj)
            return Favorite.objects.filter(user=request.user, content_type=ctype, object_id=obj.id).exists()
        return False

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image:
            if request:
                representation['image'] = request.build_absolute_uri(instance.image.url)
            else:
                # Fallback for search indexing or tasks where request is missing
                representation['image'] = f"http://localhost:8000{instance.image.url}"
        return representation

class OrderItemSerializer(serializers.ModelSerializer):
    part_details = PartSerializer(source='part', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['part', 'quantity', 'price_at_time', 'part_details']

class StoreOrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(source='orderitem_set', many=True, read_only=True)
    customer_name = serializers.CharField(source='user.username', read_only=True)
    customer_email = serializers.CharField(source='user.email', read_only=True)
    customer_phone = serializers.CharField(source='user.phone', read_only=True)
    
    # Workshop details (if linked)
    workshop_name = serializers.SerializerMethodField()
    workshop_date = serializers.SerializerMethodField()
    workshop_time = serializers.SerializerMethodField()
    workshop_status = serializers.SerializerMethodField()
    is_home_service = serializers.SerializerMethodField()
    
    class Meta:
        model = StoreOrder
        fields = '__all__'
        read_only_fields = ('user', 'status', 'created_at', 'total_price')

    def get_workshop_name(self, obj):
        if obj.workshop_appointment and obj.workshop_appointment.workshop:
            return obj.workshop_appointment.workshop.name
        return None

    def get_workshop_date(self, obj):
        if obj.workshop_appointment:
            return str(obj.workshop_appointment.scheduled_date)
        return None

    def get_workshop_time(self, obj):
        if obj.workshop_appointment:
            return str(obj.workshop_appointment.scheduled_time)
        return None

    def get_workshop_status(self, obj):
        if obj.workshop_appointment:
            return obj.workshop_appointment.status
        return None

    def get_is_home_service(self, obj):
        if obj.workshop_appointment:
            return obj.workshop_appointment.is_home_service
        return False
