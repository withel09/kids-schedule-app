import pandas as pd
import os
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

HISTORY_FILE = "wishbunny_history.csv"
EXCEL_FILE = "wishbunny_latest.xlsx"

def parse_date_range(date_str):
    """
    Parses '02.02 ~ 02.04' or '01.30' into start and end datetime objects.
    Assumes current year (2026 based on context).
    Returns (start_date, end_date) or (None, None).
    """
    if not date_str or date_str == "N/A":
        return None, None
    
    try:
        current_year = datetime.now().year
        # Handle single date '01.30'
        if "~" not in date_str:
            start_str = date_str.strip()
            end_str = date_str.strip()
        else:
            parts = date_str.split("~")
            start_str = parts[0].strip()
            end_str = parts[1].strip()
            
        start_date = datetime.strptime(f"{current_year}.{start_str}", "%Y.%m.%d").date()
        end_date = datetime.strptime(f"{current_year}.{end_str}", "%Y.%m.%d").date()
        
        return start_date, end_date
    except Exception as e:
        # logging.warning(f"Date parse error for '{date_str}': {e}")
        return None, None

def process_data(scraped_data):
    """
    scraped_data: List of dicts
    Returns: 
        summary (dict): {
            'new_items': [], 
            'opening_today': [],
            'total_count': int
        }
    """
    if not scraped_data:
        logging.warning("No data to process.")
        return {'new_items': [], 'opening_today': [], 'total_count': 0}

    # Convert to DataFrame
    df_new = pd.DataFrame(scraped_data)
    
    # Load History
    if os.path.exists(HISTORY_FILE):
        df_history = pd.read_csv(HISTORY_FILE)
        existing_links = set(df_history['link'])
    else:
        df_history = pd.DataFrame()
        existing_links = set()

    # Identify New Items
    new_items_mask = ~df_new['link'].isin(existing_links)
    df_new_items = df_new[new_items_mask]
    new_items_list = df_new_items.to_dict('records')

    # Identify "Opening Today" Items
    today = datetime.now().date()
    opening_today_list = []
    
    for item in scraped_data:
        s_date, _ = parse_date_range(item['date'])
        if s_date == today:
            opening_today_list.append(item)

    # Allow partial matches for "almost today" if scraping time zone differs slightly, 
    # but strict equality is safer for "Opening Today".
    
    # Update History
    # We want to keep the LATEST info for each link, but if it exists, maybe just update price/date?
    # For simplicity, we append NEW items to history. 
    # To handle checks for updates on existing items, we would need more complex logic.
    # For now, just accumulation of NEW links.
    
    if not df_new_items.empty:
        df_updated_history = pd.concat([df_history, df_new_items], ignore_index=True)
        # Use utf-8-sig for Excel compatibility on Mac/Windows
        df_updated_history.to_csv(HISTORY_FILE, index=False, encoding='utf-8-sig')
        logging.info(f"Appended {len(df_new_items)} new items to history.")
    else:
        df_updated_history = df_history
        # Ensure we re-save with correct encoding even if no new items, just in case
        df_updated_history.to_csv(HISTORY_FILE, index=False, encoding='utf-8-sig')
        logging.info("No new items to append.")

    # Save User-Friendly Excel
    try:
        # Explicitly use openpyxl engine
        df_updated_history.to_excel(EXCEL_FILE, index=False, engine='openpyxl')
        logging.info(f"Saved excel to {EXCEL_FILE}")
    except Exception as e:
        logging.error(f"Failed to save Excel: {e}")

    return {
        'new_items': new_items_list,
        'opening_today': opening_today_list,
        'total_count': len(scraped_data)
    }
