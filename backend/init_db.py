import sqlite3, os, random
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), 'trustguard.db')

def init():
    # Remove old DB so we start fresh
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    # ── Tables ────────────────────────────────────────────────────────────────
    c.execute('''CREATE TABLE users (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        name     TEXT NOT NULL,
        phone    TEXT UNIQUE NOT NULL,
        upi_id   TEXT UNIQUE NOT NULL,
        pin      TEXT NOT NULL,
        balance  REAL DEFAULT 10000.0,
        avatar   TEXT DEFAULT ''
    )''')

    c.execute('''CREATE TABLE contacts (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id       INTEGER NOT NULL,
        name          TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        upi_id        TEXT
    )''')

    c.execute('''CREATE TABLE transactions (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id       INTEGER NOT NULL,
        receiver_upi  TEXT NOT NULL,
        receiver_name TEXT,
        amount        REAL NOT NULL,
        note          TEXT DEFAULT '',
        risk_score    REAL DEFAULT 0,
        action        TEXT DEFAULT 'confirm',
        type          TEXT DEFAULT 'debit',
        timestamp     TEXT NOT NULL
    )''')

    # ── Seed users ────────────────────────────────────────────────────────────
    users = [
        (1, 'Chethan G',    '9876543210', 'chethan@trustpay',  '1234', 25000.0),
        (2, 'Priya Sharma', '9123456780', 'priya@trustpay',    '5678', 15000.0),
        (3, 'Rahul Verma',  '9988776655', 'rahul@trustpay',    '4321', 8000.0),
        (4, 'Ananya Singh', '9871234560', 'ananya@trustpay',   '9999', 32000.0),
        (5, 'Vikram Nair',  '9765432100', 'vikram@trustpay',   '1111', 5000.0),
    ]
    c.executemany('INSERT INTO users (id,name,phone,upi_id,pin,balance) VALUES (?,?,?,?,?,?)', users)

    # ── Seed contacts for user 1 ──────────────────────────────────────────────
    contacts = [
        (1, 'Priya Sharma', '9123456780', 'priya@trustpay'),
        (1, 'Rahul Verma',  '9988776655', 'rahul@trustpay'),
        (1, 'Ananya Singh', '9871234560', 'ananya@trustpay'),
        (1, 'Vikram Nair',  '9765432100', 'vikram@trustpay'),
        (1, 'Mom',          '9000000001', 'mom@okaxis'),
        (1, 'Grocery Store','9000000002', 'grocery@paytm'),
        (1, 'Netflix',      '9000000003', 'netflix@icici'),
    ]
    c.executemany('INSERT INTO contacts (user_id,name,contact_phone,upi_id) VALUES (?,?,?,?)', contacts)

    # ── Seed transaction history for user 1 ──────────────────────────────────
    now = datetime.now()
    txns = [
        (1, 'priya@trustpay',  'Priya Sharma', 500,   'Dinner split',    5,  'confirm', 'debit',   (now - timedelta(hours=2)).isoformat()),
        (1, 'rahul@trustpay',  'Rahul Verma',  1200,  'Rent share',      5,  'confirm', 'debit',   (now - timedelta(days=1)).isoformat()),
        (1, 'grocery@paytm',   'Grocery Store',350,   'Vegetables',      5,  'confirm', 'debit',   (now - timedelta(days=2)).isoformat()),
        (1, 'netflix@icici',   'Netflix',      499,   'Subscription',    5,  'confirm', 'debit',   (now - timedelta(days=3)).isoformat()),
        (1, 'priya@trustpay',  'Priya Sharma', 2000,  'Movie tickets',   5,  'confirm', 'credit',  (now - timedelta(days=4)).isoformat()),
        (1, 'mom@okaxis',      'Mom',          5000,  'Monthly transfer',5,  'confirm', 'debit',   (now - timedelta(days=5)).isoformat()),
        (1, 'ananya@trustpay', 'Ananya Singh', 800,   'Lunch',           5,  'confirm', 'debit',   (now - timedelta(days=6)).isoformat()),
        (1, '9876543210',      'Airtel Recharge',299, 'Recharge',        0,  'confirm', 'recharge',(now - timedelta(days=7)).isoformat()),
        (1, 'vikram@trustpay', 'Vikram Nair',  150,   'Coffee',          5,  'confirm', 'debit',   (now - timedelta(days=8)).isoformat()),
        (1, 'unknown@ybl',     'Unknown',      15000, 'Payment',         75, 'cancel',  'debit',   (now - timedelta(days=9)).isoformat()),
    ]
    c.executemany(
        'INSERT INTO transactions (user_id,receiver_upi,receiver_name,amount,note,risk_score,action,type,timestamp) VALUES (?,?,?,?,?,?,?,?,?)',
        txns
    )

    conn.commit()
    conn.close()
    print(f'✅ Database initialized → {DB_PATH}')
    print('   Demo login: phone=9876543210  pin=1234')

if __name__ == '__main__':
    init()
