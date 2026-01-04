"""
Lendora AI - Agents Module
Privacy-First AI Agents for DeFi Lending on Cardano

Architecture:
    Lender --> Loan Offer --> AI Agent (Lenny)
                                  |
                            Analyze with Llama 3
                                  |
                            Open Hydra Head
                                  |
                         Negotiate (off-chain)
                                  |
                            Accept Terms
                                  |
                    Close Head --> Settlement Tx
                                  |
                        Aiken Validator (verify dual sig)
                                  |
                            Loan Disbursed!

Agents:
- Borrower Agent ("Lenny"): Analyzes offers, negotiates in Hydra, settles on-chain
- Lender Agent ("Luna"): Creates offers, evaluates risk, signs settlements
"""

from .borrower_agent import (
    create_borrower_agent,
    run_complete_workflow,
    LoanOffer,
    HydraHeadManager,
)
from .lender_agent import (
    create_lender_agent,
    run_lender_agent,
    handle_negotiation_request,
    LendingPool,
)

__all__ = [
    # Borrower Agent (Lenny)
    "create_borrower_agent",
    "run_complete_workflow",
    "LoanOffer",
    "HydraHeadManager",
    # Lender Agent (Luna)
    "create_lender_agent",
    "run_lender_agent",
    "handle_negotiation_request",
    "LendingPool",
]
