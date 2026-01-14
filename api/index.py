# Vercel Python Serverless Entry Point
# This file exposes the FastAPI app for Vercel's ASGI handler

from .main import app

# Vercel Python runtime looks for `app` variable
handler = app
