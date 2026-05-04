import os
import sys
import django

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

def create_user(username, email, password, role, phone):
    if not User.objects.filter(email=email).exists():
        is_admin = (role == 'Admin')
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role,
            phone=phone,
            is_verified=True,
            is_staff=is_admin,
            is_superuser=is_admin
        )
        print(f"Created {role}: {email}")
    else:
        print(f"User {email} already exists.")

# Seed accounts
create_user('admin_boss', 'admin@exotic.com', 'luxury_admin_2026', 'Admin', '1112223333')
create_user('shop_manager', 'manager@exotic.com', 'workshop_care_2026', 'WorkshopManager', '4445556666')
create_user('regular_vip', 'testuser@exotic.com', 'test_pass_123', 'Customer', '7778889999')
