from rest_framework import serializers
from .models import Car, Purchase, Rental, CarImage

from django.utils import timezone

class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image', 'is_primary']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Ensure 'image' field is an absolute URL
        if representation.get('image') and representation['image'].startswith('/media/'):
            request = self.context.get('request')
            if request:
                representation['image'] = request.build_absolute_uri(representation['image'])
            else:
                # Fallback
                representation['image'] = f"http://localhost:8000{representation['image']}"
        return representation

class CarSerializer(serializers.ModelSerializer):
    current_rental = serializers.SerializerMethodField()
    has_ongoing_deal = serializers.SerializerMethodField()
    user_has_pending_request = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    # Image support
    images = CarImageSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    delete_image_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Car
        fields = [
            'id', 'make', 'model', 'year', 'description', 'body_type', 
            'category_tier', 'specs', 'is_for_sale', 'price', 'is_for_rent', 
            'daily_rent_price', 'image_url', 'created_at', 'current_rental', 
            'has_ongoing_deal', 'user_has_pending_request', 'is_favorited', 
            'images', 'uploaded_images', 'delete_image_ids'
        ]

    def to_internal_value(self, data):
        # We need to handle multipart form data where nested JSON might be sent as string
        # or where price strings might be empty. 
        # QueryDict.copy() still keeps it as a QueryDict, which can stringify values.
        # We convert to a plain dict while preserving lists for specific fields.
        if hasattr(data, 'getlist'):
            mutable_data = data.dict()
            # Restore list fields
            if 'uploaded_images' in data:
                mutable_data['uploaded_images'] = data.getlist('uploaded_images')
            if 'delete_image_ids' in data:
                mutable_data['delete_image_ids'] = data.getlist('delete_image_ids')
        else:
            mutable_data = data.copy() if hasattr(data, 'copy') else dict(data)
        
        # 1. Handle stringified 'specs'
        specs = mutable_data.get('specs')
        if specs and isinstance(specs, str):
            import json
            try:
                mutable_data['specs'] = json.loads(specs)
            except json.JSONDecodeError:
                pass

        # 2. Handle empty strings for decimal fields (common in forms)
        for field in ['price', 'daily_rent_price']:
            if mutable_data.get(field) == '':
                mutable_data[field] = None

        return super().to_internal_value(mutable_data)

    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        # Also pop delete_image_ids even if not used in create
        validated_data.pop('delete_image_ids', None)
        
        car = Car.objects.create(**validated_data)
        
        for i, img in enumerate(uploaded_images):
            # First one is primary by default if not specified
            CarImage.objects.create(car=car, image=img, is_primary=(i == 0))
        
        # Sync the primary image URL to the car model for legacy compatibility
        primary = car.images.filter(is_primary=True).first()
        if primary:
            car.image_url = primary.image.url
            car.save()
            
        return car

    def update(self, instance, validated_data):
        delete_image_ids = validated_data.pop('delete_image_ids', [])
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # 1. Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # 2. Delete requested images
        if delete_image_ids:
            CarImage.objects.filter(id__in=delete_image_ids, car=instance).delete()
            
        # 3. Add new images
        for i, img in enumerate(uploaded_images):
            # If no primary exists, make the first new one primary
            has_primary = instance.images.filter(is_primary=True).exists()
            CarImage.objects.create(car=instance, image=img, is_primary=not has_primary and i == 0)
            
        # 4. Sync absolute URL to image_url field
        primary = instance.images.filter(is_primary=True).first()
        if primary:
            instance.image_url = primary.image.url
            instance.save()
        elif not instance.images.exists():
            instance.image_url = None
            instance.save()
            
        return instance

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Ensure image_url is absolute for frontend visibility
        if representation.get('image_url') and representation['image_url'].startswith('/media/'):
            request = self.context.get('request')
            if request:
                representation['image_url'] = request.build_absolute_uri(representation['image_url'])
            else:
                # Fallback for dev if request context is missing
                representation['image_url'] = f"http://localhost:8000{representation['image_url']}"
        return representation

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from interactions.models import Favorite
            from django.contrib.contenttypes.models import ContentType
            ctype = ContentType.objects.get_for_model(obj)
            return Favorite.objects.filter(user=request.user, content_type=ctype, object_id=obj.id).exists()
        return False

    def get_current_rental(self, obj):
        # Find any active (approved) rental. If it's active, it's occupied.
        # This prevents double-booking even if the return time has expired but
        # the admin hasn't physically processed the return yet.
        active_rental = Rental.objects.filter(
            car=obj, 
            status='active'
        ).first()
        
        if active_rental:
            return {
                "start_date": active_rental.start_date,
                "end_date": active_rental.end_date
            }
        return None

    def get_has_ongoing_deal(self, obj):
        # A car has an ongoing deal if there's a purchase record with 
        # status 'pending' or 'approved'.
        return Purchase.objects.filter(
            car=obj, 
            status__in=['pending', 'approved']
        ).exists()

    def get_user_has_pending_request(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Rental.objects.filter(
                car=obj, 
                user=request.user, 
                status='pending'
            ).exists()
        return False

class PurchaseSerializer(serializers.ModelSerializer):
    approved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Purchase
        fields = '__all__'
        read_only_fields = ('user', 'purchase_date', 'approved_by')

    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return f"{obj.approved_by.first_name} {obj.approved_by.last_name}".strip() or obj.approved_by.username
        return None

class RentalSerializer(serializers.ModelSerializer):
    is_overdue = serializers.SerializerMethodField()

    class Meta:
        model = Rental
        fields = '__all__'
        read_only_fields = ('user',)

    def get_is_overdue(self, obj):
        if obj.status == 'active':
            return obj.end_date < timezone.now().date()
        return False
