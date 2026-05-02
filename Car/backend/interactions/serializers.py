from rest_framework import serializers
from .models import Favorite, Review, ConciergeMessage
from django.contrib.contenttypes.models import ContentType

class GenericObjectRelatedField(serializers.RelatedField):
    def to_representation(self, value):
        from cars.serializers import CarSerializer
        from store.serializers import PartSerializer
        from cars.models import Car
        from store.models import Part
        
        if isinstance(value, Car):
            data = CarSerializer(value, context=self.context).data
            data['type'] = 'Car'
            return data
        elif isinstance(value, Part):
            data = PartSerializer(value, context=self.context).data
            data['type'] = 'Part'
            return data
            
        return {
            "type": value.__class__.__name__,
            "id": value.id,
            "name": getattr(value, 'name', getattr(value, 'model', str(value)))
        }

class FavoriteSerializer(serializers.ModelSerializer):
    content_object = GenericObjectRelatedField(read_only=True)
    content_type_model = serializers.CharField(write_only=True) # e.g. 'car' or 'part'

    class Meta:
        model = Favorite
        fields = ['id', 'user', 'content_object', 'content_type_model', 'object_id', 'created_at']
        read_only_fields = ['user', 'created_at']

    def create(self, validated_data):
        model_name = validated_data.pop('content_type_model')
        try:
            content_type = ContentType.objects.get(model=model_name.lower())
        except ContentType.DoesNotExist:
            raise serializers.ValidationError("Invalid content type string.")
            
        validated_data['content_type'] = content_type
        return super().create(validated_data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['content_type_model'] = instance.content_type.model
        return representation


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    content_type_model = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Review
        fields = ['id', 'user', 'username', 'rating', 'comment', 'content_type_model', 'object_id', 'created_at']
        read_only_fields = ['user', 'created_at']

    def create(self, validated_data):
        model_name = validated_data.pop('content_type_model', None)
        if model_name:
            try:
                content_type = ContentType.objects.get(model=model_name.lower())
                validated_data['content_type'] = content_type
            except ContentType.DoesNotExist:
                raise serializers.ValidationError("Invalid content type string.")
        return super().create(validated_data)


class ConciergeMessageSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    created_at_fmt = serializers.DateTimeField(source='created_at', format="%Y-%m-%d %H:%M", read_only=True)

    class Meta:
        model = ConciergeMessage
        fields = [
            'id', 'user', 'username', 'name', 'email', 
            'subject', 'message', 'admin_reply', 'status', 
            'created_at', 'created_at_fmt', 'updated_at'
        ]
        read_only_fields = ['user', 'admin_reply', 'status', 'created_at', 'updated_at']
