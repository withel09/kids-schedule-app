import logging
import asyncio
from telegram import Update
from telegram.ext import ApplicationBuilder, ContextTypes, CommandHandler, MessageHandler, filters

# 1. 여기에 토큰을 넣을 겁니다 (대표님이 주시면 제가 바꿔치기 합니다)
TELEGRAM_TOKEN = "7817365214:AAEXRwHxZfYT7-6X3zuJREVKFykf-9RF6w8" 

# 로깅 설정
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)

import subprocess

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=(
            "**[제이슨 비서 가동]** 🤖\n\n"
            "이제 '뇌'가 연결되었습니다. 업무를 지시해주세요!\n\n"
            "🔻 **가능한 업무**\n"
            "🔹 `/run` : 위시버니 스크래핑 지금 즉시 실행\n"
            "🔹 `/check` : 최신 수집 데이터 확인\n"
            "🔹 `/status` : 현재 시스템 상태 보고"
        ),
        parse_mode='Markdown'
    )

async def run_scraper(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await context.bot.send_message(chat_id=update.effective_chat.id, text="🚀 **위시버니 스크래핑을 시작합니다...**")
    
    try:
        # 스크립트 실행
        result = subprocess.run(["python3", "scrape_wishbunny.py"], capture_output=True, text=True)
        
        if result.returncode == 0:
            await context.bot.send_message(chat_id=update.effective_chat.id, text="✅ **수집 완료!**\n이메일을 확인해주세요.")
        else:
            await context.bot.send_message(chat_id=update.effective_chat.id, text=f"❌ **오류 발생!**\n{result.stderr[:200]}")
            
    except Exception as e:
        await context.bot.send_message(chat_id=update.effective_chat.id, text=f"⚠️ **실행 실패**: {str(e)}")

import pandas as pd
import os

async def check_latest_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if not os.path.exists("wishbunny_latest.xlsx"):
        await context.bot.send_message(chat_id=update.effective_chat.id, text="❌ **데이터가 없습니다.**\n먼저 `/run`을 실행해주세요.")
        return

    try:
        # 엑셀 파일 읽기 (최신 5개만)
        df = pd.read_excel("wishbunny_latest.xlsx", engine='openpyxl')
        
        if df.empty:
            await context.bot.send_message(chat_id=update.effective_chat.id, text="📂 데이터 파일은 있는데, 내용이 비어있습니다.")
            return

        msg = f"📊 **최신 수집 데이터 (총 {len(df)}개)**\n\n"
        
        # 상위 5개만 보여줌
        for index, row in df.head(5).iterrows():
            market_price = row.get('price', '가격미정')
            date_info = row.get('date', '일정미정')
            msg += f"🔹 **{row['title']}**\n   💰 {market_price} | 🗓️ {date_info}\n   🔗 {row['link']}\n\n"
            
        msg += "👉 더 자세한 건 이메일을 확인하세요!"
        
        await context.bot.send_message(chat_id=update.effective_chat.id, text=msg)

    except Exception as e:
        await context.bot.send_message(chat_id=update.effective_chat.id, text=f"⚠️ **파일 읽기 실패**: {str(e)}")

async def echo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_text = update.message.text
    
    # 간단한 키워드 인식
    if "시작" in user_text or "실행" in user_text or "run" in user_text.lower():
        await run_scraper(update, context)
        return

    if "확인" in user_text or "check" in user_text.lower():
        await check_latest_data(update, context)
        return
        
    if "안녕" in user_text or "반가워" in user_text:
        await context.bot.send_message(
            chat_id=update.effective_chat.id,
            text="반갑습니다, 대표님! 제이슨입니다. 🙇‍♂️\n오늘도 열심히 일하겠습니다."
        )
        return

    # 그 외 대화
    await context.bot.send_message(
        chat_id=update.effective_chat.id,
        text=f"죄송합니다. 저는 '업무 실행용' 봇이라 깊은 대화는 아직 어렵습니다. 😅\n대신 **'실행'** 또는 **'확인'** 이라고 말씀해주세요!\n\n(받은 메시지: {user_text})"
    )

if __name__ == '__main__':
    application = ApplicationBuilder().token(TELEGRAM_TOKEN).build()
    
    application.add_handler(CommandHandler('start', start))
    application.add_handler(CommandHandler('run', run_scraper))
    application.add_handler(CommandHandler('check', check_latest_data))
    application.add_handler(MessageHandler(filters.TEXT & (~filters.COMMAND), echo))
    
    print("제이슨(Bot): 업그레이드 완료! 다시 출근합니다.")
    application.run_polling()
