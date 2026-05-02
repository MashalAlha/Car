from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ServiceTypeViewSet, CustomerAppointmentViewSet, ManagerDashboardViewSet, WorkshopViewSet, WorkerViewSet

router = DefaultRouter()
router.register(r'service-types', ServiceTypeViewSet, basename='servicetype')
router.register(r'appointments', CustomerAppointmentViewSet, basename='appointment')
router.register(r'dashboard', ManagerDashboardViewSet, basename='dashboard')
router.register(r'facilities', WorkshopViewSet, basename='workshop')
router.register(r'workers', WorkerViewSet, basename='worker')

urlpatterns = [
    path('', include(router.urls)),
]
