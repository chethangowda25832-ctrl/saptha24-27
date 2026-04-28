@echo off
echo ============================================
echo   TrustGuard UPI - Starting Backend
echo ============================================

cd backend

echo Installing dependencies...
pip install -r requirements.txt

echo Initializing database...
python init_db.py

echo Starting Flask server...
echo.
echo  Open your browser at: http://127.0.0.1:5000
echo.
python app.py
