import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- CONFIGURATION ---
# In a real app, use environment variables.
# User will need to fill this in or set ENV vars.
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.environ.get("EMAIL_SENDER", "YOUR_EMAIL@gmail.com")
SENDER_PASSWORD = os.environ.get("EMAIL_PASSWORD", "YOUR_APP_PASSWORD") 
RECIPIENT_EMAIL = os.environ.get("EMAIL_RECIPIENT", "RECIPIENT@gmail.com")

def send_update_email(summary_data):
    """
    summary_data: {
        'new_items': [list of dicts],
        'opening_today': [list of dicts],
        'total_count': int
    }
    """
    new_items = summary_data.get('new_items', [])
    opening_today = summary_data.get('opening_today', [])
    
    if not new_items and not opening_today:
        logging.info("No new items or openings today. Skipping email.")
        return

    subject = f"[WishBunny] Update: {len(opening_today)} Openings, {len(new_items)} New Items"
    
    body = "<h2>🐰 WishBunny Daily Update</h2>"
    
    # Section 1: Opening Today
    if opening_today:
        body += "<h3>🎈 Opening Today (오늘 오픈)</h3><ul>"
        for item in opening_today:
            body += f"<li><b>{item['title']}</b> - {item['price']}원 <br><a href='{item['link']}'>Link</a> ({item['category']})</li>"
        body += "</ul>"
    
    # Section 2: New Items Discovered
    if new_items:
        body += "<h3>✨ New Items Discovered (신규 발견)</h3><ul>"
        for item in new_items[:10]: # Limit to 10 to avoid spamming
            body += f"<li>{item['title']} - {item['price']}원 ({item['date']})</li>"
        if len(new_items) > 10:
            body += f"<li>...and {len(new_items)-10} more.</li>"
        body += "</ul>"
        
    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = RECIPIENT_EMAIL
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    try:
        # Check if config is default
        if "YOUR_EMAIL" in SENDER_EMAIL:
            logging.warning("Email configuration is not set. Skipping email send.")
            print("To enable email, set EMAIL_SENDER, EMAIL_PASSWORD, EMAIL_RECIPIENT environment variables.")
            return

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        
        logging.info(f"Email sent successfully to {RECIPIENT_EMAIL}")
        
    except Exception as e:
        logging.error(f"Failed to send email: {e}")

if __name__ == "__main__":
    # Test
    dummy_data = {
        'new_items': [{'title': 'Test Item', 'price': '1000', 'date': '01.01', 'link': '#', 'category': 'test'}],
        'opening_today': [{'title': 'Opening Item', 'price': '2000', 'date': '02.02', 'link': '#', 'category': 'test'}]
    }
    send_update_email(dummy_data)
