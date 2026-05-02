from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CarViewSet, RentalViewSet, MyRentalsViewSet, MyPurchasesViewSet, AdminPurchaseViewSet

router = DefaultRouter()
router.register(r'inventory', CarViewSet, basename='car')
router.register(r'rentals', RentalViewSet, basename='rental')
router.register(r'my-rentals', MyRentalsViewSet, basename='my-rental')
router.register(r'my-purchases', MyPurchasesViewSet, basename='my-purchase')
router.register(r'all-purchases', AdminPurchaseViewSet, basename='admin-purchase')

urlpatterns = [
    path('', include(router.urls)),
]
