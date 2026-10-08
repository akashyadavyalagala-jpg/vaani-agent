import logging
from datetime import datetime
import pytz
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from .twilio_adapter import TwilioProvider

logger = logging.getLogger(__name__)

class OutboundScheduler:
    def __init__(self, provider: TwilioProvider, default_wss_url: str, default_from: str):
        self.scheduler = AsyncIOScheduler(timezone=pytz.timezone('Asia/Kolkata'))
        self.provider = provider
        self.default_wss_url = default_wss_url
        self.default_from = default_from

    def is_quiet_hours(self, dt_ist: datetime = None) -> bool:
        """
        India quiet hours are generally 21:00 (9 PM) to 08:00 (8 AM) IST.
        Outbound promotional or non-critical calls should not be placed during this time.
        """
        if not dt_ist:
            dt_ist = datetime.now(pytz.timezone('Asia/Kolkata'))
        
        hour = dt_ist.hour
        if hour >= 21 or hour < 8:
            return True
        return False

    async def _place_call_job(self, to_number: str):
        if self.is_quiet_hours():
            logger.warning(f"Skipping call to {to_number} due to quiet hours.")
            return

        logger.info(f"Placing scheduled call to {to_number}")
        try:
            sid = await self.provider.place_call(to_number, self.default_from, self.default_wss_url)
            logger.info(f"Call placed successfully. SID: {sid}")
        except Exception as e:
            logger.error(f"Failed to place call: {e}")

    def schedule_reminder(self, to_number: str, run_at: datetime):
        """
        Schedule a one-off call for an appointment reminder.
        """
        self.scheduler.add_job(
            self._place_call_job,
            'date',
            run_date=run_at,
            args=[to_number]
        )

    def start(self):
        self.scheduler.start()

    def shutdown(self):
        self.scheduler.shutdown()
