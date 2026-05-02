from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, VerifyOTPView, LoginView, ProfileView, AdminUserViewSet, TrustRequestViewSet, FinancialRecordView
from rest_framework_simplejwt.views import TokenRefreshView


router = DefaultRouter()
router.register(r'admin-users', AdminUserViewSet, basename='admin-user')
router.register(r'trust-requests', TrustRequestViewSet, basename='trust-request')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify_otp'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('financial-record/', FinancialRecordView.as_view(), name='financial-record'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
