"""
Lendora AI - FastAPI Backend Server
Complete API for the Privacy-First DeFi Lending Platform

Integrates:
- Midnight ZK Credit Checks
- Llama 3 AI Analysis
- Hydra Off-chain Negotiation
- Aiken Validator Settlement
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict
import asyncio
import json
import os
import sys
from datetime import datetime
from pydantic import BaseModel
from contextlib import asynccontextmanager

# Add agents to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))


# ============================================================================
# Application Setup
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("=" * 70)
    print("Lendora AI Backend API Started")
    print("=" * 70)
    print("REST API:    http://localhost:8000")
    print("WebSocket:   ws://localhost:8000/ws")
    print("Docs:        http://localhost:8000/docs")
    print("=" * 70)
    yield

app = FastAPI(
    title="Lendora AI API",
    description="Privacy-First DeFi Lending on Cardano",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Data Models
# ============================================================================

class CreditCheckRequest(BaseModel):
    borrower_address: str
    credit_score: int  # Private - only used for ZK proof

class CreditCheckResponse(BaseModel):
    borrower_address: str
    is_eligible: bool
    proof_hash: str
    timestamp: str

class LoanOfferRequest(BaseModel):
    lender_address: str
    principal: float
    interest_rate: float
    term_months: int
    borrower_address: str

class NegotiationRequest(BaseModel):
    offer_id: str
    proposed_rate: float

class WorkflowRequest(BaseModel):
    borrower_address: str
    credit_score: int
    principal: float
    interest_rate: float
    term_months: int
    lender_address: str

class WorkflowStep(BaseModel):
    step: int
    name: str
    status: str
    details: Dict
    timestamp: str

class DashboardStats(BaseModel):
    totalBalance: float
    activeLoans: int
    totalProfit: float
    agentStatus: str

class Trade(BaseModel):
    id: str
    timestamp: str
    type: str
    principal: float
    interestRate: float
    profit: Optional[float] = None
    status: str


# ============================================================================
# WebSocket Manager
# ============================================================================

class ConnectionManager:
    def __init__(self):
        self.connections: List[WebSocket] = []
    
    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.connections.append(ws)
    
    def disconnect(self, ws: WebSocket):
        if ws in self.connections:
            self.connections.remove(ws)
    
    async def broadcast(self, message: dict):
        for conn in self.connections:
            try:
                await conn.send_json(message)
            except:
                pass

manager = ConnectionManager()


# ============================================================================
# In-Memory State
# ============================================================================

class AppState:
    def __init__(self):
        self.workflow_steps: List[Dict] = []
        self.current_negotiation: Optional[Dict] = None
        self.credit_checks: Dict[str, Dict] = {}
        self.trades: List[Dict] = []
        self.stats = {
            "totalBalance": 125450.75,
            "activeLoans": 8,
            "totalProfit": 12543.50,
            "agentStatus": "idle"
        }

state = AppState()


# ============================================================================
# Midnight ZK Credit Check (Mock)
# ============================================================================

async def perform_credit_check(borrower: str, score: int) -> Dict:
    """Perform ZK credit check via Midnight."""
    await manager.broadcast({
        "type": "workflow_step",
        "data": {
            "step": 1,
            "name": "Midnight ZK Credit Check",
            "status": "processing",
            "details": {"borrower": borrower}
        }
    })
    
    await asyncio.sleep(1)  # Simulate processing
    
    is_eligible = score >= 700
    proof_hash = f"zk_proof_{borrower[:10]}_{int(datetime.now().timestamp())}"
    
    result = {
        "borrower_address": borrower,
        "is_eligible": is_eligible,
        "proof_hash": proof_hash,
        "timestamp": datetime.now().isoformat()
    }
    
    state.credit_checks[borrower] = result
    
    await manager.broadcast({
        "type": "workflow_step",
        "data": {
            "step": 1,
            "name": "Midnight ZK Credit Check",
            "status": "completed",
            "details": {
                "is_eligible": is_eligible,
                "proof_hash": proof_hash,
                "message": "Credit score verified privately via ZK proof"
            }
        }
    })
    
    return result


# ============================================================================
# Hydra Negotiation (Mock)
# ============================================================================

async def open_hydra_head(offer: Dict) -> Dict:
    """Open Hydra Head for negotiation."""
    head_id = f"head_{offer['offer_id']}_{int(datetime.now().timestamp())}"
    
    await manager.broadcast({
        "type": "workflow_step",
        "data": {
            "step": 3,
            "name": "Open Hydra Head",
            "status": "completed",
            "details": {
                "head_id": head_id,
                "participants": [offer["lender_address"], offer["borrower_address"]]
            }
        }
    })
    
    state.current_negotiation = {
        "head_id": head_id,
        "offer": offer,
        "current_rate": offer["interest_rate"],
        "rounds": 0,
        "status": "open"
    }
    
    return {"head_id": head_id, "status": "open"}


async def negotiate_in_hydra(proposed_rate: float) -> Dict:
    """Negotiate in Hydra Head (zero gas!)."""
    if not state.current_negotiation:
        return {"error": "No active negotiation"}
    
    neg = state.current_negotiation
    neg["rounds"] += 1
    
    await manager.broadcast({
        "type": "workflow_step",
        "data": {
            "step": 4,
            "name": f"Hydra Negotiation Round {neg['rounds']}",
            "status": "processing",
            "details": {
                "proposed_rate": proposed_rate,
                "current_rate": neg["current_rate"]
            }
        }
    })
    
    await asyncio.sleep(0.5)
    
    original_rate = neg["offer"]["interest_rate"]
    
    if proposed_rate >= original_rate - 1.5:
        # Accept
        neg["current_rate"] = proposed_rate
        neg["final_rate"] = proposed_rate
        neg["status"] = "accepted"
        action = "accepted"
        message = f"Deal at {proposed_rate}%!"
    elif neg["rounds"] >= 2:
        # Compromise
        middle = round((proposed_rate + neg["current_rate"]) / 2, 1)
        neg["current_rate"] = middle
        neg["final_rate"] = middle
        neg["status"] = "accepted"
        action = "accepted"
        message = f"Compromise at {middle}%!"
    else:
        # Counter
        counter = round(neg["current_rate"] - 0.5, 1)
        neg["current_rate"] = counter
        action = "counter"
        message = f"Lender countered: {counter}%"
    
    await manager.broadcast({
        "type": "workflow_step",
        "data": {
            "step": 4,
            "name": f"Hydra Negotiation Round {neg['rounds']}",
            "status": "completed",
            "details": {
                "action": action,
                "rate": neg.get("final_rate", neg["current_rate"]),
                "message": message
            }
        }
    })
    
    return {
        "success": True,
        "action": action,
        "rate": neg.get("final_rate", neg["current_rate"]),
        "message": message
    }


async def close_hydra_and_settle() -> Dict:
    """Close Hydra Head and settle via Aiken Validator."""
    if not state.current_negotiation:
        return {"error": "No active negotiation"}
    
    neg = state.current_negotiation
    
    # Close Head
    await manager.broadcast({
        "type": "workflow_step",
        "data": {
            "step": 5,
            "name": "Close Hydra Head",
            "status": "completed",
            "details": {
                "head_id": neg["head_id"],
                "final_rate": neg["final_rate"],
                "rounds": neg["rounds"],
                "savings": round(neg["offer"]["interest_rate"] - neg["final_rate"], 2)
            }
        }
    })
    
    await asyncio.sleep(0.5)
    
    # Generate settlement TX
    tx_hash = f"tx_{neg['head_id']}_{int(datetime.now().timestamp())}"
    
    # Aiken Validator verification
    await manager.broadcast({
        "type": "workflow_step",
        "data": {
            "step": 6,
            "name": "Aiken Validator Settlement",
            "status": "processing",
            "details": {"tx_hash": tx_hash}
        }
    })
    
    await asyncio.sleep(1)
    
    settlement = {
        "tx_hash": tx_hash,
        "borrower": neg["offer"]["borrower_address"],
        "lender": neg["offer"]["lender_address"],
        "principal": neg["offer"]["principal"],
        "final_rate": neg["final_rate"],
        "final_rate_bps": int(neg["final_rate"] * 100),
        "term_months": neg["offer"]["term_months"],
        "status": "LOAN_DISBURSED"
    }
    
    await manager.broadcast({
        "type": "workflow_step",
        "data": {
            "step": 6,
            "name": "Aiken Validator Settlement",
            "status": "completed",
            "details": {
                "borrower_sig": "OK",
                "lender_sig": "OK",
                "rate_valid": "OK",
                "settlement": settlement
            }
        }
    })
    
    # Record trade
    trade = {
        "id": f"trade_{int(datetime.now().timestamp())}",
        "timestamp": datetime.now().isoformat(),
        "type": "loan_accepted",
        "principal": neg["offer"]["principal"],
        "interestRate": neg["final_rate"],
        "originalRate": neg["offer"]["interest_rate"],
        "profit": round((neg["offer"]["interest_rate"] - neg["final_rate"]) * neg["offer"]["principal"] / 100, 2),
        "status": "completed"
    }
    state.trades.insert(0, trade)
    
    # Update stats
    state.stats["activeLoans"] += 1
    state.stats["totalProfit"] += trade["profit"]
    
    # Clear negotiation
    state.current_negotiation = None
    
    # Final broadcast
    await manager.broadcast({
        "type": "workflow_complete",
        "data": {
            "success": True,
            "settlement": settlement,
            "trade": trade
        }
    })
    
    await manager.broadcast({
        "type": "stats_update",
        "data": state.stats
    })
    
    return settlement


# ============================================================================
# REST API Endpoints
# ============================================================================

@app.get("/")
async def root():
    return {"message": "Lendora AI API", "version": "2.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


# --- Dashboard ---

@app.get("/api/dashboard/stats")
async def get_stats():
    return state.stats

@app.get("/api/trades/history")
async def get_trades():
    return state.trades[:20]


# --- Credit Check ---

@app.post("/api/midnight/credit-check")
async def credit_check(req: CreditCheckRequest, background_tasks: BackgroundTasks):
    """Submit credit score for ZK verification."""
    result = await perform_credit_check(req.borrower_address, req.credit_score)
    return result


# --- Loan Workflow ---

@app.post("/api/workflow/start")
async def start_workflow(req: WorkflowRequest):
    """Start the complete lending workflow."""
    state.stats["agentStatus"] = "negotiating"
    
    await manager.broadcast({
        "type": "workflow_started",
        "data": {"borrower": req.borrower_address, "principal": req.principal}
    })
    
    await manager.broadcast({
        "type": "agent_status",
        "data": {"status": "negotiating", "task": "Starting workflow..."}
    })
    
    # Step 1: Credit Check
    credit = await perform_credit_check(req.borrower_address, req.credit_score)
    
    if not credit["is_eligible"]:
        state.stats["agentStatus"] = "idle"
        return {"success": False, "reason": "Credit check failed"}
    
    # Step 2: Create Loan Offer
    offer = {
        "offer_id": f"offer_{int(datetime.now().timestamp())}",
        "lender_address": req.lender_address,
        "borrower_address": req.borrower_address,
        "principal": req.principal,
        "interest_rate": req.interest_rate,
        "term_months": req.term_months
    }
    
    await manager.broadcast({
        "type": "workflow_step",
        "data": {
            "step": 2,
            "name": "Loan Offer Created",
            "status": "completed",
            "details": offer
        }
    })
    
    # Step 3: Open Hydra Head
    await open_hydra_head(offer)
    
    # Step 4: AI Analysis
    await manager.broadcast({
        "type": "workflow_step",
        "data": {
            "step": 4,
            "name": "AI Analysis (Llama 3)",
            "status": "processing",
            "details": {"rate": req.interest_rate}
        }
    })
    
    await asyncio.sleep(1)
    
    # Determine target rate
    if req.interest_rate <= 7.0:
        target = req.interest_rate
        action = "accept"
    else:
        target = round(req.interest_rate - 1.5, 1)
        action = "negotiate"
    
    await manager.broadcast({
        "type": "workflow_step",
        "data": {
            "step": 4,
            "name": "AI Analysis (Llama 3)",
            "status": "completed",
            "details": {
                "verdict": "acceptable" if req.interest_rate <= 9 else "high",
                "action": action,
                "target_rate": target
            }
        }
    })
    
    # Step 5: Negotiate
    result = await negotiate_in_hydra(target)
    
    # If counter, negotiate once more
    if result.get("action") == "counter":
        new_target = round((target + result["rate"]) / 2, 1)
        result = await negotiate_in_hydra(new_target)
    
    # Step 6: Accept and Settle
    settlement = await close_hydra_and_settle()
    
    state.stats["agentStatus"] = "profiting"
    
    await manager.broadcast({
        "type": "agent_status",
        "data": {"status": "profiting", "task": "Loan disbursed successfully!"}
    })
    
    return {
        "success": True,
        "settlement": settlement
    }


@app.post("/api/negotiation/propose")
async def propose_rate(req: NegotiationRequest):
    """Propose a rate in active negotiation."""
    result = await negotiate_in_hydra(req.proposed_rate)
    return result


@app.post("/api/negotiation/accept")
async def accept_terms():
    """Accept current terms and settle."""
    settlement = await close_hydra_and_settle()
    return settlement


# --- Agent Status ---

@app.get("/api/agent/status")
async def agent_status():
    return {
        "status": state.stats["agentStatus"],
        "current_task": "Monitoring offers" if state.stats["agentStatus"] == "idle" else "Negotiating",
        "active_negotiation": state.current_negotiation is not None
    }


@app.get("/api/agent/xai-logs")
async def xai_logs(limit: int = 20):
    """Get XAI decision logs."""
    log_file = os.path.join(os.path.dirname(__file__), "../../logs/xai_decisions.jsonl")
    logs = []
    if os.path.exists(log_file):
        with open(log_file) as f:
            for line in f:
                try:
                    logs.append(json.loads(line))
                except:
                    pass
    return logs[-limit:]


# ============================================================================
# WebSocket Endpoint
# ============================================================================

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    
    try:
        # Send initial state
        await ws.send_json({
            "type": "connected",
            "data": {"message": "Connected to Lendora AI"}
        })
        
        await ws.send_json({
            "type": "stats_update",
            "data": state.stats
        })
        
        await ws.send_json({
            "type": "agent_status",
            "data": {"status": state.stats["agentStatus"]}
        })
        
        while True:
            data = await ws.receive_text()
            msg = json.loads(data)
            
            if msg.get("type") == "ping":
                await ws.send_json({"type": "pong"})
            
    except WebSocketDisconnect:
        manager.disconnect(ws)
    except Exception as e:
        manager.disconnect(ws)


# ============================================================================
# Entry Point
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
