from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

def capture_html():
    print("Setting up headless Chrome...")
    chrome_options = Options()
    chrome_options.add_argument("--headless") 
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    # Pretend to be a real user to avoid basic blocking
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        url = "https://www.wishbunny.me/drop"
        print(f"Navigating to {url}...")
        driver.get(url)
        
        # Wait for dynamic content to load (adjust if needed or use WebDriverWait in production)
        print("Waiting for page load...")
        time.sleep(5) 
        
        # Capture source
        html = driver.page_source
        output_file = "wishbunny_full.html"
        
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(html)
            
        print(f"Successfully saved captured HTML to {output_file}")
        
    except Exception as e:
        print(f"Error occurred: {e}")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    capture_html()
