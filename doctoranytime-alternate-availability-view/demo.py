#!/usr/bin/env python3
"""
Demo script to populate sample availability data without actual web scraping.
This is useful for testing the database and HTML generation functionality.
"""

import sqlite3
from datetime import datetime, timedelta
import random
import sys
import os

# Add current directory to path to import from scraper
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def create_sample_data(db_path='availability.db', language='fr'):
    """Create sample availability data for demonstration."""

    print("Creating sample availability data...")
    print("=" * 50)

    # Create connection
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create tables
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS specialists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            specialty TEXT,
            url TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            specialist_id INTEGER,
            service_name TEXT NOT NULL,
            service_duration TEXT,
            service_price TEXT,
            FOREIGN KEY (specialist_id) REFERENCES specialists(id),
            UNIQUE(specialist_id, service_name)
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS availability (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            service_id INTEGER,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            booking_link TEXT,
            scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (service_id) REFERENCES services(id),
            UNIQUE(service_id, date, time)
        )
    ''')

    # Clear existing data
    cursor.execute('DELETE FROM availability')
    cursor.execute('DELETE FROM services')
    cursor.execute('DELETE FROM specialists')

    # Insert sample specialist
    specialist_info = {
        'name': 'Elena Trifan',
        'specialty': 'Kinésithérapeute' if language == 'fr' else 'Kinesitherapeut' if language == 'nl' else 'Physiotherapist',
        'url': 'https://www.doctoranytime.be/d/kinesitherapeute/elena-trifan'
    }

    cursor.execute('''
        INSERT INTO specialists (name, specialty, url)
        VALUES (?, ?, ?)
    ''', (specialist_info['name'], specialist_info['specialty'], specialist_info['url']))

    specialist_id = cursor.lastrowid
    print(f"Created specialist: {specialist_info['name']} - {specialist_info['specialty']}")

    # Insert sample service
    service_info = {
        'name': 'Consultation de kinésithérapie' if language == 'fr' else 'Kinesitherapie consultatie' if language == 'nl' else 'Physiotherapy Consultation',
        'duration': '30 min',
        'price': '€45'
    }

    cursor.execute('''
        INSERT INTO services (specialist_id, service_name, service_duration, service_price)
        VALUES (?, ?, ?, ?)
    ''', (specialist_id, service_info['name'], service_info['duration'], service_info['price']))

    service_id = cursor.lastrowid
    print(f"Created service: {service_info['name']} ({service_info['duration']}) - {service_info['price']}")

    # Generate sample availability for next 3 months
    print("\nGenerating availability data for next 3 months...")

    start_date = datetime.now()
    end_date = start_date + timedelta(days=90)

    # Time slots available (e.g., working hours)
    time_slots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30'
    ]

    current_date = start_date
    total_slots = 0

    while current_date <= end_date:
        # Skip Sundays
        if current_date.weekday() == 6:
            current_date += timedelta(days=1)
            continue

        # Randomly decide if this day has availability (70% chance)
        if random.random() > 0.3:
            # Randomly select how many slots are available (3-10 slots per day)
            num_slots = random.randint(3, 10)
            available_slots = random.sample(time_slots, num_slots)

            for time_slot in sorted(available_slots):
                booking_link = f"{specialist_info['url']}?date={current_date.strftime('%Y-%m-%d')}&time={time_slot.replace(':', '')}"

                cursor.execute('''
                    INSERT INTO availability (service_id, date, time, booking_link)
                    VALUES (?, ?, ?, ?)
                ''', (service_id, current_date.strftime('%Y-%m-%d'), time_slot, booking_link))

                total_slots += 1

        current_date += timedelta(days=1)

    conn.commit()
    conn.close()

    print(f"\nGenerated {total_slots} available time slots")
    print(f"Database saved to: {db_path}")
    print("=" * 50)

    return db_path


def generate_html_report(db_path='availability.db', output_file='availability_report.html', language='fr'):
    """Generate HTML report from the database."""

    print("\nGenerating HTML report...")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Get all data
    cursor.execute('''
        SELECT
            s.name as specialist_name,
            s.specialty,
            s.url,
            sv.service_name,
            sv.service_duration,
            sv.service_price,
            a.date,
            a.time,
            a.booking_link,
            a.scraped_at
        FROM availability a
        JOIN services sv ON a.service_id = sv.id
        JOIN specialists s ON sv.specialist_id = s.id
        ORDER BY a.date, a.time
    ''')

    rows = cursor.fetchall()

    if not rows:
        print("No data found in database")
        conn.close()
        return

    # Group by date
    dates_dict = {}
    specialist_name = rows[0][0]
    specialty = rows[0][1]
    profile_url = rows[0][2]
    service_name = rows[0][3]
    service_duration = rows[0][4]
    service_price = rows[0][5]

    for row in rows:
        date = row[6]
        time_slot = row[7]
        booking_link = row[8]

        if date not in dates_dict:
            dates_dict[date] = []

        dates_dict[date].append({
            'time': time_slot,
            'link': booking_link
        })

    # Language-specific text
    lang_text = {
        'fr': {
            'title': 'Rapport de Disponibilité',
            'service': 'Service',
            'generated': 'Rapport généré',
            'language': 'Langue',
            'summary': 'Résumé',
            'total_dates': 'Total de dates disponibles',
            'total_slots': 'Total de créneaux horaires',
            'footer': 'Généré par DoctorAnytime Availability Scraper',
            'data_from': 'Données extraites de'
        },
        'nl': {
            'title': 'Beschikbaarheidsrapport',
            'service': 'Dienst',
            'generated': 'Rapport gegenereerd',
            'language': 'Taal',
            'summary': 'Samenvatting',
            'total_dates': 'Totaal beschikbare data',
            'total_slots': 'Totaal tijdslots',
            'footer': 'Gegenereerd door DoctorAnytime Availability Scraper',
            'data_from': 'Gegevens geëxtraheerd van'
        },
        'en': {
            'title': 'Availability Report',
            'service': 'Service',
            'generated': 'Report Generated',
            'language': 'Language',
            'summary': 'Summary',
            'total_dates': 'Total Available Dates',
            'total_slots': 'Total Time Slots',
            'footer': 'Generated by DoctorAnytime Availability Scraper',
            'data_from': 'Data scraped from'
        }
    }

    text = lang_text.get(language, lang_text['en'])

    # Day names in different languages
    day_names = {
        'fr': ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'],
        'nl': ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'],
        'en': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }

    month_names = {
        'fr': ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
               'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
        'nl': ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
               'juli', 'augustus', 'september', 'oktober', 'november', 'december'],
        'en': ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December']
    }

    # Generate HTML
    html = f'''<!DOCTYPE html>
<html lang="{language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{text['title']} - {specialist_name}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }}

        .container {{
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }}

        header {{
            border-bottom: 3px solid #667eea;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}

        h1 {{
            color: #667eea;
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
        }}

        .subtitle {{
            color: #666;
            font-size: 1.3em;
            font-weight: 500;
        }}

        .meta {{
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            border-left: 5px solid #667eea;
        }}

        .meta p {{
            margin: 8px 0;
            font-size: 1.05em;
        }}

        .meta strong {{
            color: #667eea;
        }}

        .summary {{
            background: linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%);
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
            border-left: 5px solid #667eea;
        }}

        .summary h2 {{
            color: #4c51bf;
            margin-bottom: 15px;
            font-size: 1.8em;
        }}

        .summary p {{
            font-size: 1.1em;
            margin: 8px 0;
        }}

        .date-section {{
            margin-bottom: 35px;
            border: 2px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            transition: transform 0.3s;
        }}

        .date-section:hover {{
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
        }}

        .date-header {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 18px 25px;
            font-size: 1.3em;
            font-weight: 600;
            display: flex;
            align-items: center;
        }}

        .date-header::before {{
            content: '📅';
            margin-right: 12px;
            font-size: 1.4em;
        }}

        .time-slots {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            gap: 12px;
            padding: 25px;
            background: #fafafa;
        }}

        .time-slot {{
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 15px;
            text-align: center;
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            text-decoration: none;
            color: #333;
            font-weight: 600;
            font-size: 1.1em;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }}

        .time-slot::before {{
            content: '🕐';
            margin-right: 8px;
            font-size: 1.2em;
        }}

        .time-slot::after {{
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
        }}

        .time-slot:hover {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: #667eea;
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
        }}

        .time-slot:hover::after {{
            left: 100%;
        }}

        .stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }}

        .stat-card {{
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }}

        .stat-number {{
            font-size: 2.5em;
            font-weight: 700;
            margin-bottom: 5px;
        }}

        .stat-label {{
            font-size: 1em;
            opacity: 0.9;
        }}

        footer {{
            margin-top: 50px;
            padding-top: 25px;
            border-top: 2px solid #e2e8f0;
            text-align: center;
            color: #666;
            font-size: 0.95em;
        }}

        footer a {{
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
        }}

        footer a:hover {{
            text-decoration: underline;
        }}

        @media (max-width: 768px) {{
            .time-slots {{
                grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
                gap: 10px;
                padding: 15px;
            }}

            .container {{
                padding: 20px;
            }}

            h1 {{
                font-size: 2em;
            }}

            .stat-card {{
                padding: 15px;
            }}

            .stat-number {{
                font-size: 2em;
            }}
        }}

        @keyframes fadeIn {{
            from {{
                opacity: 0;
                transform: translateY(20px);
            }}
            to {{
                opacity: 1;
                transform: translateY(0);
            }}
        }}

        .date-section {{
            animation: fadeIn 0.5s ease-out;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>{specialist_name}</h1>
            <p class="subtitle">{specialty}</p>
        </header>

        <div class="meta">
            <p><strong>{text['service']}:</strong> {service_name} ({service_duration}) - {service_price}</p>
            <p><strong>{text['generated']}:</strong> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p><strong>{text['language']}:</strong> {language.upper()}</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">{len(dates_dict)}</div>
                <div class="stat-label">{text['total_dates']}</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">{len(rows)}</div>
                <div class="stat-label">{text['total_slots']}</div>
            </div>
        </div>

        <div class="availability">
'''

    # Add date sections
    for date, slots in sorted(dates_dict.items()):
        # Format date nicely
        try:
            date_obj = datetime.strptime(date, '%Y-%m-%d')
            day_name = day_names[language][date_obj.weekday()]
            month_name = month_names[language][date_obj.month - 1]
            formatted_date = f"{day_name.capitalize()}, {date_obj.day} {month_name} {date_obj.year}"
        except:
            formatted_date = date

        html += f'''
            <div class="date-section">
                <div class="date-header">{formatted_date}</div>
                <div class="time-slots">
'''

        for slot in sorted(slots, key=lambda x: x['time']):
            html += f'''                    <a href="{slot['link']}" class="time-slot" target="_blank">{slot['time']}</a>
'''

        html += '''                </div>
            </div>
'''

    html += f'''        </div>

        <footer>
            <p><strong>{text['footer']}</strong></p>
            <p>{text['data_from']} <a href="{profile_url}" target="_blank">{profile_url}</a></p>
        </footer>
    </div>
</body>
</html>'''

    # Write to file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(html)

    conn.close()

    print(f"HTML report generated: {output_file}")
    print("=" * 50)


def main():
    """Main demo function."""
    import argparse

    parser = argparse.ArgumentParser(description='Generate demo availability data')
    parser.add_argument('--language', '-l', choices=['fr', 'nl', 'en'], default='fr',
                       help='Language for demo data (default: fr)')
    parser.add_argument('--output', '-o', default='availability_report.html',
                       help='Output HTML file (default: availability_report.html)')

    args = parser.parse_args()

    print("\nDoctorAnytime Availability Scraper - DEMO MODE")
    print("=" * 50)
    print("This demo creates sample availability data without web scraping")
    print("=" * 50)
    print()

    # Create sample data
    db_path = create_sample_data(language=args.language)

    # Generate HTML report
    generate_html_report(db_path=db_path, output_file=args.output, language=args.language)

    print(f"\nDemo complete! Open '{args.output}' in your browser to view the report.")
    print()


if __name__ == '__main__':
    main()
