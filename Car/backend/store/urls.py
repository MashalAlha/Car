from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PartViewSet, StoreOrderViewSet, AdminPartViewSet, AdminStoreOrderViewSet, WorkshopInstallationOrderViewSet

router = DefaultRouter()
router.register(r'inventory', PartViewSet, basename='part')
router.register(r'admin/inventory', AdminPartViewSet, basename='admin-part')
router.register(r'orders', StoreOrderViewSet, basename='storeorder')
router.register(r'admin/orders', AdminStoreOrderViewSet, basename='admin-storeorder')
router.register(r'installation-orders', WorkshopInstallationOrderViewSet, basename='installation-order')

urlpatterns = [
    path('', include(router.urls)),
]
