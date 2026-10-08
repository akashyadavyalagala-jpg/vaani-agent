from typing import List, Dict
from pydantic import BaseModel, Field

class ConversationMemory(BaseModel):
    session_id: str
    messages: List[Dict[str, str]] = Field(default_factory=list)
    max_turns: int = 10

    def add_user_message(self, text: str):
        self.messages.append({"role": "user", "content": text})
        self._enforce_budget()

    def add_agent_message(self, text: str):
        self.messages.append({"role": "assistant", "content": text})
        self._enforce_budget()

    def get_messages(self, system_prompt: str) -> List[Dict[str, str]]:
        return [{"role": "system", "content": system_prompt}] + self.messages

    def _enforce_budget(self):
        # Keep only the last `max_turns` of conversation (user + assistant pairs)
        if len(self.messages) > self.max_turns * 2:
            # We would summarize here in a full implementation.
            # For now, we simply truncate the oldest messages, keeping the newest.
            self.messages = self.messages[-(self.max_turns * 2):]

# In-memory store for prototype
_sessions: Dict[str, ConversationMemory] = {}

def get_memory(session_id: str) -> ConversationMemory:
    if session_id not in _sessions:
        _sessions[session_id] = ConversationMemory(session_id=session_id)
    return _sessions[session_id]
