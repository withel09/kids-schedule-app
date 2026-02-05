import pandas as pd
import os
from datetime import datetime, timedelta
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

    # --- Save History & Excel (Keep this Logic) ---
    df_current_scan = pd.DataFrame(scraped_data)
    if not df_history.empty:
        links_in_current = set(df_current_scan['link'])
        df_history_kept = df_history[~df_history['link'].isin(links_in_current)]
        df_updated_history = pd.concat([df_history_kept, df_current_scan], ignore_index=True)
    else:
        df_updated_history = df_current_scan

    df_updated_history.to_csv(HISTORY_FILE, index=False, encoding='utf-8-sig')
    try:
        df_updated_history.to_excel(EXCEL_FILE, index=False, engine='openpyxl')
        logging.info(f"Saved excel to {EXCEL_FILE}")
    except Exception as e:
        logging.error(f"Failed to save Excel: {e}")

    # --- Dashboard Categorization Logic ---
    today = datetime.now().date()
    
    # Buckets
    bucket_today = []
    bucket_week = []   # Next 7 days
    bucket_month = []  # Rest of this month
    bucket_later = []  # Next month and beyond
    
    # Helper to check if item is effectively new/updated (for highlighting)
    # We already marked 'status_note' above if it was new/updated.
    
    for item in scraped_data:
        s_date, e_date = parse_date_range(item['date'])
        
        # If no valid date, put in 'later' or separate bucket? Let's put in 'later'
        if not s_date:
            bucket_later.append(item)
            continue
            
        # 1. Today
        if s_date == today:
            bucket_today.append(item)
        
        # 2. This Week (Next 7 days, excluding today)
        elif today < s_date <= today + timedelta(days=7):
            bucket_week.append(item)
            
        # 3. This Month (Rest of current month)
        elif s_date.year == today.year and s_date.month == today.month:
            bucket_month.append(item)
            
        # 4. Later
        else:
            bucket_later.append(item)

    # Sort buckets by date
    def date_sorter(x):
        d, _ = parse_date_range(x['date'])
        return d if d else datetime.max.date()

    bucket_today.sort(key=date_sorter)
    bucket_week.sort(key=date_sorter)
    bucket_month.sort(key=date_sorter)
    bucket_later.sort(key=date_sorter)

    return {
        'opening_today': bucket_today,
        'opening_this_week': bucket_week,
        'opening_this_month': bucket_month,
        'upcoming_later': bucket_later,
        'total_count': len(scraped_data),
        'new_items_count': len(new_items_list) # Just for logging/headers
    }
