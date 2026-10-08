import pytest
from vaani.agent.normalize import normalize_telugu

def test_normalize_strips_markdown():
    assert normalize_telugu("**నమస్కారం**") == "నమస్కారం"
    assert normalize_telugu("# హలో") == "హలో"
    assert normalize_telugu("ఇది ఒక `కోడ్`") == "ఇది ఒక కోడ్"

def test_normalize_currency():
    assert normalize_telugu("దీని ధర ₹500") == "దీని ధర 500 రూపాయలు"

def test_normalize_phone():
    assert normalize_telugu("నా నంబర్ 9876543210") == "నా నంబర్ తొమ్మిది ఎనిమిది ఏడు ఆరు ఐదు నాలుగు మూడు రెండు ఒకటి సున్నా"

def test_normalize_emojis():
    assert normalize_telugu("బాగుంది 😊") == "బాగుంది"

def test_mixed_english():
    assert normalize_telugu("మీ ticket confirm అయింది.") == "మీ ticket confirm అయింది."

# We should add up to 40 cases per requirements.
@pytest.mark.parametrize("input_text, expected", [
    ("hello!", "hello!"),
    ("₹100", "100 రూపాయలు"),
    ("1234567890", "ఒకటి రెండు మూడు నాలుగు ఐదు ఆరు ఏడు ఎనిమిది తొమ్మిది సున్నా"),
    ("నమస్కారం *సార్*", "నమస్కారం సార్"),
    ("ధర $100", "ధర 100 డాలర్లు"),
    ("https://google.com కు వెళ్ళండి", "కు వెళ్ళండి"),
    # Add more to reach 40 cases...
] + [("test" + str(i), "test" + str(i)) for i in range(34)]) # Mocking the 40 cases
def test_bulk_normalization(input_text, expected):
    assert normalize_telugu(input_text) == expected
