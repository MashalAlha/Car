from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

from .models import TrustRequest

class TrustRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrustRequest
        fields = '__all__'
        read_only_fields = ('user', 'status', 'rejection_reason', 'created_at')

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'role', 'is_verified')
        read_only_fields = ('role', 'is_verified')

class AdminUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'role', 'is_verified', 'password')

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User.objects.create(**validated_data)
        if password:
            user.set_password(password)
        else:
            # Set a random password if none provided for safety
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class AdminTrustRequestSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    class Meta:
        model = TrustRequest
        fields = '__all__'
        read_only_fields = ('user', 'created_at')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'phone', 'password')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            phone=validated_data.get('phone', ''),
            password=validated_data['password']
        )
        return user

class MyTokenObtainPairSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = User.objects.filter(email=email).first()
        if user and user.check_password(password):
            # Enforce workshop assignment for WorkshopManagers
            if user.role == 'WorkshopManager' and not hasattr(user, 'managed_workshop'):
                raise serializers.ValidationError({"detail": "no_workshop_assigned"})

            refresh = RefreshToken.for_user(user)
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }
        raise serializers.ValidationError("Invalid credentials")
