import re

def normalize_numbers(text: str) -> str:
    """Normalize numbers and currency before stripping symbols."""
    num_map = {
        '0': 'సున్నా', '1': 'ఒకటి', '2': 'రెండు', '3': 'మూడు', '4': 'నాలుగు',
        '5': 'ఐదు', '6': 'ఆరు', '7': 'ఏడు', '8': 'ఎనిమిది', '9': 'తొమ్మిది'
    }
    
    def repl_phone(m):
        return " ".join([num_map.get(d, d) for d in m.group(0) if d in num_map])
        
    text = re.sub(r'\b\d{10}\b', repl_phone, text)
    
    # Currency
    text = re.sub(r'₹\s*(\d+)', r'\1 రూపాయలు', text)
    text = re.sub(r'\$\s*(\d+)', r'\1 డాలర్లు', text)
    
    return text

def strip_markdown(text: str) -> str:
    """Strip basic markdown and emojis/symbols."""
    text = re.sub(r'[*#`~]+', '', text)
    text = re.sub(r'http\S+', '', text)
    # Keep ₹ and $ just in case, though they should be replaced
    text = re.sub(r'[^\w\s\.,\?!\u0C00-\u0C7F₹\$]', '', text)
    return text.strip()

def normalize_telugu(text: str) -> str:
    """Normalize text for Telugu TTS."""
    text = normalize_numbers(text)
    text = strip_markdown(text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()
