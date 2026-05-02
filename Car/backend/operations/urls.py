from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, SupportTicketViewSet, AdBannerViewSet, DashboardViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'tickets', SupportTicketViewSet, basename='ticket')
router.register(r'banners', AdBannerViewSet, basename='banner')
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
]
