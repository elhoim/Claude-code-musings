#!/usr/bin/env python3
"""
Query and display vacation packages from the database.
"""
import sqlite3
import sys


def query_database(db_path="tui-scraper/tui_vacations.db"):
    """Query and display sample data from database."""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    print("=" * 80)
    print("TUI Vacation Packages Database")
    print("=" * 80)
    print()

    # Total count
    cursor.execute("SELECT COUNT(*) FROM vacation_packages")
    total = cursor.fetchone()[0]
    print(f"📊 Total packages: {total}")
    print()

    # Date range
    cursor.execute("SELECT MIN(start_date), MAX(start_date) FROM vacation_packages")
    min_date, max_date = cursor.fetchone()
    print(f"📅 Date range: {min_date} to {max_date}")
    print()

    # Price range
    cursor.execute("SELECT MIN(starting_price), MAX(starting_price), AVG(starting_price) FROM vacation_packages")
    min_price, max_price, avg_price = cursor.fetchone()
    print(f"💰 Price range: €{min_price:.2f} - €{max_price:.2f} (avg: €{avg_price:.2f})")
    print()

    # Countries
    cursor.execute("""
        SELECT country, COUNT(*) as count
        FROM vacation_packages
        GROUP BY country
        ORDER BY count DESC
        LIMIT 10
    """)
    print("🌍 Top 10 Countries:")
    for country, count in cursor.fetchall():
        print(f"   {country:20s} {count:4d} packages")
    print()

    # Cheapest packages
    cursor.execute("""
        SELECT hotel_name, country, region, start_date, duration_nights, starting_price, food_type
        FROM vacation_packages
        ORDER BY starting_price ASC
        LIMIT 10
    """)
    print("💎 Top 10 Cheapest Packages:")
    for i, (hotel, country, region, date, nights, price, food) in enumerate(cursor.fetchall(), 1):
        print(f"   {i:2d}. €{price:7.2f} - {hotel[:35]:35s} | {region}, {country}")
        print(f"       {date} ({nights} nights) | {food}")
    print()

    # Best rated packages
    cursor.execute("""
        SELECT hotel_name, country, region, hotel_score, hotel_stars, starting_price
        FROM vacation_packages
        WHERE hotel_score IS NOT NULL
        ORDER BY hotel_score DESC, hotel_stars DESC
        LIMIT 10
    """)
    print("⭐ Top 10 Highest Rated Hotels:")
    for i, (hotel, country, region, score, stars, price) in enumerate(cursor.fetchall(), 1):
        stars_display = '★' * stars
        print(f"   {i:2d}. {score:.1f}/10 {stars_display} - {hotel[:40]:40s}")
        print(f"       {region}, {country} | €{price:.2f}")
    print()

    # Discount packages
    cursor.execute("""
        SELECT COUNT(*)
        FROM vacation_packages
        WHERE discount_percentage IS NOT NULL AND discount_percentage > 0
    """)
    discount_count = cursor.fetchone()[0]
    print(f"🎁 Packages with discounts: {discount_count}")

    if discount_count > 0:
        cursor.execute("""
            SELECT hotel_name, country, starting_price, discount_percentage
            FROM vacation_packages
            WHERE discount_percentage IS NOT NULL AND discount_percentage > 0
            ORDER BY discount_percentage DESC
            LIMIT 5
        """)
        print("   Top 5 Discounts:")
        for hotel, country, price, discount in cursor.fetchall():
            print(f"      -{discount:2.0f}% | €{price:7.2f} - {hotel[:35]:35s} ({country})")

    print()
    print("=" * 80)

    conn.close()


if __name__ == "__main__":
    db_path = sys.argv[1] if len(sys.argv) > 1 else "tui-scraper/tui_vacations.db"
    query_database(db_path)
