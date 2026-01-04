"""
Lendora AI - FastAPI Backend Server
REST API and WebSocket server for frontend communication
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import asyncio
import json
import os
from datetime import datetime
from pydantic import BaseModel

app = FastAPI(title="Lendora AI API")

# CORS configuration for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# Data Models
# ============================================================================

class LoanOffer(BaseModel):
    id: str
    lender_address: str
    principal: float
    initial_interest_rate: float
    term_months: int
    offered_at: str

class Trade(BaseModel):
    id: str
    timestamp: str
    type: str
    principal: float
    interestRate: float
    profit: float | None = None
    status: str

class AgentStatus(BaseModel):
    status: str
    current_task: str | None = None
    last_decision: str | None = None

class DashboardStats(BaseModel):
    totalBalance: float
    activeLoans: int
    totalProfit: float
    agentStatus: str

# ============================================================================
# WebSocket Connection Manager
# ============================================================================

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WebSocket] Client connected. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"[WebSocket] Client disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# ============================================================================
# Mock Data (Replace with real agent integration)
# ============================================================================

MOCK_LOANS = [
    {
        "id": "loan_001",
        "lender_address": "addr1_lender_xyz",
        "principal": 1000.0,
        "initial_interest_rate": 8.5,
        "term_months": 12,
        "offered_at": "2025-11-29T12:00:00Z"
    }
]

MOCK_TRADES = [
    {
        "id": "trade_001",
        "timestamp": "2025-11-29T10:30:00Z",
        "type": "loan_accepted",
        "principal": 1000.0,
        "interestRate": 7.5,
        "profit": 75.0,
        "status": "completed"
    },
    {
        "id": "trade_002",
        "timestamp": "2025-11-28T15:45:00Z",
        "type": "loan_repaid",
        "principal": 500.0,
        "interestRate": 8.0,
        "profit": 40.0,
        "status": "completed"
    }
]

# ============================================================================
# REST API Endpoints
# ============================================================================

@app.get("/")
async def root():
    return {"message": "Lendora AI API", "version": "1.0.0"}

@app.get("/api/loans/offers")
async def get_loan_offers() -> List[LoanOffer]:
    """Get current loan offers"""
    return MOCK_LOANS

@app.get("/api/trades/history")
async def get_trade_history() -> List[Trade]:
    """Get trade history"""
    return MOCK_TRADES

@app.get("/api/agent/status")
async def get_agent_status() -> AgentStatus:
    """Get AI agent current status"""
    # TODO: Integrate with actual agent from agents/borrower_agent.py
    return AgentStatus(
        status="profiting",
        current_task="Monitoring new loan offers",
        last_decision="Accepted loan at 7.5% APR"
    )

@app.get("/api/agent/xai-logs")
async def get_xai_logs(limit: int = 50):
    """Get XAI decision logs"""
    log_file = os.path.join(
        os.path.dirname(__file__),
        "../../logs/xai_decisions.jsonl"
    )
    
    logs = []
    if os.path.exists(log_file):
        with open(log_file, 'r') as f:
            for line in f:
                try:
                    logs.append(json.loads(line))
                except:
                    pass
    
    return logs[-limit:]

@app.get("/api/dashboard/stats")
async def get_dashboard_stats() -> DashboardStats:
    """Get dashboard statistics"""
    return DashboardStats(
        totalBalance=125450.75,
        activeLoans=8,
        totalProfit=12543.50,
        agentStatus="profiting"
    )

# ============================================================================
# WebSocket Endpoint
# ============================================================================

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial status
        await websocket.send_json({
            "type": "agent_status",
            "data": {
                "status": "profiting",
                "timestamp": datetime.now().isoformat()
            }
        })
        
        # Keep connection alive and send periodic updates
        while True:
            # Simulate real-time updates every 5 seconds
            await asyncio.sleep(5)
            
            # Broadcast agent status update
            await manager.broadcast({
                "type": "agent_status",
                "data": {
                    "status": "profiting",
                    "timestamp": datetime.now().isoformat()
                }
            })
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ============================================================================
# Startup Event
# ============================================================================

@app.on_event("startup")
async def startup_event():
    print("=" * 70)
    print("Lendora AI Backend API Started")
    print("=" * 70)
    print("REST API:    http://localhost:8000")
    print("WebSocket:   ws://localhost:8000/ws")
    print("Docs:        http://localhost:8000/docs")
    print("=" * 70)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
