from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import SecretStr

class Settings(BaseSettings):
    sarvam_api_key: SecretStr
    database_url: str = "sqlite:///./vaani.db"
    app_origin: str = "http://localhost:3000"
    log_level: str = "INFO"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()

import logging
import re

class RedactingFormatter(logging.Formatter):
    def __init__(self, fmt=None):
        super().__init__(fmt)
        # Redact 10-digit Indian phone numbers
        self.phone_pattern = re.compile(r'\b(?:\+91|91)?[6-9]\d{9}\b')

    def format(self, record):
        message = super().format(record)
        message = self.phone_pattern.sub("[REDACTED PHONE]", message)
        return message

logger = logging.getLogger("vaani")
logger.setLevel(settings.log_level)
if not logger.handlers:
    ch = logging.StreamHandler()
    formatter = RedactingFormatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    ch.setFormatter(formatter)
    logger.addHandler(ch)
