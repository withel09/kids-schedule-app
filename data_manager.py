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
        # Create a lookup dictionary for existing items: link -> record
        history_map = {row['link']: row for row in df_history.to_dict('records')}
    else:
        df_history = pd.DataFrame()
        history_map = {}

    new_items_list = []
    
    # Identify New or Updated Items
    for item in scraped_data:
        link = item['link']
        current_date_str = item['date']
        
        is_new = False
        
        if link not in history_map:
            # Brand new link
            is_new = True
            item['status_note'] = "New Item"
        else:
            # Existing link, check for updates
            old_item = history_map[link]
            old_date_str = str(old_item.get('date', 'N/A'))
            
            # If date changed substantially (and isn't just N/A flickering)
            if current_date_str != "N/A" and current_date_str != old_date_str:
                is_new = True
                item['status_note'] = f"Date Update: {old_date_str} -> {current_date_str}"
        
        if is_new:
            new_items_list.append(item)

    # Identify "Opening Today" Items
    today = datetime.now().date()
    opening_today_list = []
    
    for item in scraped_data:
        s_date, _ = parse_date_range(item['date'])
        if s_date == today:
            opening_today_list.append(item)

    # Update History (Upsert Strategy)
    # 1. Convert scraped data to DataFrame
    df_current_scan = pd.DataFrame(scraped_data)
    
    # 2. Combine with old history, but prioritize new scan for overlapping links
    if not df_history.empty:
        # Filter out old rows that are present in the new scan (to be replaced)
        links_in_current = set(df_current_scan['link'])
        df_history_kept = df_history[~df_history['link'].isin(links_in_current)]
        
        # Combine kept old rows + new scan rows
        df_updated_history = pd.concat([df_history_kept, df_current_scan], ignore_index=True)
    else:
        df_updated_history = df_current_scan

    # Save History
    df_updated_history.to_csv(HISTORY_FILE, index=False, encoding='utf-8-sig')
    
    if new_items_list:
        logging.info(f"Detected {len(new_items_list)} new or updated items.")
    else:
        logging.info("No new or updated items found.")

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
