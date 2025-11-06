#!/usr/bin/env python3
"""
Quick test for the database module.
"""
from database import TUIDatabase
import os

# Test database
test_db = "test_tui.db"

# Remove test database if exists
if os.path.exists(test_db):
    os.remove(test_db)

# Test with context manager
with TUIDatabase(test_db) as db:
    print("✓ Database created successfully")

    # Insert test package
    test_package = {
        "country": "Spain",
        "region": "Mallorca",
        "start_date": "2025-11-20",
        "end_date": "2025-11-27",
        "duration_nights": 7,
        "room_type": "Double Room",
        "food_type": "All Inclusive",
        "hotel_stars": 4,
        "hotel_name": "Test Hotel Paradise",
        "hotel_score": 8.5,
        "starting_price": 599.99,
        "discount_percentage": 15.0,
        "booking_link": "https://www.tui.be/test-link"
    }

    result = db.insert_package(test_package)
    print(f"✓ Package inserted: {result}")

    # Try to insert duplicate
    result2 = db.insert_package(test_package)
    print(f"✓ Duplicate detection works: {not result2}")

    # Get count
    count = db.get_package_count()
    print(f"✓ Package count: {count}")

    assert count == 1, "Expected 1 package"

print("✓ All database tests passed!")

# Cleanup
os.remove(test_db)
print(f"✓ Test database removed")
