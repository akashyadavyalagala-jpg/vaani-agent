import json
import uuid
from vaani.db import check_availability, book_appointment, cancel_appointment

def execute_tool(action_dict: dict) -> str:
    """Executes a JSON action and returns the result string."""
    action = action_dict.get("action")
    
    try:
        if action == "check_availability":
            date_str = action_dict.get("date")
            if not date_str:
                return "Error: missing date"
            slots = check_availability(date_str)
            if not slots:
                return f"No slots available on {date_str}."
            return f"Available slots on {date_str}: {', '.join(slots)}"
            
        elif action == "book_appointment":
            name = action_dict.get("name")
            phone = action_dict.get("phone")
            service = action_dict.get("service")
            date_str = action_dict.get("date")
            time_str = action_dict.get("time")
            if not all([name, phone, service, date_str, time_str]):
                return "Error: missing required fields."
            
            # Idempotency key
            ik = str(uuid.uuid5(uuid.NAMESPACE_OID, f"{phone}-{date_str}-{time_str}"))
            success = book_appointment(name, phone, service, date_str, time_str, ik)
            if success:
                return f"Success! Appointment booked for {name} on {date_str} at {time_str}."
            else:
                return f"Failure: Slot {time_str} on {date_str} is already taken."
                
        elif action == "cancel_appointment":
            phone = action_dict.get("phone")
            date_str = action_dict.get("date")
            time_str = action_dict.get("time")
            if not all([phone, date_str, time_str]):
                return "Error: missing required fields."
            success = cancel_appointment(phone, date_str, time_str)
            if success:
                return "Appointment cancelled successfully."
            else:
                return "Appointment not found."
                
        elif action == "transfer_to_human":
            return "System: Call transferred to human agent."
            
        else:
            return f"Error: Unknown action {action}"
    except Exception as e:
        return f"Tool Execution Error: {str(e)}"
