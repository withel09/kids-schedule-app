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
    # Unpack buckets
    opening_today = summary_data.get('opening_today', [])
    opening_this_week = summary_data.get('opening_this_week', [])
    opening_this_month = summary_data.get('opening_this_month', [])
    upcoming_later = summary_data.get('upcoming_later', [])
    new_items_count = summary_data.get('new_items_count', 0)
    
    total_relevant = len(opening_today) + len(opening_this_week) + len(opening_this_month)

    today_date = datetime.now().strftime("%Y-%m-%d")
    subject = f"[WishBunny] 🐰 {today_date} 스케줄 브리핑 (오픈: {len(opening_today)}건 | 예정: {len(opening_this_week)}건)"
    
    body = f"""
    <html>
    <head>
        <style>
            body {{ font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; line-height: 1.5; color: #333; }}
            h2 {{ margin-top: 30px; font-size: 1.2em; border-bottom: 2px solid #ddd; padding-bottom: 5px; }}
            .section-today h2 {{ color: #e91e63; border-color: #e91e63; }}
            .section-week h2 {{ color: #2196f3; border-color: #2196f3; }}
            .section-month h2 {{ color: #4caf50; border-color: #4caf50; }}
            
            .item {{ margin-bottom: 12px; padding: 10px; background: #fff; border-radius: 8px; border: 1px solid #eee; }}
            .today-item {{ border-left: 5px solid #e91e63; background: #fff5f8; }}
            .week-item {{ border-left: 5px solid #2196f3; }}
            .month-item {{ border-left: 5px solid #4caf50; }}
            
            .title {{ font-weight: bold; font-size: 1.05em; display: block; margin-bottom: 4px; }}
            .meta {{ font-size: 0.9em; color: #666; }}
            .price {{ color: #d32f2f; font-weight: bold; }}
            .tag {{ display: inline-block; padding: 2px 6px; border-radius: 4px; background: #eee; font-size: 0.75em; margin-right: 5px; vertical-align: middle; }}
            .tag-new {{ background: #ffeb3b; color: #f57f17; font-weight: bold; }}
            
            a.btn {{ display: inline-block; margin-top: 8px; text-decoration: none; background: #333; color: white; padding: 5px 12px; border-radius: 4px; font-size: 0.85em; }}
            .today-item a.btn {{ background: #e91e63; }}
        </style>
    </head>
    <body>
    
    <div style="max-width: 600px; margin: 0 auto;">
        <h1 style="font-size: 1.5em; text-align: center;">📅 WishBunny Daily Schedule</h1>
        <p style="text-align: center; color: #666; font-size: 0.9em;">
            오늘 오픈 {len(opening_today)}건 / 이번 주 {len(opening_this_week)}건 대기 중
        </p>

        <!-- 1. TODAY -->
        <div class="section-today">
            <h2>🚨 오늘 오픈 (Today) - {len(opening_today)}건</h2>
            {_render_items(opening_today, 'today')}
        </div>

        <!-- 2. THIS WEEK -->
        <div class="section-week">
            <h2>🗓️ 이번 주 오픈 (Next 7 Days) - {len(opening_this_week)}건</h2>
            {_render_items(opening_this_week, 'week')}
        </div>

        <!-- 3. THIS MONTH -->
        <div class="section-month">
            <h2>📆 이번 달 나머지 (Month) - {len(opening_this_month)}건</h2>
            {_render_items(opening_this_month, 'month')}
        </div>
        
        <hr style="margin-top: 40px; border: 0; border-top: 1px solid #eee;">
        <p style="text-align: center; color: #999; font-size: 0.8em;">
            Detected {new_items_count} new updates in this scan.<br>
            WishBunny Secretary by Jason
        </p>
    </div>
    </body></html>
    """
    
    msg = MIMEMultipart()
    msg['From'] = SENDER_EMAIL
    msg['To'] = RECIPIENT_EMAIL
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'html'))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SENDER_EMAIL, SENDER_PASSWORD)
            server.send_message(msg)
        logging.info(f"Email sent successfully to {RECIPIENT_EMAIL}")
    except Exception as e:
        logging.error(f"Failed to send email: {e}")

def _render_items(items, style_type):
    if not items:
        return f"<p style='color:#999; font-style:italic;'>일정이 없습니다.</p>"
    
    # Group by Category
    grouped = {}
    for item in items:
        cat = item['category'].upper()
        if cat not in grouped:
            grouped[cat] = []
        grouped[cat].append(item)
    
    html = ""
    # Sort categories for consistency
    for cat in sorted(grouped.keys()):
        # Category Header
        header_color = "#555"
        if style_type == 'today': header_color = "#c2185b" # Dark Pink
        elif style_type == 'week': header_color = "#1976d2" # Dark Blue
        elif style_type == 'month': header_color = "#388e3c" # Dark Green
        
        html += f"""
        <div style="margin-top: 20px; margin-bottom: 10px; border-bottom: 2px solid {header_color}; padding-bottom: 5px;">
            <span style="font-size: 1.2em; font-weight: bold; color: white; background-color: {header_color}; padding: 4px 10px; border-radius: 4px;">
                {cat}
            </span>
        </div>
        """
        
        # Items in this category
        for item in grouped[cat]:
            status_html = ""
            if 'status_note' in item and item['status_note']:
                 status_html = "<span class='tag tag-new'>NEW</span>"
            
            css_class = f"{style_type}-item"
            btn_text = "지금 구매하기" if style_type == 'today' else "일정 확인하기"
            
            html += f"""
            <div class='item {css_class}'>
                <div style="display:flex; justify-content:space-between;">
                    <a href='{item['link']}' class='title' style='color: #333; text-decoration: none; font-size: 1.1em;'>{item['title']}</a>
                    {status_html}
                </div>
                <div class='meta' style='margin-top:5px;'>
                    ⏰ {item['date']} | <span class='price' style='font-size:1.1em;'>{item['price']}</span>
                </div>
                <div style="margin-top:8px;">
                    <a href='{item['link']}' class='btn'>{btn_text}</a>
                </div>
            </div>
            """
    return html

if __name__ == "__main__":
    # Test
    dummy_data = {
        'new_items': [{'title': 'Test Item', 'price': '1000', 'date': '01.01', 'link': '#', 'category': 'test'}],
        'opening_today': [{'title': 'Opening Item', 'price': '2000', 'date': '02.02', 'link': '#', 'category': 'test'}]
    }
    send_update_email(dummy_data)
