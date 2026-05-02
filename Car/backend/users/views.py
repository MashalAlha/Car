from rest_framework import status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegisterSerializer, MyTokenObtainPairSerializer, UserSerializer
import random
from django.utils import timezone

class RegisterView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # MOCK OTP Generation
            otp = str(random.randint(100000, 999999))
            user.otp = otp
            user.otp_created_at = timezone.now()
            user.save()
            # In a real scenario, send OTP via SMS/Email here
            print(f"MOCK: Sent OTP {otp} to {user.email}")
            
            return Response({"message": "User created successfully. OTP sent.", "user_id": user.id}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = request.data.get("otp")
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.filter(email=email).first()
        
        if user and user.otp == otp:
            user.is_verified = True
            user.otp = None
            user.save()
            return Response({"message": "OTP verified successfully."}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid OTP or email."}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(views.APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = MyTokenObtainPairSerializer(data=request.data)
        if serializer.is_valid():
            return Response(serializer.validated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework import viewsets
from django.contrib.auth import get_user_model
User = get_user_model()

from rest_framework import viewsets, permissions, parsers
from .models import TrustRequest
from .serializers import TrustRequestSerializer, AdminTrustRequestSerializer, UserSerializer, AdminUserSerializer

from cars.models import Purchase, Rental
from store.models import StoreOrder
from workshop.models import Appointment

class FinancialRecordView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        transactions = []

        # 1. Car Purchases
        purchases = Purchase.objects.filter(user=user)
        for p in purchases:
            transactions.append({
                "id": f"PUR-{p.id}",
                "type": "Car Purchase",
                "type_ar": "شراء سيارة",
                "description": f"{p.car.year} {p.car.make} {p.car.model}" if p.car else "Car Purchase",
                "amount": str(p.price_paid),
                "date": p.purchase_date.isoformat(),
                "status": p.status,
                "status_ar": self._translate_status(p.status)
            })

        # 2. Rentals
        rentals = Rental.objects.filter(user=user)
        for r in rentals:
            # We use start_date as the transaction date if created_at is missing, 
            # but usually start_date is enough for a ledger.
            transactions.append({
                "id": f"RENT-{r.id}",
                "type": "Rental",
                "type_ar": "إيجار مركبة",
                "description": f"{r.car.year} {r.car.make} {r.car.model}" if r.car else "Vehicle Rental",
                "amount": str(r.total_price),
                "date": r.start_date.isoformat(), # Rental start date
                "status": r.status,
                "status_ar": self._translate_status(r.status)
            })

        # 3. Store Orders
        orders = StoreOrder.objects.filter(user=user)
        for o in orders:
            transactions.append({
                "id": f"ORD-{o.id}",
                "type": "Store Order",
                "type_ar": "طلب متجر",
                "description": f"Order #{o.id} - {o.parts.count()} items",
                "amount": str(o.total_price),
                "date": o.created_at.isoformat(),
                "status": o.status,
                "status_ar": self._translate_status(o.status)
            })

        # 4. Workshop Appointments (Service fees)
        appointments = Appointment.objects.filter(customer=user)
        for a in appointments:
            transactions.append({
                "id": f"APT-{a.id}",
                "type": "Workshop Service",
                "type_ar": "خدمة ورشة",
                "description": f"{a.service.name}" if a.service else "Workshop Appointment",
                "amount": str(a.total_amount),
                "date": a.created_at.isoformat(),
                "status": a.status,
                "status_ar": self._translate_status(a.status)
            })

        # Sort by date descending
        transactions.sort(key=lambda x: x['date'], reverse=True)

        return Response(transactions, status=status.HTTP_200_OK)

    def _translate_status(self, status):
        mapping = {
            'pending': 'قيد الانتظار',
            'Pending': 'قيد الانتظار',
            'approved': 'تمت الموافقة',
            'Approved': 'تمت الموافقة',
            'delivered': 'تم التسليم',
            'Delivered': 'تم التسليم',
            'rejected': 'مرفوض',
            'Rejected': 'مرفوض',
            'cancelled': 'ملغى',
            'Cancelled': 'ملغى',
            'Paid': 'تم الدفع',
            'Completed': 'مكتمل',
            'Maintenance_Done': 'اكتملت الصيانة',
            'Ready_For_Installation': 'جاهز للتركيب',
            'Delivered_Only': 'توصيل فقط',
            'Delivered_With_Installation': 'توصيل مع التركيب',
            'active': 'نشط',
            'Active': 'نشط',
        }
        return mapping.get(status, status)

class TrustRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        if self.request.user.role == 'Admin':
            return TrustRequest.objects.all().order_by('-created_at')
        return TrustRequest.objects.filter(user=self.request.user).order_by('-created_at')

    def get_serializer_class(self):
        if self.request.user.role == 'Admin':
            return AdminTrustRequestSerializer
        return TrustRequestSerializer

    def perform_create(self, serializer):
        # Check if user already has a processing request
        if TrustRequest.objects.filter(user=self.request.user, status='Processing').exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You already have a request in process.")
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        if request.user.role != 'Admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only admins can update trust requests.")
        return super().update(request, *args, **kwargs)

class AdminUserViewSet(viewsets.ModelViewSet):
    """Admin endpoint to view and manage users/roles"""
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated] # Should be IsAdminUser in production

