from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType
from .models import Favorite, Review, ConciergeMessage
from .serializers import FavoriteSerializer, ReviewSerializer, ConciergeMessageSerializer
import random

class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
    @action(detail=False, methods=['delete'])
    def remove(self, request):
        """Allows removal without knowing the favorite ID, just object_id and model string"""
        obj_id = request.data.get('object_id')
        model_str = request.data.get('content_type_model')
        
        try:
            ctype = ContentType.objects.get(model=model_str.lower())
            fav = Favorite.objects.get(user=request.user, content_type=ctype, object_id=obj_id)
            fav.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except (ContentType.DoesNotExist, Favorite.DoesNotExist):
            return Response({"detail": "Favorite not found."}, status=status.HTTP_404_NOT_FOUND)


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Allow filtering by object
        queryset = Review.objects.all().order_by('-created_at')
        obj_id = self.request.query_params.get('object_id')
        model_str = self.request.query_params.get('model')
        
        if obj_id and model_str:
            try:
                ctype = ContentType.objects.get(model=model_str.lower())
                queryset = queryset.filter(content_type=ctype, object_id=obj_id)
            except ContentType.DoesNotExist:
                return Review.objects.none()
                
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RecommendationViewSet(viewsets.ViewSet):
    """
    Business Logic Endpoint returning AI/Smart mock recommendations.
    """
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def feed(self, request):
        from cars.models import Car, Purchase, Rental
        from store.models import Part, StoreOrder
        from cars.serializers import CarSerializer
        from store.serializers import PartSerializer
        from django.db.models import Count, Q
        
        user = request.user
        if not user.is_authenticated:
            # Fallback to featured/all-round popular items
            rec_cars = Car.objects.filter(is_for_sale=True).order_by('-created_at')[:4]
            rec_parts = Part.objects.filter(is_accessory=True).order_by('?')[:4]
            return Response({
                "recommended_cars": CarSerializer(rec_cars, many=True, context={'request': request}).data,
                "recommended_accessories": PartSerializer(rec_parts, many=True, context={'request': request}).data,
                "context_msg": "recommendations.global_trends"
            })

        # 1. Gather Intelligence
        favorites = Favorite.objects.filter(user=user)
        purchases = Purchase.objects.filter(user=user)
        rentals = Rental.objects.filter(user=user)
        orders = StoreOrder.objects.filter(user=user, status__in=['Paid', 'Delivered'])

        # 2. Score Interest
        # Factors: Make of Car, Body Type, Part Category
        interest_makes = {}
        interest_body_types = {}
        target_vincodes = [] # If user has a car, recommend parts for it

        for p in purchases:
            if p.car:
                interest_makes[p.car.make] = interest_makes.get(p.car.make, 0) + 10
                interest_body_types[p.car.body_type] = interest_body_types.get(p.car.body_type, 0) + 5
                target_vincodes.append(p.car)

        for r in rentals:
            if r.car:
                interest_makes[r.car.make] = interest_makes.get(r.car.make, 0) + 5
                interest_body_types[r.car.body_type] = interest_body_types.get(r.car.body_type, 0) + 3

        for f in favorites:
            # Check if it's a Car or Part
            if f.content_type.model == 'car':
                car_obj = f.content_object
                if car_obj:
                    interest_makes[car_obj.make] = interest_makes.get(car_obj.make, 0) + 3
                    interest_body_types[car_obj.body_type] = interest_body_types.get(car_obj.body_type, 0) + 2
            elif f.content_type.model == 'part':
                part_obj = f.content_object
                if part_obj and part_obj.car_make:
                    interest_makes[part_obj.car_make] = interest_makes.get(part_obj.car_make, 0) + 1

        # 3. Decision Logic
        top_make = max(interest_makes, key=interest_makes.get) if interest_makes else None
        top_body = max(interest_body_types, key=interest_body_types.get) if interest_body_types else None

        # Build Filters
        car_filters = Q(is_for_sale=True)
        if top_make:
            car_filters |= Q(make=top_make)
        if top_body:
            car_filters |= Q(body_type=top_body)

        rec_cars = Car.objects.filter(car_filters).distinct().order_by('?')[:4]
        
        # Part Logic: If they own a car, suggest parts for it. Otherwise, suggest based on make.
        part_filters = Q(is_accessory=True)
        if target_vincodes:
            # Most relevant car owned
            owned_car = target_vincodes[0]
            part_filters |= Q(car_make=owned_car.make)
        elif top_make:
            part_filters |= Q(car_make=top_make)
            
        rec_parts = Part.objects.filter(part_filters).distinct().order_by('?')[:4]

        return Response({
            "recommended_cars": CarSerializer(rec_cars, many=True, context={'request': request}).data,
            "recommended_accessories": PartSerializer(rec_parts, many=True, context={'request': request}).data,
            "context_msg": "recommendations.matching_interests" if top_make or top_body else "recommendations.new_for_you"
        })


class ConciergeMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ConciergeMessageSerializer

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, 'role', None) == 'Admin':
            return ConciergeMessage.objects.all()
        return ConciergeMessage.objects.filter(user=user)

    def perform_create(self, serializer):
        # Automatically populate user details from the session
        serializer.save(
            user=self.request.user,
            name=self.request.user.username,
            email=self.request.user.email
        )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reply(self, request, pk=None):
        message = self.get_object()
        reply_text = request.data.get('admin_reply')
        if not reply_text:
            return Response({"detail": "Reply text is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        message.admin_reply = reply_text
        message.status = 'replied'
        message.save()
        return Response(ConciergeMessageSerializer(message).data)
