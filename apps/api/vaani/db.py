import sqlite3
import threading
from typing import List, Dict, Optional
from datetime import datetime, date, time

# Thread-local storage for sqlite
_local = threading.local()

def get_db():
    if not hasattr(_local, "db"):
        # In-memory DB for prototype
        _local.db = sqlite3.connect(":memory:", check_same_thread=False)
        _init_db(_local.db)
    return _local.db

def _init_db(conn):
    conn.execute('''
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            service TEXT NOT NULL,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            status TEXT DEFAULT 'booked',
            idempotency_key TEXT UNIQUE
        )
    ''')
    conn.commit()

def check_availability(check_date: str) -> List[str]:
    """Returns available slots for a given date in 'YYYY-MM-DD' format."""
    conn = get_db()
    # For prototype, assume hours are 09:00 to 17:00, slots every 30 mins
    # Filter out slots that are already booked
    cursor = conn.execute("SELECT time FROM appointments WHERE date = ? AND status = 'booked'", (check_date,))
    booked_times = {row[0] for row in cursor.fetchall()}
    
    all_slots = [
        f"{h:02d}:{m:02d}" 
        for h in range(9, 17) 
        for m in (0, 30)
    ]
    
    available = [slot for slot in all_slots if slot not in booked_times]
    return available

def book_appointment(name: str, phone: str, service: str, appt_date: str, appt_time: str, idempotency_key: str) -> bool:
    conn = get_db()
    
    # Check if idempotency key exists
    cur = conn.execute("SELECT id FROM appointments WHERE idempotency_key = ?", (idempotency_key,))
    if cur.fetchone():
        return True # Already booked
        
    # Check availability
    cur = conn.execute("SELECT id FROM appointments WHERE date = ? AND time = ? AND status = 'booked'", (appt_date, appt_time))
    if cur.fetchone():
        return False # Slot taken
        
    conn.execute('''
        INSERT INTO appointments (name, phone, service, date, time, idempotency_key)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (name, phone, service, appt_date, appt_time, idempotency_key))
    conn.commit()
    return True

def cancel_appointment(phone: str, appt_date: str, appt_time: str) -> bool:
    conn = get_db()
    cur = conn.execute("UPDATE appointments SET status = 'cancelled' WHERE phone = ? AND date = ? AND time = ?", (phone, appt_date, appt_time))
    conn.commit()
    return cur.rowcount > 0

def get_appointments(phone: str) -> List[Dict]:
    conn = get_db()
    cur = conn.execute("SELECT name, service, date, time, status FROM appointments WHERE phone = ?", (phone,))
    return [{"name": r[0], "service": r[1], "date": r[2], "time": r[3], "status": r[4]} for r in cur.fetchall()]
