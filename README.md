<div align="center">

#  Lendora AI

### Privacy-First DeFi Lending Protocol Powered by AI Agents

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-L2-purple.svg)](https://ethereum.org/)

<p align="center">
  <strong>AI-powered loan negotiations • Zero-knowledge credit scoring • Immersive 3D dashboard</strong>
</p>

[Quick Start](#-quick-start) •
[Features](#-features) •
[Architecture](#-architecture) •
[Documentation](#-documentation) •
[Deployment](#-deployment)

</div>

---

##  Overview

Lendora AI is a decentralized lending protocol that revolutionizes DeFi lending through:

- **AI Agent Negotiation**: Autonomous agents (Lenny the Borrower, Luna the Lender) negotiate optimal loan terms using Llama 3
- **Zero-Knowledge Credit Scoring**: Verify creditworthiness without revealing sensitive financial data using Circom/SnarkJS
- **Ethereum L2 Settlement**: Fast, low-cost transactions on Arbitrum/Optimism
- **Immersive Dashboard**: Beautiful 3D interface built with React Three Fiber

##  Features

| Feature | Description |
|---------|-------------|
|  **AI Agents** | CrewAI-powered agents negotiate loan terms autonomously |
|  **ZK Proofs** | Privacy-preserving credit checks via Circom circuits |
|  **Layer 2** | Ethereum L2 (Arbitrum) for fast, cheap settlements |
|  **3D Dashboard** | Immersive React Three Fiber interface |
|  **Real-time Updates** | WebSocket-powered live negotiation tracking |
|  **Analytics** | Interactive charts and portfolio tracking |
|  **Dark/Light Mode** | Beautiful themes with glassmorphism design |

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ 3D Dashboard│  │ Wallet      │  │ Real-time WebSocket     │  │
│  │ (R3F/Drei)  │  │ Connection  │  │ Updates                 │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST API / WebSocket
┌───────────────────────────▼─────────────────────────────────────┐
│                      BACKEND (FastAPI)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ AI Agents   │  │ ZK Proofs   │  │ Ethereum TX Builder     │  │
│  │ (CrewAI)    │  │ (Circom)    │  │ (Web3.py)               │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    SMART CONTRACTS (Solidity)                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ LoanManager │  │ Collateral  │  │ CreditScoreVerifier     │  │
│  │             │  │ Vault       │  │ (ZK Verifier)           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                      Arbitrum / Optimism L2                     │
└─────────────────────────────────────────────────────────────────┘
```

##  Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.10+
- **Docker** (optional, for containerized deployment)

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-username/Lendora-AI.git
cd Lendora-AI

# Copy environment file
cp env.example .env

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:80
# Backend:  http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

#### Backend

```bash
# Install Python dependencies
pip install -r requirements.txt
pip install -r backend/api/requirements.txt

# Start the FastAPI server
cd backend/api
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend

```bash
# Navigate to frontend
cd frontend/Dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

**Access Points:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs
- WebSocket: ws://localhost:8000/ws

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Frontend (Vercel)
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# Backend (Railway)
PORT=8000
HOST=0.0.0.0
OLLAMA_BASE_URL=http://localhost:11434

# Ethereum
ETHEREUM_NETWORK=arbitrum-sepolia
ETHEREUM_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
```

See [`env.example`](./env.example) for all available options.

##  Project Structure

```
Lendora-AI/
├── agents/                     # AI Agents (CrewAI)
│   ├── borrower_agent.py       # Lenny - Borrower AI
│   ├── lender_agent.py         # Luna - Lender AI
│   └── multi_agent_negotiation.py
├── backend/
│   ├── api/
│   │   └── server.py           # FastAPI backend
│   ├── ethereum/               # Ethereum transaction builder
│   ├── oracles/                # Chainlink oracle integration
│   └── zk/                     # ZK proof generator
├── contracts/
│   └── core/                   # Solidity smart contracts
│       ├── LoanManager.sol
│       ├── CollateralVault.sol
│       ├── InterestRateModel.sol
│       ├── LiquidationEngine.sol
│       └── zk/
│           └── circuits/       # Circom ZK circuits
├── frontend/
│   └── Dashboard/              # React + Vite frontend
│       └── src/
│           ├── components/     # UI components
│           │   ├── 3d/         # Three.js components
│           │   ├── dashboard/  # Dashboard widgets
│           │   └── ui/         # shadcn/ui components
│           ├── pages/          # Route pages
│           ├── hooks/          # Custom React hooks
│           └── lib/            # Utilities & API clients
├── docs/                       # Documentation
├── docker-compose.yml          # Docker configuration
└── README.md
```

##  API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET` | `/api/dashboard/stats` | Dashboard statistics |
| `POST` | `/api/zk/credit-check` | Submit ZK credit verification |
| `POST` | `/api/workflow/start` | Start loan negotiation workflow |
| `POST` | `/api/negotiation/propose` | Propose interest rate |
| `POST` | `/api/negotiation/accept` | Accept loan terms |
| `GET` | `/api/agent/status` | AI agent status |
| `GET` | `/api/conversation/{id}` | Get negotiation conversation |

### WebSocket Events

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:8000/ws');

// Events received:
// - connected: Connection established
// - stats_update: Dashboard stats updated
// - agent_status: AI agent status change
// - workflow_step: Workflow progress update
// - workflow_complete: Negotiation complete
// - conversation_update: New conversation message
```

##  Deployment

### Recommended Setup

| Service | Platform | Purpose |
|---------|----------|---------|
| Frontend | Vercel | Static React app |
| Backend | Railway | FastAPI + AI agents |
| Contracts | Arbitrum | Smart contracts |

### Deploy to Vercel + Railway

```bash
# Deploy frontend to Vercel
cd frontend/Dashboard
vercel

# Deploy backend to Railway
railway login
railway init
railway up
```

See [`DEPLOY.md`](./DEPLOY.md) for detailed deployment instructions.

## 🛠 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build**: Vite 7
- **3D Graphics**: React Three Fiber + Drei
- **Animation**: Framer Motion
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: TanStack Query

### Backend
- **Framework**: FastAPI
- **AI Agents**: CrewAI + Llama 3 (via Ollama)
- **WebSocket**: FastAPI native
- **ZK Proofs**: Circom + SnarkJS

### Blockchain
- **Network**: Ethereum L2 (Arbitrum/Optimism)
- **Contracts**: Solidity + Hardhat
- **Oracles**: Chainlink
- **ZK Circuits**: Circom

##  Documentation

| Document | Description |
|----------|-------------|
| [`START_HERE.md`](./START_HERE.md) | Getting started guide |
| [`QUICKSTART.md`](./QUICKSTART.md) | Quick reference |
| [`DEPLOY.md`](./DEPLOY.md) | Deployment guide |
| [`docs/ETHEREUM_MIGRATION.md`](./docs/ETHEREUM_MIGRATION.md) | Ethereum architecture |
| [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md) | Advanced deployment |
| [`contracts/README.md`](./contracts/README.md) | Smart contract docs |

##  Security

- **ZK Proofs**: Credit scores verified without revealing actual values
- **Non-custodial**: Users maintain control of their keys
- **Access Control**: Role-based permissions in smart contracts
- **Oracle Security**: Chainlink decentralized price feeds

##  Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [CrewAI](https://crewai.com/) - AI agent framework
- [Circom](https://docs.circom.io/) - ZK circuit compiler
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - 3D graphics

---

<div align="center">

**[⬆ Back to Top](#-lendora-ai)**

Made with ❤️ by the Lendora Team

</div>
