import re
from typing import AsyncGenerator

class SentenceChunker:
    """
    Chunks an incoming token stream into sentences.
    Splits on `. ? ! ।` and optionally on clause breaks `,` if sentence is too long.
    """
    def __init__(self, max_chars: int = 30):
        self.buffer = ""
        self.max_chars = max_chars
        # Matches sentence endings including Telugu punctuation
        self.split_pattern = re.compile(r'([\.?!।])\s*')
        # Matches clauses
        self.clause_pattern = re.compile(r'([,;])\s*')

    async def chunk_stream(self, token_stream: AsyncGenerator[str, None]) -> AsyncGenerator[str, None]:
        async for token in token_stream:
            self.buffer += token
            
            # Check for sentence boundaries
            while True:
                match = self.split_pattern.search(self.buffer)
                if match:
                    end_idx = match.end()
                    sentence = self.buffer[:end_idx].strip()
                    self.buffer = self.buffer[end_idx:]
                    if sentence:
                        yield sentence
                elif len(self.buffer) > self.max_chars:
                    # Force a clause split if getting too long
                    clause_match = self.clause_pattern.search(self.buffer)
                    if clause_match:
                        end_idx = clause_match.end()
                        sentence = self.buffer[:end_idx].strip()
                        self.buffer = self.buffer[end_idx:]
                        if sentence:
                            yield sentence
                    else:
                        # Break arbitrarily on space if very long and no punctuation
                        space_idx = self.buffer.rfind(' ', 0, self.max_chars)
                        if space_idx > 0:
                            sentence = self.buffer[:space_idx].strip()
                            self.buffer = self.buffer[space_idx:]
                            if sentence:
                                yield sentence
                        else:
                            break # Wait for more
                else:
                    break
                    
        # Yield remainder
        if self.buffer.strip():
            yield self.buffer.strip()
            self.buffer = ""
