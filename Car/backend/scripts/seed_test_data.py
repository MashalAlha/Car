import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from cars.models import Car, Purchase, Rental
import datetime

User = get_user_model()

# Get users
admin = User.objects.filter(email='admin@exotic.com').first()
customer = User.objects.filter(email='testuser@exotic.com').first()

if not customer:
    print("Customer account not found. Run seed_test_accounts.py first.")
    exit()

# ── Create Cars ──
cars_data = [
    {
        'make': 'Lamborghini', 'model': 'Aventador SVJ', 'year': 2024,
        'description': 'The ultimate expression of Lamborghini performance. A naturally aspirated V12 masterpiece with active aerodynamics.',
        'price': 517770, 'daily_rent_price': 2500, 'is_for_sale': True, 'is_for_rent': True,
        'image_url': 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=800',
        'specs': {'color': 'Giallo Orion', 'engine': '6.5L V12', '0_to_60mph': '2.8s', 'top_speed': '217 mph'}
    },
    {
        'make': 'Ferrari', 'model': 'F8 Tributo', 'year': 2024,
        'description': 'A twin-turbocharged V8 delivering 710 horsepower. Italian engineering at its finest.',
        'price': 280000, 'daily_rent_price': 1800, 'is_for_sale': True, 'is_for_rent': True,
        'image_url': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800',
        'specs': {'color': 'Rosso Corsa', 'engine': '3.9L Twin-Turbo V8', '0_to_60mph': '2.9s', 'top_speed': '211 mph'}
    },
    {
        'make': 'Porsche', 'model': '911 GT3 RS', 'year': 2024,
        'description': 'Track-bred perfection. A naturally aspirated flat-six producing 518 hp with razor-sharp handling.',
        'price': 225000, 'daily_rent_price': 1200, 'is_for_sale': True, 'is_for_rent': False,
        'image_url': 'https://images.unsplash.com/photo-1503376710356-65bf6e210100?auto=format&fit=crop&q=80&w=800',
        'specs': {'color': 'GT Silver Metallic', 'engine': '4.0L Flat-6', '0_to_60mph': '3.0s', 'top_speed': '196 mph'}
    },
    {
        'make': 'McLaren', 'model': '720S Spider', 'year': 2023,
        'description': 'Open-top supercar thrills with 710PS twin-turbo V8. Retractable roof transforms in just 11 seconds.',
        'price': 310000, 'daily_rent_price': 2000, 'is_for_sale': True, 'is_for_rent': True,
        'image_url': 'https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&q=80&w=800',
        'specs': {'color': 'Papaya Spark', 'engine': '4.0L Twin-Turbo V8', '0_to_60mph': '2.8s', 'top_speed': '212 mph'}
    },
    {
        'make': 'Rolls-Royce', 'model': 'Ghost', 'year': 2024,
        'description': 'The pinnacle of luxury motoring. Whisper-quiet V12 and handcrafted interior. A rolling palace.',
        'price': 350000, 'daily_rent_price': 2200, 'is_for_sale': True, 'is_for_rent': True,
        'image_url': 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=800',
        'specs': {'color': 'Arctic White', 'engine': '6.75L Twin-Turbo V12', '0_to_60mph': '4.6s', 'top_speed': '155 mph'}
    },
    {
        'make': 'Mercedes-Benz', 'model': 'AMG GT 63 S', 'year': 2024,
        'description': 'Four-door coupe with 630 horsepower and drift mode. Raw performance in a grand touring package.',
        'price': 175000, 'daily_rent_price': 900, 'is_for_sale': True, 'is_for_rent': True,
        'image_url': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=800',
        'specs': {'color': 'Obsidian Black', 'engine': '4.0L Bi-Turbo V8', '0_to_60mph': '3.1s', 'top_speed': '195 mph'}
    },
    {
        'make': 'Bentley', 'model': 'Continental GT Speed', 'year': 2023,
        'description': 'The definitive Bentley grand tourer. W12 power wrapped in bespoke British luxury.',
        'price': 290000, 'daily_rent_price': 1500, 'is_for_sale': False, 'is_for_rent': True,
        'image_url': 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&q=80&w=800',
        'specs': {'color': 'Verdant Green', 'engine': '6.0L Twin-Turbo W12', '0_to_60mph': '3.5s', 'top_speed': '208 mph'}
    },
    {
        'make': 'Range Rover', 'model': 'SVAutobiography', 'year': 2024,
        'description': 'The ultimate luxury SUV. Unmatched off-road capability paired with first-class comfort.',
        'price': 210000, 'daily_rent_price': 800, 'is_for_sale': True, 'is_for_rent': True,
        'image_url': 'https://images.unsplash.com/photo-1606611013016-969c19ba27a5?auto=format&fit=crop&q=80&w=800',
        'specs': {'color': 'Santorini Black', 'engine': '5.0L Supercharged V8', '0_to_60mph': '5.0s', 'top_speed': '155 mph'}
    },
]

created_cars = []
for car_data in cars_data:
    specs = car_data.pop('specs')
    car, created = Car.objects.get_or_create(
        make=car_data['make'], 
        model=car_data['model'], 
        year=car_data['year'],
        defaults={**car_data, 'specs': specs}
    )
    created_cars.append(car)
    print(f"{'Created' if created else 'Exists'}: {car}")

# ── Create Rentals for test customer ──
if customer:
    rental_data = [
        {'car': created_cars[0], 'start_date': datetime.date(2026, 4, 10), 'end_date': datetime.date(2026, 4, 15), 'status': 'completed'},
        {'car': created_cars[1], 'start_date': datetime.date(2026, 4, 20), 'end_date': datetime.date(2026, 4, 25), 'status': 'active'},
        {'car': created_cars[3], 'start_date': datetime.date(2026, 5, 1), 'end_date': datetime.date(2026, 5, 5), 'status': 'active'},
    ]
    
    for rd in rental_data:
        days = (rd['end_date'] - rd['start_date']).days
        total = days * rd['car'].daily_rent_price
        rental, created = Rental.objects.get_or_create(
            user=customer,
            car=rd['car'],
            start_date=rd['start_date'],
            end_date=rd['end_date'],
            defaults={'total_price': total, 'status': rd['status']}
        )
        print(f"{'Created' if created else 'Exists'} Rental: {rental}")

    # ── Create a Purchase for test customer ──
    purchase, created = Purchase.objects.get_or_create(
        user=customer,
        car=created_cars[2],
        defaults={'price_paid': created_cars[2].price, 'status': 'completed'}
    )
    if created:
        created_cars[2].is_for_sale = False
        created_cars[2].save()
    print(f"{'Created' if created else 'Exists'} Purchase: {purchase}")

print("\n✅ Test data seeding complete!")
