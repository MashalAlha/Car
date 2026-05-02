from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FavoriteViewSet, ReviewViewSet, RecommendationViewSet, ConciergeMessageViewSet

router = DefaultRouter()
router.register(r'favorites', FavoriteViewSet, basename='favorite')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'recommendations', RecommendationViewSet, basename='recommendation')
router.register(r'messages', ConciergeMessageViewSet, basename='conciergemessage')

urlpatterns = [
    path('', include(router.urls)),
]
