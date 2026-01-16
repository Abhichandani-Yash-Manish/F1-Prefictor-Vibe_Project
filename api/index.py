# Vercel Python Serverless Function Entry Point
# This file is the entry point for Vercel's Python serverless functions

import os
import sys

# Add the current directory to Python path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# Import the FastAPI app from main.py
from main import app

# Vercel expects 'app' at module level for ASGI apps
# or 'handler' for WSGI apps
# FastAPI is ASGI, so we export 'app'
