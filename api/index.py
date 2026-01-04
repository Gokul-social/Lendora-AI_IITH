"""
Vercel Serverless Function for Backend API
This allows deploying the FastAPI backend as Vercel serverless functions
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import FastAPI app
from backend.api.server import app

# Export for Vercel
handler = app

