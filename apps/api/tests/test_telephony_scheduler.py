import pytest
from datetime import datetime
import pytz
from vaani.telephony.scheduler import OutboundScheduler
from vaani.telephony.twilio_adapter import TwilioProvider

def test_quiet_hours_enforcement():
    provider = TwilioProvider(auth_token="test", account_sid="test")
    scheduler = OutboundScheduler(provider, "wss://test.com", "+123456789")

    # 10 PM IST -> Should be quiet hours
    dt_10pm = datetime(2026, 10, 1, 22, 0, 0, tzinfo=pytz.timezone('Asia/Kolkata'))
    assert scheduler.is_quiet_hours(dt_10pm) == True

    # 3 AM IST -> Should be quiet hours
    dt_3am = datetime(2026, 10, 1, 3, 0, 0, tzinfo=pytz.timezone('Asia/Kolkata'))
    assert scheduler.is_quiet_hours(dt_3am) == True

    # 10 AM IST -> Should NOT be quiet hours
    dt_10am = datetime(2026, 10, 1, 10, 0, 0, tzinfo=pytz.timezone('Asia/Kolkata'))
    assert scheduler.is_quiet_hours(dt_10am) == False

    # 8:30 PM IST -> Should NOT be quiet hours
    dt_830pm = datetime(2026, 10, 1, 20, 30, 0, tzinfo=pytz.timezone('Asia/Kolkata'))
    assert scheduler.is_quiet_hours(dt_830pm) == False
