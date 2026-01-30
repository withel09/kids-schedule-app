from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time

def capture_pages():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    urls = {
        "home": "https://www.wishbunny.me/",
        "category_baby": "https://www.wishbunny.me/drop/category/baby"
    }

    try:
        for name, url in urls.items():
            print(f"Navigating to {url}...")
            driver.get(url)
            time.sleep(5)
            
            output_file = f"wishbunny_{name}.html"
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            print(f"Saved {output_file}")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    capture_pages()
