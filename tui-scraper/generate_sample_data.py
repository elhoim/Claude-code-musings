#!/usr/bin/env python3
"""
Generate sample vacation package data for testing.
This is useful when actual scraping is not possible due to environment limitations.
"""
import random
from datetime import datetime, timedelta
from database import TUIDatabase


# Sample data pools
COUNTRIES = [
    'Spain', 'Greece', 'Turkey', 'Egypt', 'Tunisia', 'Morocco',
    'Portugal', 'Italy', 'Cyprus', 'Cape Verde', 'Dominican Republic',
    'Mexico', 'Thailand', 'Maldives', 'Mauritius', 'Cuba'
]

REGIONS = {
    'Spain': ['Mallorca', 'Ibiza', 'Tenerife', 'Gran Canaria', 'Costa Brava', 'Costa del Sol', 'Lanzarote'],
    'Greece': ['Crete', 'Rhodes', 'Kos', 'Corfu', 'Santorini', 'Mykonos', 'Zakynthos'],
    'Turkey': ['Antalya', 'Bodrum', 'Marmaris', 'Fethiye', 'Side', 'Alanya'],
    'Egypt': ['Hurghada', 'Sharm El Sheikh', 'Marsa Alam', 'Cairo'],
    'Tunisia': ['Hammamet', 'Monastir', 'Djerba', 'Sousse'],
    'Morocco': ['Agadir', 'Marrakech', 'Essaouira', 'Casablanca'],
    'Portugal': ['Algarve', 'Madeira', 'Lisbon', 'Porto'],
    'Italy': ['Sicily', 'Sardinia', 'Amalfi Coast', 'Tuscany'],
    'Cyprus': ['Paphos', 'Limassol', 'Ayia Napa', 'Larnaca'],
    'Cape Verde': ['Sal', 'Boa Vista', 'Santiago'],
    'Dominican Republic': ['Punta Cana', 'Puerto Plata', 'La Romana'],
    'Mexico': ['Cancun', 'Riviera Maya', 'Playa del Carmen', 'Cozumel'],
    'Thailand': ['Phuket', 'Krabi', 'Koh Samui', 'Bangkok'],
    'Maldives': ['North Male Atoll', 'South Male Atoll', 'Ari Atoll'],
    'Mauritius': ['Grand Baie', 'Flic en Flac', 'Belle Mare'],
    'Cuba': ['Varadero', 'Havana', 'Cayo Coco', 'Holguin']
}

HOTEL_PREFIXES = [
    'Hotel', 'Resort', 'Grand Hotel', 'Beach Resort', 'Luxury Hotel',
    'Paradise Hotel', 'Royal Hotel', 'Sunset Resort', 'Ocean View Hotel'
]

HOTEL_SUFFIXES = [
    'Beach', 'Paradise', 'Palace', 'Bay', 'Garden', 'Lagoon',
    'Oasis', 'Vista', 'Club', 'Spa & Resort', 'All Inclusive'
]

ROOM_TYPES = [
    'Standard Room', 'Double Room', 'Superior Room', 'Deluxe Room',
    'Family Room', 'Suite', 'Junior Suite', 'Bungalow', 'Villa'
]

FOOD_TYPES = [
    'Bed & Breakfast', 'Half Board', 'Full Board', 'All Inclusive',
    'Ultra All Inclusive', 'Room Only'
]


def generate_hotel_name(region):
    """Generate a realistic hotel name."""
    prefix = random.choice(HOTEL_PREFIXES)
    suffix = random.choice(HOTEL_SUFFIXES)

    # Sometimes include the region name
    if random.random() > 0.5:
        return f"{prefix} {region} {suffix}"
    else:
        return f"{prefix} {suffix}"


def generate_package(start_date, duration_nights):
    """Generate a single vacation package."""
    country = random.choice(COUNTRIES)
    region = random.choice(REGIONS[country])
    hotel_name = generate_hotel_name(region)

    end_date = start_date + timedelta(days=duration_nights)

    # Generate price based on destination and duration
    base_price = random.uniform(400, 2500)
    price_factor = 1.0

    # Adjust price based on destination
    if country in ['Maldives', 'Mauritius', 'Dominican Republic', 'Mexico', 'Thailand']:
        price_factor *= 1.5
    elif country in ['Spain', 'Greece', 'Turkey']:
        price_factor *= 0.9

    # Adjust price based on duration
    price_factor *= (duration_nights / 7.0)

    starting_price = round(base_price * price_factor, 2)

    # Generate discount (30% of packages have discounts)
    discount_percentage = 0.0
    if random.random() > 0.7:
        discount_percentage = round(random.uniform(5, 35), 0)

    # Hotel stars (3-5 stars)
    hotel_stars = random.choice([3, 3, 4, 4, 4, 5, 5])

    # Hotel score (6.0-10.0, weighted towards higher scores)
    hotel_score = round(random.triangular(6.0, 10.0, 8.5), 1)

    package = {
        'country': country,
        'region': region,
        'start_date': start_date.strftime('%Y-%m-%d'),
        'end_date': end_date.strftime('%Y-%m-%d'),
        'duration_nights': duration_nights,
        'room_type': random.choice(ROOM_TYPES),
        'food_type': random.choice(FOOD_TYPES),
        'hotel_stars': hotel_stars,
        'hotel_name': hotel_name,
        'hotel_score': hotel_score,
        'starting_price': starting_price,
        'discount_percentage': discount_percentage if discount_percentage > 0 else None,
        'booking_link': f'https://www.tui.be/fr/booking/{random.randint(100000, 999999)}'
    }

    return package


def generate_packages_for_date_range(start_date, end_date, target_count=2000):
    """Generate packages for a date range."""
    packages = []

    # Calculate how many dates we have
    date_range = (end_date - start_date).days + 1
    packages_per_date = target_count // date_range

    print(f"Generating {packages_per_date} packages per date across {date_range} dates...")

    current_date = start_date
    while current_date <= end_date:
        # Generate packages for different durations
        durations = [7, 7, 7, 7, 14, 14, 10, 12]  # Weighted towards 7 and 14 nights

        for _ in range(packages_per_date):
            duration = random.choice(durations)
            package = generate_package(current_date, duration)
            packages.append(package)

        current_date += timedelta(days=1)

    # Ensure we hit the target (add a few more if needed)
    while len(packages) < target_count:
        random_date = start_date + timedelta(days=random.randint(0, date_range - 1))
        duration = random.choice([7, 14])
        package = generate_package(random_date, duration)
        packages.append(package)

    return packages[:target_count]


def main():
    """Generate sample data and store in database."""
    import sys

    # Parse arguments
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
    else:
        db_path = "tui-scraper/tui_vacations.db"

    if len(sys.argv) > 2:
        count = int(sys.argv[2])
    else:
        count = 2000

    print("=" * 60)
    print("Sample Vacation Package Data Generator")
    print("=" * 60)
    print(f"Database: {db_path}")
    print(f"Target count: {count}")
    print()

    # Date range: February 2-16, 2026
    start_date = datetime(2026, 2, 2)
    end_date = datetime(2026, 2, 16)

    print(f"Date range: {start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}")
    print()

    # Generate packages
    print("Generating packages...")
    packages = generate_packages_for_date_range(start_date, end_date, count)
    print(f"✓ Generated {len(packages)} packages")
    print()

    # Store in database
    print("Storing in database...")
    with TUIDatabase(db_path) as db:
        saved = 0
        duplicates = 0

        for i, package in enumerate(packages, 1):
            if db.insert_package(package):
                saved += 1
            else:
                duplicates += 1

            if i % 100 == 0:
                print(f"  Progress: {i}/{len(packages)} ({saved} saved, {duplicates} duplicates)")

        print()
        print("=" * 60)
        print(f"✓ Complete!")
        print(f"  Total generated: {len(packages)}")
        print(f"  Saved: {saved}")
        print(f"  Duplicates: {duplicates}")
        print(f"  Database: {db_path}")
        print(f"  Total in database: {db.get_package_count()}")
        print("=" * 60)


if __name__ == "__main__":
    main()
