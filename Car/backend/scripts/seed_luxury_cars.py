import os
import sys
import django

# Setup django environment
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from cars.models import Car, CarImage

def seed_luxury_cars():
    print("--- Starting Luxury Cars Seeding ---")
    
    luxury_cars = [
        {
            'make': 'Mercedes-Benz',
            'model': 'AMG GT Black Series',
            'year': 2024,
            'description': 'The most powerful AMG V8 series engine of all time. A track beast with a Magno Orange finish and extreme aerodynamics.',
            'body_type': 'Coupe',
            'category_tier': 'Performance',
            'price': 450000.00,
            'daily_rent_price': 3500.00,
            'is_for_sale': True,
            'is_for_rent': True,
            'image_url': '/media/cars/mercedes_amg_gt.png',
            'specs': {
                'engine': '4.0L V8 Biturbo',
                'horsepower': '720 hp',
                '0_to_60mph': '3.1s',
                'top_speed': '202 mph',
                'color': 'Magno Orange'
            }
        },
        {
            'make': 'BMW',
            'model': 'M4 Competition (G82)',
            'year': 2024,
            'description': 'Pure performance and bold design. Featuring the iconic Isle of Man Green metallic finish and M xDrive.',
            'body_type': 'Coupe',
            'category_tier': 'Performance',
            'price': 95000.00,
            'daily_rent_price': 850.00,
            'is_for_sale': True,
            'is_for_rent': True,
            'image_url': '/media/cars/bmw_m4.png',
            'specs': {
                'engine': '3.0L Straight-6 M TwinPower Turbo',
                'horsepower': '503 hp',
                '0_to_60mph': '3.4s',
                'top_speed': '180 mph',
                'color': 'Isle of Man Green'
            }
        },
        {
            'make': 'Mercedes-Benz',
            'model': 'G63 AMG',
            'year': 2024,
            'description': 'The legendary G-Wagon in stunning white. Rugged off-road capability meets unparalleled luxury and status.',
            'body_type': 'SUV',
            'category_tier': 'Luxury',
            'price': 220000.00,
            'daily_rent_price': 1500.00,
            'is_for_sale': True,
            'is_for_rent': True,
            'image_url': '/media/cars/mercedes_g63.png',
            'specs': {
                'engine': '4.0L V8 Biturbo',
                'horsepower': '577 hp',
                '0_to_60mph': '4.5s',
                'top_speed': '149 mph',
                'color': 'Diamond White'
            }
        },
        {
            'make': 'BMW',
            'model': 'X7 M60i',
            'year': 2024,
            'description': 'The ultimate luxury SUV from BMW. Seven seats of pure comfort powered by an M-tuned V8 engine.',
            'body_type': 'SUV',
            'category_tier': 'Luxury',
            'price': 135000.00,
            'daily_rent_price': 950.00,
            'is_for_sale': True,
            'is_for_rent': True,
            'image_url': '/media/cars/bmw_x7.png',
            'specs': {
                'engine': '4.4L V8 M TwinPower Turbo',
                'horsepower': '523 hp',
                '0_to_60mph': '4.7s',
                'top_speed': '155 mph',
                'color': 'Black Sapphire'
            }
        },
        {
            'make': 'Mercedes-Benz',
            'model': 'S580 Luxury',
            'year': 2024,
            'description': 'A two-tone masterpiece of elegance. The S-Class remains the world standard for luxury sedans.',
            'body_type': 'Sedan',
            'category_tier': 'Luxury',
            'price': 185000.00,
            'daily_rent_price': 1200.00,
            'is_for_sale': True,
            'is_for_rent': True,
            'image_url': '/media/cars/mercedes_s580.png',
            'specs': {
                'engine': '4.0L V8 Biturbo with EQ Boost',
                'horsepower': '496 hp',
                '0_to_60mph': '4.4s',
                'top_speed': '130 mph',
                'color': 'High-Tech Silver / Obsidian Black'
            }
        },
        {
            'make': 'BMW',
            'model': 'M5 CS',
            'year': 2023,
            'description': 'The quickest and most powerful BMW production car ever. Finished in Frozen Deep Green with gold accents.',
            'body_type': 'Sedan',
            'category_tier': 'Performance',
            'price': 190000.00,
            'daily_rent_price': 1800.00,
            'is_for_sale': True,
            'is_for_rent': True,
            'image_url': '/media/cars/bmw_m5_cs.png',
            'specs': {
                'engine': '4.4L V8 M TwinPower Turbo',
                'horsepower': '627 hp',
                '0_to_60mph': '2.9s',
                'top_speed': '190 mph',
                'color': 'Frozen Deep Green'
            }
        },
    ]

    for car_data in luxury_cars:
        image_path = car_data.pop('image_url')
        car, created = Car.objects.update_or_create(
            make=car_data['make'],
            model=car_data['model'],
            year=car_data['year'],
            defaults=car_data
        )
        
        # Create or update CarImage
        car_image, image_created = CarImage.objects.get_or_create(
            car=car,
            image=image_path.replace('/media/', ''), # CarImage.image is a FileField, expects relative to media root
            defaults={'is_primary': True}
        )
        
        # Sync back the image_url for legacy support
        car.image_url = image_path
        car.save()

        if created:
            print(f"CREATED: {car}")
        else:
            print(f"UPDATED: {car}")

    print("\n--- Luxury Cars Seeding Complete ---")

if __name__ == "__main__":
    seed_luxury_cars()
