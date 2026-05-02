import os
import sys
import django

# Setup django environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Part, PartCategory

def seed_store_items():
    print("--- Starting New Store Items Seeding ---")
    
    # Ensure categories exist (though we checked they do, we can be safe)
    acc_cat, _ = PartCategory.objects.get_or_create(name='Accessories')
    spare_cat, _ = PartCategory.objects.get_or_create(name='Spare Parts')
    ext_cat, _ = PartCategory.objects.get_or_create(name='Exterior Styling')
    perf_cat, _ = PartCategory.objects.get_or_create(name='Performance & Tuning')
    lux_cat, _ = PartCategory.objects.get_or_create(name='Luxury Accessories')

    items = [
        # SPARE PARTS
        {
            "name": "Carbon Ceramic Brake Disc",
            "brand": "Brembo",
            "sku": "BRK-CC-001",
            "description": "Ultra-lightweight carbon ceramic brake disc with yellow caliper. Provides unmatched stopping power and zero brake fade for high-performance track use.",
            "price": 12500.00,
            "stock_quantity": 4,
            "category": perf_cat,
            "image": "parts/brake_disc.png",
            "is_accessory": False,
            "installation_available": True,
            "car_make": "Lamborghini",
            "car_model": "Aventador SVJ"
        },
        {
            "name": "Titanium Performance Exhaust Manifold",
            "brand": "Akrapovič",
            "sku": "EXH-TI-720",
            "description": "High-flow titanium exhaust manifold with heat-treated finish. Reduces backpressure and improves engine sound for McLaren supercars.",
            "price": 8900.00,
            "stock_quantity": 2,
            "category": perf_cat,
            "image": "parts/exhaust.png",
            "is_accessory": False,
            "installation_available": True,
            "car_make": "McLaren",
            "car_model": "720S Spider"
        },
        {
            "name": "GT3 RS Turbocharger Upgrade Kit",
            "brand": "Porsche Performance",
            "sku": "TUR-GT3-RS",
            "description": "Large polished silver turbocharger upgrade kit. Engineered specifically for the 911 GT3 RS to push boundaries on the track.",
            "price": 15000.00,
            "stock_quantity": 1,
            "category": perf_cat,
            "image": "parts/turbo.png",
            "is_accessory": False,
            "installation_available": True,
            "car_make": "Porsche",
            "car_model": "911 GT3 RS"
        },
        {
            "name": "Forged Lightweight Alloy Wheel (21\")",
            "brand": "Vossen",
            "sku": "WHL-FG-21BK",
            "description": "Matte black finish with gold accents. Forged from aerospace-grade aluminum for maximum strength and minimum weight.",
            "price": 3200.00,
            "stock_quantity": 8,
            "category": perf_cat,
            "image": "parts/wheel.png",
            "is_accessory": False,
            "installation_available": True,
            "car_make": "Universal",
            "car_model": "Luxury Performance"
        },
        {
            "name": "Carbon Fiber Rear Diffuser",
            "brand": "Mansory",
            "sku": "EXT-CF-DIFF",
            "description": "High-gloss carbon fiber rear diffuser. Enhances aerodynamics and gives your supercar a more aggressive aesthetic.",
            "price": 4500.00,
            "stock_quantity": 3,
            "category": ext_cat,
            "image": "parts/diffuser.png",
            "is_accessory": False,
            "installation_available": True,
            "car_make": "Lamborghini",
            "car_model": "Huracán"
        },
        
        # ACCESSORIES
        {
            "name": "Italian Leather Key Fob Cover",
            "brand": "Exotic Motors",
            "sku": "ACC-LTH-FOB",
            "description": "Hand-stitched Italian leather with gold accents. Fits most luxury supercar key fobs.",
            "price": 250.00,
            "stock_quantity": 20,
            "category": lux_cat,
            "image": "parts/key_fob.png",
            "is_accessory": True,
            "installation_available": False,
        },
        {
            "name": "Branded Indoor Car Cover",
            "brand": "Exotic Motors",
            "sku": "ACC-CVR-EXO",
            "description": "Premium velvet-lined indoor car cover with gold-printed logo. Tailored for supercar silhouettes.",
            "price": 850.00,
            "stock_quantity": 10,
            "category": acc_cat,
            "image": "parts/car_cover.png",
            "is_accessory": True,
            "installation_available": False,
        },
        {
            "name": "Alcantara Comfort Neck Pillow",
            "brand": "Luxe Automotive",
            "sku": "ACC-ALC-PLW",
            "description": "Black Alcantara neck pillow with red diamond stitching. Provides ergonomic support for long grand tours.",
            "price": 180.00,
            "stock_quantity": 15,
            "category": lux_cat,
            "image": "parts/neck_pillow.png",
            "is_accessory": True,
            "installation_available": False,
        },
        {
            "name": "Matte Carbon Fiber Interior Trim Kit",
            "brand": "Exotic Motors",
            "sku": "ACC-INT-CF",
            "description": "Full replacement interior trim kit in matte carbon fiber. Includes dashboard, console, and door accents.",
            "price": 2800.00,
            "stock_quantity": 5,
            "category": lux_cat,
            "image": "parts/interior_trim.png",
            "is_accessory": True,
            "installation_available": True,
        },
        {
            "name": "Gold-Plated Car Fragrance Diffuser",
            "brand": "Aeterna",
            "sku": "ACC-GLD-FRG",
            "description": "24k gold-plated car fragrance diffuser. Includes three signature scents: Oud, Leather, and Amber.",
            "price": 450.00,
            "stock_quantity": 12,
            "category": lux_cat,
            "image": "parts/fragrance.png",
            "is_accessory": True,
            "installation_available": False,
        },
    ]

    for data in items:
        part, created = Part.objects.get_or_create(
            sku=data['sku'],
            defaults=data
        )
        if created:
            print(f"CREATED: {part.name} ({part.sku})")
        else:
            print(f"EXISTS: {part.name} ({part.sku})")
            # Update data just in case
            for key, value in data.items():
                setattr(part, key, value)
            part.save()

    print("\n--- Seeding Complete ---")

if __name__ == "__main__":
    seed_store_items()
