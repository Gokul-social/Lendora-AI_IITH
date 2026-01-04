"""
Vercel Serverless Function for Backend API
Lightweight wrapper for Vercel deployment

NOTE: Full AI features require deploying backend separately (Railway, Render, etc.)
This is a minimal API wrapper for basic endpoints.
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Try to import the full app, but handle gracefully if dependencies are too large
try:
    from backend.api.server import app
    handler = app
except ImportError as e:
    # Fallback: Create minimal FastAPI app if full backend can't be imported
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    
    app = FastAPI(title="Lendora AI API (Minimal)", version="2.0.0")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    @app.get("/")
    async def root():
        return {
            "message": "Lendora AI API",
            "status": "minimal_mode",
            "note": "Full backend with AI features should be deployed separately (Railway, Render, etc.)"
        }
    
    @app.get("/health")
    async def health():
        return {"status": "healthy", "mode": "minimal"}
    
    handler = app

