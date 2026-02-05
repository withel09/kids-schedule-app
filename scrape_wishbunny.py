import time
import logging
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

import data_manager
import notifier_email

import urllib3
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

CATEGORIES = [
    "baby", "book", "education", "food", "living", 
    "wash", "beauty", "fashion", "health", "interior", 
    "travel", "pet", "sports", "etc"
]

BASE_URL = "https://www.wishbunny.me"

def setup_driver():
    logging.info("Setting up Headless Chrome...")
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
    
    service = Service(ChromeDriverManager().install())
    return webdriver.Chrome(service=service, options=chrome_options)

def scrape_category(driver, category):
    url = f"{BASE_URL}/drop/category/{category}"
    logging.info(f"Scraping category: {category}")
    
    try:
        driver.get(url)
        # Wait for list items to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "div[role='listitem']"))
        )
        
        # --- Infinite Scroll Logic ---
        last_height = driver.execute_script("return document.body.scrollHeight")
        while True:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(2) # Wait for content to load
            new_height = driver.execute_script("return document.body.scrollHeight")
            if new_height == last_height:
                break # No more content loaded
            last_height = new_height
            logging.info("Scrolled down...")
        # -----------------------------
        
        items = driver.find_elements(By.CSS_SELECTOR, "div[role='listitem']")
        
        scraped_data = []
        for item in items:
            try:
                # Extract Data
                title_el = item.find_element(By.TAG_NAME, "h2")
                link_el = item.find_element(By.TAG_NAME, "a")
                
                title = title_el.text.strip()
                link = link_el.get_attribute("href")
                
                # Try to get price (might be missing or "open scheduled")
                price = "N/A"
                try:
                    price_el = item.find_element(By.CSS_SELECTOR, "footer strong")
                    price = price_el.text.strip()
                except:
                    pass
                
                # Dates
                date_info = "N/A"
                try:
                    date_el = item.find_element(By.CSS_SELECTOR, "header span.text-caption")
                    date_info = date_el.text.strip()
                except:
                    pass

                scraped_data.append({
                    "category": category,
                    "title": title,
                    "price": price,
                    "date": date_info,
                    "link": link
                })
            except Exception as e:
                # logging.warning(f"Failed to parse item: {e}")
                continue
                
        logging.info(f" -> Found {len(scraped_data)} items")
        return scraped_data

    except Exception as e:
        logging.error(f"Error scraping category {category}: {e}")
        return []

def main():
    driver = setup_driver()
    all_products = []
    
    try:
        # Scrape ALL categories
        for cat in CATEGORIES: 
            data = scrape_category(driver, cat)
            all_products.extend(data)
            time.sleep(1) # Polite delay
            
        logging.info(f"Total Scraped: {len(all_products)}")
        
        # --- PROCESS DATA (Storage & Filtering) ---
        summary = data_manager.process_data(all_products)
        
        # --- NOTIFICATION (Email) ---
        # --- NOTIFICATION (Email) ---
        # Always send notification to confirm system is running
        logging.info(f"Sending Notification... (Opening: {len(summary['opening_today'])}, New: {len(summary['new_items'])})")
        notifier_email.send_update_email(summary)
        
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
