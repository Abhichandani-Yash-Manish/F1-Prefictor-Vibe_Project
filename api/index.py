# Import everything from main.py
from main import app

# Vercel expects 'handler' or 'app' at module level
handler = app
