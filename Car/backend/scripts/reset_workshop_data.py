import os
import django
import sys

# Setup django environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from users.models import User
from workshop.models import Workshop

def reset_workshop_managers():
    print("--- Starting Workshop Manager Reset ---")
    
    # 1. Clear current assignments
    print("Clearing current manager assignments...")
    # Since manager is a OneToOneField on Workshop, we can just update those.
    # But wait, User also has managed_workshop related name.
    # We clear the field on Workshop first.
    Workshop.objects.all().update(manager=None)
    
    # 2. Delete existing WorkshopManagers
    print("Deleting existing WorkshopManager accounts...")
    managers_to_delete = User.objects.filter(role='WorkshopManager')
    count = managers_to_delete.count()
    managers_to_delete.delete()
    print(f"Deleted {count} accounts.")
    
    # 3. Define new managers and their targets
    # We use regional names for clarity
    new_managers = [
        {
            "username": "dubai_exec",
            "email": "manager_dubai@exotic.com",
            "workshop_id": 1, # Exotic Motors Global HQ (Dubai)
        },
        {
            "username": "abudhabi_exec",
            "email": "manager_abudhabi@exotic.com",
            "workshop_id": 3, # Precision Technical Hub (Abu Dhabi)
        },
        {
            "username": "riyadh_exec",
            "email": "manager_riyadh@exotic.com",
            "workshop_id": 2, # EM Performance Division (Riyadh)
        }
    ]
    
    password = "LuxuryCar2026!"
    
    print("\nCreating new accounts and assigning them...")
    for data in new_managers:
        user = User.objects.create_user(
            username=data['username'],
            email=data['email'],
            password=password,
            role='WorkshopManager',
            is_verified=True
        )
        
        try:
            ws = Workshop.objects.get(id=data['workshop_id'])
            ws.manager = user
            ws.save()
            print(f"SUCCESS: Assigned {data['email']} to {ws.name}")
        except Workshop.DoesNotExist:
            print(f"ERROR: Workshop ID {data['workshop_id']} not found for {data['email']}")

    print("\n--- Reset Complete ---")
    print(f"Default Password for all: {password}")

if __name__ == "__main__":
    reset_workshop_managers()
