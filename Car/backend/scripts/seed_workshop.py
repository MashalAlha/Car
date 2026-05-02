import os
import sys
import django

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from workshop.models import ServiceType, Workshop

User = get_user_model()

def get_or_create_manager(username, email):
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'username': username,
            'password': 'workshop_care_2026',
            'role': 'WorkshopManager',
            'is_verified': True
        }
    )
    if created:
        user.set_password('workshop_care_2026')
        user.save()
        print(f"Created Manager: {email}")
    return user

# 1. Create Managers
main_manager = get_or_create_manager('shop_manager', 'manager@exotic.com')
dubai_manager = get_or_create_manager('dubai_manager', 'manager_dubai@exotic.com')
riyadh_manager = get_or_create_manager('riyadh_manager', 'manager_riyadh@exotic.com')

# 2. Create Service Types
services_data = [
    {
        'name': 'Graphene Ceramic Coating',
        'description': 'Ultra-high gloss protection with 9H hardness. Provides 5+ years of paint protection against oxidation and chemical etching.',
        'estimated_duration_hours': 8.0,
        'base_price': 850.00,
        'workshop_category': 'Polishing_Ceramic'
    },
    {
        'name': 'Bespoke ECU Performance Tuning',
        'description': 'Custom engine optimization for maximum horsepower and torque delivery. Dyno-tested and safe for high-performance engines.',
        'estimated_duration_hours': 4.0,
        'base_price': 1200.00,
        'workshop_category': 'Maintenance_Accessories'
    },
    {
        'name': 'Master Technician Maintenance',
        'description': 'Complete inspection and fluid service using genuine OEM components. Essential for maintaining supercar performance.',
        'estimated_duration_hours': 3.0,
        'base_price': 350.00,
        'workshop_category': 'Maintenance_Accessories'
    },
    {
        'name': 'Luxury Interior Restoration',
        'description': 'Deep leather cleaning, conditioning, and steam sterilization. Restoration of Alcantara and Carbon Fiber accents.',
        'estimated_duration_hours': 5.0,
        'base_price': 400.00,
        'workshop_category': 'Polishing_Ceramic'
    },
    {
        'name': 'Precision Geometry & Alignment',
        'description': 'Laser-guided multi-axis wheel alignment optimized for high-speed stability and cornering precision.',
        'estimated_duration_hours': 2.0,
        'base_price': 250.00,
        'workshop_category': 'Diagnostic_Inspection'
    },
    {
        'name': 'Advanced Electronics Diagnostic',
        'description': 'Full scan of all control modules (ECU, TCU, ABS, etc.) using factory-grade diagnostic tools.',
        'estimated_duration_hours': 1.5,
        'base_price': 150.00,
        'workshop_category': 'Diagnostic_Inspection'
    }
]

created_services = []
for s_data in services_data:
    service, created = ServiceType.objects.get_or_create(
        name=s_data['name'],
        defaults=s_data
    )
    created_services.append(service)
    print(f"{'Created' if created else 'Exists'} Service: {service.name}")

# 3. Create Workshop Facilities
workshops_data = [
    {
        'name': 'Exotic Motors Global HQ (Dubai)',
        'working_days': 'Mon - Sat',
        'working_hours': '08:00 - 20:00',
        'category': 'Polishing_Ceramic',
        'service_location_type': 'Both',
        'manager': main_manager,
        'on_site_fee': 50.00,
        'mobile_fee': 150.00
    },
    {
        'name': 'EM Performance Division (Riyadh)',
        'working_days': 'Sun - Thu',
        'working_hours': '09:00 - 18:00',
        'category': 'Maintenance_Accessories',
        'service_location_type': 'Internal',
        'manager': riyadh_manager,
        'on_site_fee': 100.00,
        'mobile_fee': 0.00
    },
    {
        'name': 'Precision Technical Hub (Abu Dhabi)',
        'working_days': 'Mon - Fri',
        'working_hours': '08:00 - 19:00',
        'category': 'Diagnostic_Inspection',
        'service_location_type': 'Both',
        'manager': dubai_manager,
        'on_site_fee': 75.00,
        'mobile_fee': 125.00
    }
]

for w_data in workshops_data:
    manager = w_data.pop('manager')
    # Use update_or_create or filter properly since manager is 1-1
    workshop, created = Workshop.objects.update_or_create(
        manager=manager,
        defaults=w_data
    )
    print(f"{'Created' if created else 'Updated'} Workshop: {workshop.name}")

print("\n✅ Workshop data seeding complete!")
