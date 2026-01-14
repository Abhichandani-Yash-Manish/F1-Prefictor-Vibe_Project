# ABSOLUTE MINIMAL - No middleware, no imports except FastAPI
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"msg": "Hello from Python!"}

@app.get("/health")
def health():
    return {"status": "ok"}

handler = app
