# 🛡️ TrustGuard UPI — Behavioral Fraud Intelligence System

> **Detect. Explain. Protect — Before the Fraud Happens.**

A full-stack demo UPI app with an embedded real-time behavioral fraud detection engine.

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- pip

### Run (Windows)
```bash
start.bat
```

### Run (Manual)
```bash
cd backend
pip install -r requirements.txt
python init_db.py
python app.py
```

Then open **http://127.0.0.1:5000** in your browser.

---

## 🏗️ Project Structure

```
trustguard/
├── backend/
│   ├── app.py           # Flask API server
│   ├── risk_engine.py   # Behavioral fraud detection engine
│   ├── init_db.py       # DB setup + seed data
│   ├── requirements.txt
│   └── trustguard.db    # SQLite (auto-created)
├── frontend/
│   ├── index.html       # Single-page app
│   ├── css/style.css    # Dark theme UI
│   └── js/app.js        # Frontend logic + charts
├── start.bat            # One-click startup
└── README.md
```

---

## 🎯 Demo Cases

| Case | UPI ID | Amount | Note | Expected |
|------|--------|--------|------|----------|
| ✅ Safe | `friend@upi` | ₹500 | Dinner split | SAFE |
| ⚠️ High Risk | `unknown@ybl` | ₹25,000 | Payment | HIGH RISK |
| 🚨 Scam | `taxrefund@upi` | ₹50,000 | Urgent KYC verify | SCAM |

---

## 🧠 How the Risk Engine Works

### Behavioral Fingerprint Checks
| Factor | Weight |
|--------|--------|
| New / unknown receiver | +25 pts |
| Amount 10× above average | +30 pts |
| Amount 5× above average | +20 pts |
| Unusual time (before 6 AM / after 11 PM) | +20 pts |
| Rapid successive transactions (3+ in 10 min) | +15 pts |
| Social engineering keywords in note | +25 pts |
| Large round-number amount | +5 pts |

### Risk Levels
- 🟢 **SAFE** (0–39): Transaction proceeds normally
- 🟡 **MEDIUM** (40–69): Warning shown, user can proceed
- 🔴 **HIGH** (70–100): Strong warning + scam pattern alert

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JS |
| Charts | Chart.js 4 |
| Backend | Python + Flask |
| Database | SQLite |
| Fonts | Inter (Google Fonts) |

---

## 🏆 Key Features

- **Behavioral Fingerprint** — compares against user's own transaction history
- **Explainable AI** — shows exactly *why* a transaction was flagged
- **Social Engineering Detection** — scans note for urgency/scam keywords
- **Smart Question** — asks if someone pressured the user
- **Real-time Risk Score** — 0–100 animated meter
- **Analytics Dashboard** — risk trend, distribution donut, amount vs risk scatter
- **Transaction History** — full log with risk badges

---

## 🎤 Pitch Line

> *"We are not detecting fraud after it happens. We intervene before the transaction is completed by analyzing behavioral deviations and identifying possible social engineering influence in real time."*
