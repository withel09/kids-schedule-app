import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- CONFIGURATION ---
# In a real app, use environment variables.
# User will need to fill this in or set ENV vars.
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL = os.environ.get("EMAIL_SENDER", "withel09@gmail.com")
SENDER_PASSWORD = os.environ.get("EMAIL_PASSWORD", "bypuwouqabgzmcyi") 
RECIPIENT_EMAIL = os.environ.get("EMAIL_RECIPIENT", "withel09@gmail.com")

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

    today_date = datetime.now().strftime("%Y-%m-%d")
    subject = f"[WishBunny] 🐰 {today_date} 일일 브리핑 (오픈: {len(opening_today)}건)"
    
    body = f"""
    <html>
    <head>
        <style>
            body {{ font-family: sans-serif; line-height: 1.6; color: #333; }}
            h2 {{ color: #e91e63; border-bottom: 2px solid #e91e63; padding-bottom: 10px; }}
            h3 {{ background-color: #fce4ec; padding: 5px 10px; border-radius: 5px; margin-top: 20px; }}
            .item {{ margin-bottom: 10px; padding: 10px; border: 1px solid #eee; border-radius: 5px; }}
            .price {{ color: #e91e63; font-weight: bold; }}
            .date {{ color: #666; font-size: 0.9em; }}
            .link {{ text-decoration: none; color: #2196f3; font-weight: bold; }}
            .category-tag {{ background: #eee; padding: 2px 6px; border-radius: 3px; font-size: 0.8em; margin-right: 5px; }}
        </style>
    </head>
    <body>
    <h2>📅 오늘 오픈 ({len(opening_today)}건)</h2>
    """

    if opening_today:
        for item in opening_today:
            body += f"""
            <div class='item' style='border-left: 5px solid #e91e63;'>
                <span class='category-tag'>[{item['category'].upper()}]</span>
                <b>{item['title']}</b><br>
                <span class='price'>{item['price']}원</span> | <span class='date'>{item['date']}</span><br>
                👉 <a href='{item['link']}' class='link'>지금 구매하러 가기</a>
            </div>
            """
    else:
        body += "<p>오늘은 오픈하는 상품이 없습니다. 😴</p>"

    # Group ALL items (new_items + existing recent updates if passed) by Category
    # For this report, we use 'new_items' as the "Checklist" or we could pass full list if needed.
    # User asked for "Monthly Schedule by Category". 
    # Since we only receive 'new_items' here usually, let's assume 'new_items' represents the schedule we found.
    # To show EVERYTHING found (schedule), we might need to pass the full list.
    # However, let's stick to 'new_items' (Updates) first to avoid massive spam, unless instructed otherwise.
    # But user said "Monthly Schedule", implies seeing future dates.
    
    # Let's organize 'new_items' by category.
    items_by_cat = {}
    for item in new_items:
        cat = item['category']
        if cat not in items_by_cat:
            items_by_cat[cat] = []
        items_by_cat[cat].append(item)

    body += "<h2>🗓️ 월별/카테고리별 전체 일정 (업데이트)</h2>"
    
    if items_by_cat:
        for cat, items in items_by_cat.items():
            body += f"<h3>📂 {cat.upper()}</h3>"
            for item in items:
                status_note = item.get('status_note', 'Start')
                note_html = f" <span style='color:red; font-size:0.8em;'>({status_note})</span>" if status_note else ""
                
                body += f"""
                <div class='item'>
                    <b>{item['title']}</b>{note_html}<br>
                    🗓️ <span class='date'>{item['date']}</span> | 💰 {item['price']}원<br>
                    🔗 <a href='{item['link']}'>링크 확인</a>
                </div>
                """
    else:
         body += "<p>새롭게 업데이트된 일정이 없습니다.</p>"
         
    body += """
    <hr>
    <p style='color: #999; font-size: 0.8em; text-align: center;'>
        WishBunny Secretary by Jason (Connect AI LAB)<br>
        24시간 자동 감시 중입니다.
    </p>
    </body></html>
    """
    
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
