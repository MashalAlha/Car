import os
import shutil
from decimal import Decimal
from django.core.files import File
from store.models import Part

SEEDS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "seeds/images")
MEDIA_DIR = "media/parts"

if not os.path.exists(MEDIA_DIR):
    os.makedirs(MEDIA_DIR)

# Data Structure: (Name, Brand, SKU, Price, Stock, Fitment_Make, Fitment_Model, Fitment_Year, Description, IsAccessory, ImageFile)
seed_data = [
    # Accessories
    ("Carbon Fiber Rear Wing", "Mansory", "XMS-911-CF-01", 4500.00, 5, "Porsche", "911", 2024, "Ultra-lightweight aerospace grade carbon fiber wing for maximum aerodynamic downforce and aggressive aesthetic appeal.", True, "carbon_wing_spoiler_1776589428790.png"),
    ("Alcantara Steering Wheel", "Bespoke", "XMS-SW-ALC-UNI", 1200.00, 10, "Universal", "Exotic", 2024, "Hand-stitched Italian Alcantara with integrated paddle shifters and carbon fiber trim.", True, "alcantara_steering_wheel_1776589449061.png"),
    ("Gold-Plated Key Fob Case", "Caviar", "XMS-KF-GOLD-SF90", 850.00, 3, "Ferrari", "SF90", 2023, "24k gold-plated executive key case with precision engraving and jewelry-grade finish.", True, "gold_key_fob_case_1776589470612.png"),
    ("Titanium Exhaust Tips", "Akrapovič", "XMS-TX-TIP-HUR", 1800.00, 8, "Lamborghini", "Huracan", 2022, "Heat-treated titanium tips with blue-fire finish. Enhanced acoustics and thermal resistance.", True, "titanium_exhaust_tips_1776589545936.png"),
    ("Exclusive Travel Luggage Set", "Louis Vuitton x EM", "XMS-LV-SET-EVO", 12500.00, 2, "Universal", "Luxury", 2024, "Leather-bound travel set custom-fitted for the trunks of modern exotic grand tourers.", True, "luxury_luggage_set_1776589566774.png"),
    
    # Spare Parts
    ("Ceramic Brake Pads (Front Set)", "Brembo", "XMS-BP-CER-488", 1400.00, 15, "Ferrari", "488", 2019, "High-performance carbon-ceramic brake pads for superior stopping power and zero fade.", False, "ceramic_brake_pads_1776589583286.png"),
    ("High-Flow Air Filter", "K&N Performance", "XMS-AF-HF-ADV", 250.00, 20, "Lamborghini", "Aventador", 2021, "Direct-replacement high-flow filters for optimized induction and increased throttle response.", False, "performance_air_filter_1776589715431.png"),
    ("Performance Fuel Injectors", "Bosch", "XMS-FI-HP-992", 900.00, 12, "Porsche", "911", 2024, "Precision-engineered fuel injectors for consistent delivery and optimized atomization at peak RPM.", False, "performance_injectors_1776589734055.png"),
    ("LED Headlight (Left)", "OEM Performance", "XMS-HL-LED-MC20", 3200.00, 4, "Maserati", "MC20", 2022, "Factory-spec full LED headlight assembly with active cornering support.", False, "maserati_led_headlight_1776589751440.png"),
    ("Carbon Ceramic Brake Rotor", "Surface Transforms", "XMS-CR-CC-P1", 18000.00, 6, "McLaren", "P1", 2014, "Advanced carbon-ceramic rotors as featured on high-level endurance racing configurations.", False, "carbon_ceramic_rotor_1776589771976.png"),
]

print("Starting Store Management Seeding...")

for name, brand, sku, price, stock, make, model, year, desc, is_acc, img_name in seed_data:
    try:
        # Check if already exists
        if Part.objects.filter(sku=sku).exists():
            print(f"Skipping existing item: {name}")
            continue
            
        part = Part(
            name=name,
            brand=brand,
            sku=sku,
            price=Decimal(price),
            stock_quantity=stock,
            car_make=make,
            car_model=model,
            model_year=year,
            description=desc,
            is_accessory=is_acc
        )
        
        # Copy and attach image
        src_path = os.path.join(SEEDS_DIR, img_name)
        if os.path.exists(src_path):
            with open(src_path, 'rb') as f:
                part.image.save(img_name, File(f), save=False)
        else:
            print(f"Warning: Image file not found: {img_name}")
            
        part.save()
        print(f"Successfully indexed: {name}")
        
    except Exception as e:
        print(f"Error seeding {name}: {str(e)}")

print("Seeding Complete.")
