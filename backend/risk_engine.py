"""
TrustGuard Risk Engine
Behavioral fingerprint + explainable risk scoring
"""

import sqlite3
import os
from datetime import datetime, time as dtime
import re

DB_PATH = os.path.join(os.path.dirname(__file__), 'trustguard.db')

# ── Social-engineering keyword patterns ──────────────────────────────────────
URGENCY_KEYWORDS = [
    'urgent', 'emergency', 'immediately', 'asap', 'right now',
    'police', 'arrest', 'court', 'bank block', 'kyc', 'otp',
    'prize', 'lottery', 'won', 'reward', 'refund', 'cashback',
    'verify', 'account suspend', 'last chance', 'deadline'
]

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# ── Fetch user's past transactions ───────────────────────────────────────────
def get_user_history(user_id: str):
    db = get_db()
    rows = db.execute(
        '''SELECT * FROM transactions WHERE user_id = ?
           ORDER BY timestamp DESC LIMIT 100''',
        (user_id,)
    ).fetchall()
    db.close()
    return [dict(r) for r in rows]

def get_known_receivers(user_id: str):
    db = get_db()
    rows = db.execute(
        '''SELECT DISTINCT receiver_upi FROM transactions
           WHERE user_id = ? AND action = "confirm"''',
        (user_id,)
    ).fetchall()
    db.close()
    return {r['receiver_upi'] for r in rows}

def get_avg_amount(user_id: str):
    db = get_db()
    row = db.execute(
        '''SELECT AVG(amount) as avg_amt, MAX(amount) as max_amt
           FROM transactions WHERE user_id = ? AND action = "confirm"''',
        (user_id,)
    ).fetchone()
    db.close()
    avg = row['avg_amt'] or 500.0
    mx  = row['max_amt'] or 1000.0
    return avg, mx

def get_recent_count(user_id: str, minutes: int = 10):
    db = get_db()
    rows = db.execute(
        '''SELECT COUNT(*) as cnt FROM transactions
           WHERE user_id = ? AND timestamp >= datetime('now', ?)''',
        (user_id, f'-{minutes} minutes')
    ).fetchone()
    db.close()
    return rows['cnt'] if rows else 0

# ── Core analysis ─────────────────────────────────────────────────────────────
def analyze_transaction(user_id: str, upi_id: str, amount: float, note: str):
    reasons   = []
    score     = 0
    factors   = {}

    known_receivers = get_known_receivers(user_id)
    avg_amount, max_amount = get_avg_amount(user_id)
    now = datetime.now()
    hour = now.hour
    recent_count = get_recent_count(user_id, minutes=10)

    # ── 1. New receiver check ─────────────────────────────────────────────
    is_new_receiver = upi_id not in known_receivers
    if is_new_receiver:
        score += 25
        reasons.append('New / unknown receiver')
    factors['new_receiver'] = is_new_receiver

    # ── 2. Amount anomaly ─────────────────────────────────────────────────
    amount_ratio = amount / avg_amount if avg_amount > 0 else 1
    if amount_ratio >= 10:
        score += 30
        reasons.append(f'Amount is {amount_ratio:.0f}× higher than your usual (avg ₹{avg_amount:.0f})')
    elif amount_ratio >= 5:
        score += 20
        reasons.append(f'Amount is {amount_ratio:.0f}× higher than your usual (avg ₹{avg_amount:.0f})')
    elif amount_ratio >= 2:
        score += 10
        reasons.append(f'Amount is {amount_ratio:.0f}× higher than your usual')
    factors['amount_ratio'] = round(amount_ratio, 2)
    factors['avg_amount']   = round(avg_amount, 2)

    # ── 3. Unusual time ───────────────────────────────────────────────────
    is_odd_hour = hour < 6 or hour >= 23
    if is_odd_hour:
        score += 20
        reasons.append(f'Unusual transaction time ({now.strftime("%I:%M %p")})')
    factors['hour'] = hour
    factors['odd_hour'] = is_odd_hour

    # ── 4. Rapid successive transactions ─────────────────────────────────
    if recent_count >= 3:
        score += 15
        reasons.append(f'{recent_count} transactions in last 10 minutes (rapid activity)')
    factors['recent_count'] = recent_count

    # ── 5. Social engineering / urgency detection ─────────────────────────
    note_lower = note.lower()
    matched_keywords = [kw for kw in URGENCY_KEYWORDS if kw in note_lower]
    social_engineering = len(matched_keywords) > 0
    if social_engineering:
        score += 25
        reasons.append(f'Note contains urgency/scam keywords: {", ".join(matched_keywords[:3])}')
    factors['social_engineering'] = social_engineering
    factors['matched_keywords']   = matched_keywords

    # ── 6. Large round number ─────────────────────────────────────────────
    if amount >= 10000 and amount % 1000 == 0:
        score += 5
        reasons.append('Large round-number amount (common in scams)')

    # ── Cap score ─────────────────────────────────────────────────────────
    score = min(score, 100)

    # ── Risk level ────────────────────────────────────────────────────────
    if score >= 70:
        risk_level = 'HIGH'
        color      = '#ef4444'
        emoji      = '🚨'
    elif score >= 40:
        risk_level = 'MEDIUM'
        color      = '#f59e0b'
        emoji      = '⚠️'
    else:
        risk_level = 'SAFE'
        color      = '#22c55e'
        emoji      = '✅'

    # ── Smart question ────────────────────────────────────────────────────
    smart_question = None
    if score >= 40:
        smart_question = 'Did someone ask you to send this money urgently?'

    return {
        'risk_score':        score,
        'risk_level':        risk_level,
        'color':             color,
        'emoji':             emoji,
        'reasons':           reasons,
        'factors':           factors,
        'social_engineering': social_engineering,
        'smart_question':    smart_question,
        'upi_id':            upi_id,
        'amount':            amount,
        'timestamp':         now.isoformat()
    }
