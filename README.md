# Lendora AI

**Privacy-First DeFi Lending**

Lendora is a decentralized lending protocol that uses AI agents to negotiate loans with zero-knowledge proofs for credit scoring, and featuring an immersive dashboard interface.

## 🚀 Ethereum Migration Status

**Lendora AI is being migrated from Cardano to Ethereum L2 (Arbitrum/Optimism).**

### ✅ Completed
- Solidity smart contracts (LoanManager, CollateralVault, InterestRateModel, LiquidationEngine)
- ZK circuit for credit scores (Circom)
- Ethereum transaction builder (Web3.py)
- Chainlink oracle integration
- ZK proof generator (SnarkJS)

### ⏳ In Progress
- AI agent updates for Ethereum L2
- Frontend wallet integration (MetaMask/WalletConnect)
- Backend API updates

See [ETHEREUM_MIGRATION.md](docs/ETHEREUM_MIGRATION.md) and [MIGRATION_SUMMARY.md](docs/MIGRATION_SUMMARY.md) for details.

---

## Cardano Stack (Legacy)

The original Cardano-based implementation is still available but will be deprecated. See below for Cardano-specific documentation.

## Quick Start

### Docker Deployment (Recommended)

```bash
# Full stack deployment
./deploy.sh

# Or manually
docker-compose up -d

# Production deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Vercel Deployment (Cloud)

**IMPORTANT:** Vercel has a 250MB limit for serverless functions. The full backend with AI dependencies exceeds this limit.

**Recommended Deployment Strategy:**

1. **Frontend on Vercel** (Recommended):
   ```bash
   vercel --prod
   ```
   - Deploys React frontend successfully
   - Fast, reliable hosting
   - No size limitations for static assets

2. **Backend on Railway/Render** (Recommended for full AI features):
   - Deploy backend separately to Railway or Render
   - These platforms support larger dependencies and longer timeouts
   - Full AI capabilities with Ollama integration

3. **Backend on Vercel** (Minimal mode only):
   ```bash
   vercel --prod --local-config vercel-backend.json
   ```
   - Only basic API endpoints (no AI features)
   - Excludes heavy dependencies to stay under 250MB limit
   - Use this only if you don't need AI negotiation features

**Vercel Dashboard Setup:**
1. Go to your project settings
2. Add these environment variables:
   - `VITE_API_URL` = `https://your-backend-url.railway.app` (or Render URL)
   - `VITE_WS_URL` = `wss://your-backend-url.railway.app` (or Render URL)

**Access Points:**
- Frontend: https://your-project.vercel.app
- Backend API: https://your-backend.railway.app (or Render)
- API Documentation: https://your-backend.railway.app/docs

**Docker Access Points:**
- Frontend: http://localhost:80
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Manual Setup

```bash
# Start Backend
cd backend/api
uvicorn server:app --host 0.0.0.0 --port 8000

# Start Frontend (separate terminal)
cd frontend/Dashboard
npm run dev

# Access:
# Frontend: http://localhost:8080
# API Docs: http://localhost:8000/docs
```

## Architecture

```mermaid
sequenceDiagram
    participant B as Borrower
    participant M as Midnight Network
    participant L as Lender
    participant AI as AI Agent (Lenny)
    participant H as Hydra Head
    participant A as Aiken Validator

    B->>M: Submit Credit Score (private)
    M->>L: is_eligible: true (ZK proof)
    Note over M,L: Score remains HIDDEN!
    L->>AI: Loan Offer (8.5%)
    AI->>AI: Analyze with Llama 3
    AI->>H: Open Hydra Head
    loop Off-chain Negotiation
        AI->>H: Counter-offer (zero gas)
        H->>H: Real-time negotiation
    end
    AI->>H: Accept Final Terms (7.0%)
    H->>A: Close Head + Settlement Tx
    A->>A: Verify Dual Signatures
    A->>B: Loan Disbursed!
    Note over B,A: Saved 1.5% through AI negotiation!
```

### Core Components

- **Midnight Network**: Zero-knowledge credit verification ([docs/midnight.md](docs/midnight.md))
- **Hydra Heads**: Layer 2 scaling for off-chain negotiations ([docs/hydra.md](docs/hydra.md))
- **AI Agents**: Automated loan analysis and negotiation ([docs/masumi.md](docs/masumi.md))
- **Aiken Validators**: On-chain settlement verification

### Data Flow

Borrower → Midnight ZK Check → Lender Offer → AI Analysis → Hydra Negotiation → Aiken Settlement

## Technology Stack

### Backend Components

| Component | Technology | Description |
|-----------|------------|-------------|
| AI Agents | CrewAI + Llama 3 | Loan negotiation automation |
| Layer 2 Scaling | Hydra Head Protocol | Zero-gas off-chain negotiations |
| Smart Contracts | Aiken Language | Settlement validation |
| Privacy Layer | Midnight Network | Zero-knowledge proofs |
| API Layer | FastAPI + WebSockets | Real-time communication |

### Frontend Components

| Component | Technology | Description |
|-----------|------------|-------------|
| UI Framework | React + TypeScript | Type-safe user interface |
| Build System | Vite | Fast development and bundling |
| Styling | Tailwind CSS | Utility-first CSS framework |
| State Management | React Query | Server state synchronization |

## Key Features

### Complete Lending Workflow

1. Privacy-Preserving Credit Checks - Zero-knowledge proofs via Midnight Network
2. AI-Powered Analysis - Local Llama 3 model analyzes loan terms
3. Layer 2 Negotiation - Zero-gas Hydra Head protocol for off-chain negotiation
4. Automated Settlement - Smart contract verification with dual signatures
5. Real-time Monitoring - WebSocket-based live updates

### AI Agent System

- Borrower Agent (Lenny) - Optimizes loan terms through negotiation
- Lender Agent (Luna) - Risk assessment and counter-offer evaluation
- Explainable AI - Decision logging with reasoning and confidence scores

### Frontend Dashboard

- Wallet Connection - Eternl, Nami, and other CIP-30 wallets
- Role Selection - Choose to be Borrower or Lender
- Stablecoin Selection - USDT, USDC, DAI with liquidity suggestions
- Auto-Confirm Toggle - Let AI auto-accept good deals
- Agent Conversations - Real-time negotiation chat between agents
- Workflow Visualizer - Live step-by-step progress
- Trade History - Completed loans with savings shown

## Installation

### Prerequisites

- Node.js 18+
- Python 3.10+
- Ollama (for local AI models)

### Setup

```bash
# Clone repository
git clone <repository-url>
cd Lendora-AI

# Install dependencies
pip install -r requirements.txt
pip install -r backend/api/requirements.txt

cd frontend/Dashboard
npm install
cd ../..

# Install Ollama and models
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3
```

### Running

```bash
# Terminal 1 - Backend
cd backend/api
uvicorn server:app --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend/Dashboard
npm run dev

# Terminal 3 - Ollama
ollama serve
```

### Access Points

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:8000 |
| API Documentation | http://localhost:8000/docs |

## API Reference

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/workflow/start` | POST | Initiate lending workflow |
| `/api/dashboard/stats` | GET | Get dashboard statistics |
| `/api/trades/history` | GET | Retrieve trade history |
| `/api/agent/status` | GET | Check AI agent status |
| `/ws` | WebSocket | Real-time updates |

## Project Structure

```
Lendora-AI/
├── agents/                      # AI agent implementations
│   ├── borrower_agent.py       # Borrower negotiation agent
│   ├── lender_agent.py         # Lender evaluation agent
│   └── masumi/                 # Masumi Cardano analysis tools
├── backend/                    # Backend services
│   ├── api/server.py          # FastAPI backend server
│   ├── cardano/               # Cardano transaction builders
│   └── midnight/              # Midnight ZK client
├── contracts/                  # Aiken smart contracts
├── frontend/Dashboard/         # React frontend application
├── hydra/                     # Hydra Head protocol client
├── midnight/                  # Midnight compiled contracts
└── docs/                      # Documentation and guides
    ├── hydra.md               # Hydra Head protocol integration
    ├── midnight.md            # Midnight ZK proofs
    └── masumi.md              # Masumi AI agent system
```

## Configuration

### Environment Variables

Environment variables can be set in a `.env` file:

```env
# Backend Configuration
OLLAMA_BASE_URL=http://localhost:11434
HYDRA_NODE_URL=ws://127.0.0.1:4001
HYDRA_MODE=auto
PORT=8000

# Midnight Network (optional)
MIDNIGHT_API_URL=https://api.midnight.network
KUPO_BASE_URL=https://kupo-preprod.kupo.network

# Frontend Configuration
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

## Development

### Testing

```bash
# Test Python syntax
python -m py_compile agents/*.py backend/api/server.py

# Build frontend
cd frontend/Dashboard
npm run build
```

### Vercel Deployment Notes

**CRITICAL:** Vercel has a **250MB unzipped size limit** for serverless functions. The full backend with AI dependencies exceeds this limit.

**Solution - Split Deployment (Recommended):**

1. **Frontend on Vercel** (works perfectly):
   ```bash
   vercel --prod
   ```
   - No size issues
   - Fast, reliable hosting
   - Perfect for React apps

2. **Backend on Railway/Render** (for full AI features):
   ```bash
   # Railway (recommended)
   railway login
   railway init
   railway up
   ```
   - Supports full AI dependencies
   - No size limits
   - Better for long-running processes

3. **Minimal Backend on Vercel** (basic API only):
   ```bash
   vercel --prod --local-config vercel-backend.json
   ```
   - Only basic endpoints (no AI features)
   - Uses minimal dependencies (~50MB)
   - Good for simple API needs

**Other Vercel Limitations:**
- Ollama not available - Use external Ollama instance
- Function timeout - 10s limit (too short for AI negotiations)
- Storage limits - No persistent storage

**For Local Development:**
- Use Docker deployment (`./deploy.sh`)
- Ollama runs locally with full AI capabilities

## Resources

- [Hydra Head Protocol](https://hydra.family/head-protocol/)
- [Aiken Smart Contracts](https://aiken-lang.org/)
- [Midnight Network](https://midnight.network/)
- [CrewAI Framework](https://docs.crewai.com/)
- [Ollama](https://ollama.com/)

## Documentation

- [Hydra Integration](docs/hydra.md)
- [Midnight ZK Proofs](docs/midnight.md)
- [Masumi AI Agent](docs/masumi.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## License

MIT License
