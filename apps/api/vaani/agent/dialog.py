import re
import json
from typing import List, Dict
from vaani.sarvam.llm import complete
from vaani.agent.tools import execute_tool

async def step_dialog(messages: List[Dict[str, str]]) -> str:
    """
    Runs the LLM. If it requests a tool call via `<tool_call>...</tool_call>`,
    executes the tool, appends the result to the conversation, and calls the LLM again.
    (Max 2 iterations to prevent infinite loops).
    """
    for _ in range(2):
        reply = await complete(messages)
        
        # Check for tool call
        tool_match = re.search(r'<tool_call>(.*?)</tool_call>', reply, re.DOTALL)
        if tool_match:
            json_str = tool_match.group(1).strip()
            try:
                action_dict = json.loads(json_str)
                # Ensure the agent's attempt is recorded so the context makes sense
                messages.append({"role": "assistant", "content": reply})
                
                # Execute tool
                result = execute_tool(action_dict)
                
                # Append tool result as system message or user message (since Sarvam might only support user/assistant/system)
                # We'll use "system" role if supported, or "user" if not. Let's assume user.
                tool_msg = f"<tool_result>{result}</tool_result>"
                messages.append({"role": "user", "content": tool_msg})
                # Loop around and let LLM generate the final response to the user based on tool result
                continue
                
            except json.JSONDecodeError:
                # Automatic repair retry (send error back to LLM)
                messages.append({"role": "assistant", "content": reply})
                messages.append({"role": "user", "content": "<tool_result>Error: Invalid JSON format.</tool_result>"})
                continue
        else:
            return reply
            
    # Fallback if loop exhausted
    return "నన్ను క్షమించండి, నేను దాన్ని ప్రాసెస్ చేయలేకపోయాను." # Sorry, I couldn't process that.
