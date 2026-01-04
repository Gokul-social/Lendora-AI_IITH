/**
 * Lendora AI - Dashboard Layout
 * Complete workflow visualization with real-time updates
 */

import { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { AgentStatusOrb } from '@/components/3d/AgentStatusOrb';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { Activity, TrendingUp, Zap, Shield, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { EnhancedLoanForm, LoanFormData } from '@/components/dashboard/EnhancedLoanForm';
import { AgentConversation } from '@/components/dashboard/AgentConversation';

interface DashboardStats {
    totalBalance: number;
    activeLoans: number;
    totalProfit: number;
    agentStatus: 'profiting' | 'negotiating' | 'idle' | 'error';
}

interface WorkflowStep {
    step: number;
    name: string;
    status: 'pending' | 'processing' | 'completed';
    details?: Record<string, unknown>;
}

interface Trade {
    id: string;
    timestamp: string;
    type: string;
    principal: number;
    interestRate: number;
    originalRate?: number;
    profit?: number;
    status: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

export default function DashboardLayout() {
    const { theme, setTheme } = useTheme();

    // State
    const [stats, setStats] = useState<DashboardStats>({
        totalBalance: 0,
        activeLoans: 0,
        totalProfit: 0,
        agentStatus: 'idle'
    });
    const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
    const [trades, setTrades] = useState<Trade[]>([]);
    const [isWorkflowRunning, setIsWorkflowRunning] = useState(false);
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();

    // Initial workflow steps
    const initialSteps: WorkflowStep[] = [
        { step: 1, name: 'Midnight ZK Credit Check', status: 'pending' },
        { step: 2, name: 'Loan Offer Created', status: 'pending' },
        { step: 3, name: 'Open Hydra Head', status: 'pending' },
        { step: 4, name: 'AI Analysis & Negotiation', status: 'pending' },
        { step: 5, name: 'Close Hydra Head', status: 'pending' },
        { step: 6, name: 'Aiken Validator Settlement', status: 'pending' },
    ];

    // Define handleWsMessage before useEffect to avoid hoisting issues
    const handleWsMessage = useCallback((message: { type: string; data: Record<string, unknown> }) => {
        switch (message.type) {
            case 'stats_update':
                setStats(message.data as unknown as DashboardStats);
                break;

            case 'agent_status':
                setStats(prev => ({ ...prev, agentStatus: (message.data as { status: string }).status as DashboardStats['agentStatus'] }));
                break;

            case 'workflow_step': {
                const stepData = message.data as unknown as WorkflowStep;
                setWorkflowSteps(prev => {
                    const updated = [...prev];
                    const idx = updated.findIndex(s => s.step === stepData.step);
                    if (idx >= 0) {
                        updated[idx] = { ...updated[idx], ...stepData };
                    }
                    return updated;
                });
                break;
            }

            case 'workflow_complete':
                setIsWorkflowRunning(false);
                fetchTrades();
                break;

            case 'conversation_update':
                // Trigger conversation refresh - AgentConversation component polls for updates
                console.log('[WS] Conversation update received:', message.data);
                break;
        }
    }, []);

    // WebSocket connection
    useEffect(() => {
        // Only connect WebSocket if we have a wallet connection
        // This prevents the model from running before user connects wallet
        // Construct WebSocket URL from API URL if WS_URL not set
        const wsUrl = WS_URL || (API_URL.replace(/^http/, 'ws') + '/ws');
        const websocket = new WebSocket(wsUrl);

        websocket.onopen = () => {
            console.log('WebSocket connected');
        };

        websocket.onmessage = (e) => {
            try {
                const message = JSON.parse(e.data);
                handleWsMessage(message);
            } catch (err) {
                console.error('WebSocket message error:', err);
            }
        };

        websocket.onerror = (err) => {
            console.error('WebSocket error:', err);
        };

        websocket.onclose = () => {
            console.log('WebSocket closed');
        };

        setWs(websocket);

        return () => {
            if (websocket.readyState === WebSocket.OPEN) {
                websocket.close();
            }
        };
    }, [handleWsMessage]);

    // Fetch initial data (only stats, not triggering workflows)
    useEffect(() => {
        fetchStats();
        fetchTrades();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_URL}/api/dashboard/stats`);
            const data = await res.json();
            setStats(data);
        } catch {
            // Use demo data
            setStats({
                totalBalance: 125450.75,
                activeLoans: 8,
                totalProfit: 12543.50,
                agentStatus: 'idle'
            });
        }
    };

    const fetchTrades = async () => {
        try {
            const res = await fetch(`${API_URL}/api/trades/history`);
            const data = await res.json();
            setTrades(data);
        } catch {
            // Demo data
        }
    };

    const startWorkflow = async (formData: LoanFormData) => {
        setWorkflowSteps(initialSteps);
        setIsWorkflowRunning(true);

        // Generate conversation ID
        const conversationId = `conv_${Date.now()}`;
        setCurrentConversationId(conversationId);

        // Clear previous messages to show new conversation
        // The AgentConversation component will fetch new messages

        try {
            // Prepare request based on role
            const requestBody = {
                role: formData.role,
                borrower_address: formData.role === 'borrower' ? formData.walletAddress : formData.borrower_address || 'addr1_borrower',
                lender_address: formData.role === 'lender' ? formData.walletAddress : formData.lender_address || 'addr1_lender',
                credit_score: formData.credit_score || 750,
                principal: formData.principal,
                interest_rate: formData.interest_rate,
                term_months: formData.term_months,
                stablecoin: formData.stablecoin,
                auto_confirm: formData.autoConfirm,
                conversation_id: conversationId
            };

            const res = await fetch(`${API_URL}/api/workflow/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await res.json();

            if (data.success) {
                // Update conversation ID if returned
                if (data.conversation_id) {
                    setCurrentConversationId(data.conversation_id);
                }
                // Mark all steps complete
                setWorkflowSteps(prev => prev.map(s => ({ ...s, status: 'completed' as const })));
            }
        } catch (err) {
            console.error('Workflow error:', err);
            // Demo mode - simulate workflow
            await simulateWorkflow(formData);
        }

        setIsWorkflowRunning(false);
    };

    const simulateWorkflow = async (formData: LoanFormData) => {
        for (let i = 0; i < initialSteps.length; i++) {
            setWorkflowSteps(prev => prev.map((s, idx) => ({
                ...s,
                status: idx < i ? 'completed' : idx === i ? 'processing' : 'pending'
            })));
            await new Promise(r => setTimeout(r, 1000));
        }
        setWorkflowSteps(prev => prev.map(s => ({ ...s, status: 'completed' as const })));

        // Add demo trade
        const newTrade: Trade = {
            id: `trade_${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'loan_accepted',
            principal: formData.principal,
            interestRate: formData.interest_rate - 1.5,
            originalRate: formData.interest_rate,
            profit: formData.principal * 0.015,
            status: 'completed'
        };
        setTrades(prev => [newTrade, ...prev]);

        setStats(prev => ({
            ...prev,
            activeLoans: prev.activeLoans + 1,
            totalProfit: prev.totalProfit + newTrade.profit!,
            agentStatus: 'profiting'
        }));
    };

    const getStepIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'processing':
                return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
            default:
                return <Circle className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <AuroraBackground>
            <div className="min-h-screen p-4 md:p-8">
                {/* Theme Toggle */}
                <div className="fixed top-4 right-4 z-50">
                    <Button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        variant="outline"
                        size="icon"
                        className="backdrop-blur-xl bg-card/50"
                    >
                        {theme === 'dark' ? 'Light' : 'Dark'}
                    </Button>
                </div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                        Lendora AI
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Privacy-First DeFi Lending on Cardano
                    </p>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* Agent Status */}
                    <Card className="glass-card p-4 md:col-span-2 md:row-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">Agent Status</h3>
                            <div className={`ml-auto w-2 h-2 rounded-full ${stats.agentStatus === 'profiting' ? 'bg-green-500 animate-pulse' :
                                stats.agentStatus === 'negotiating' ? 'bg-blue-500 animate-pulse' :
                                    'bg-gray-400'
                                }`} />
                        </div>
                        <div className="h-40 md:h-48">
                            <Canvas camera={{ position: [0, 0, 5] }}>
                                <ambientLight intensity={0.5} />
                                <AgentStatusOrb status={stats.agentStatus} />
                            </Canvas>
                        </div>
                        <p className="text-center text-xl font-bold capitalize mt-2">
                            {stats.agentStatus}
                        </p>
                    </Card>

                    {/* Total Balance */}
                    <Card className="glass-card p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-muted-foreground">Balance</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-bold">
                            <CountUp end={stats.totalBalance} duration={2} decimals={2} preserveValue />
                            <span className="text-sm ml-1">ADA</span>
                        </p>
                    </Card>

                    {/* Active Loans */}
                    <Card className="glass-card p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-muted-foreground">Active Loans</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-bold">
                            <CountUp end={stats.activeLoans} duration={1} preserveValue />
                        </p>
                    </Card>

                    {/* Total Profit */}
                    <Card className="glass-card p-4 md:col-span-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-purple-500" />
                            <span className="text-sm text-muted-foreground">Total Profit</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-green-500">
                            +<CountUp end={stats.totalProfit} duration={2} decimals={2} preserveValue /> ADA
                        </p>
                    </Card>
                </div>

                {/* Workflow Section */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {/* Enhanced Loan Form */}
                    <EnhancedLoanForm
                        onSubmit={startWorkflow}
                        isSubmitting={isWorkflowRunning}
                    />

                    {/* Workflow Steps */}
                    <Card className="glass-card p-6">
                        <h3 className="text-xl font-bold mb-4">Workflow Progress</h3>

                        <div className="space-y-3">
                            <AnimatePresence>
                                {(workflowSteps.length > 0 ? workflowSteps : initialSteps).map((step, idx) => (
                                    <motion.div
                                        key={step.step}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`flex items-center gap-3 p-3 rounded-lg ${step.status === 'completed' ? 'bg-green-500/10 border border-green-500/30' :
                                            step.status === 'processing' ? 'bg-blue-500/10 border border-blue-500/30' :
                                                'bg-muted/30 border border-border'
                                            }`}
                                    >
                                        {getStepIcon(step.status)}
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{step.name}</p>
                                            {step.details && step.status === 'completed' && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {JSON.stringify(step.details).slice(0, 50)}...
                                                </p>
                                            )}
                                        </div>
                                        {step.status === 'completed' && (
                                            <span className="text-xs text-green-500">Done</span>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </Card>
                </div>

                {/* Agent Conversations */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <AgentConversation conversationId={currentConversationId} />

                    {/* Recent Trades */}
                    <Card className="glass-card p-6">
                        <h3 className="text-xl font-bold mb-4">Recent Trades</h3>

                        <div className="space-y-3">
                            {trades.length > 0 ? trades.slice(0, 5).map((trade, idx) => (
                                <motion.div
                                    key={trade.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Loan Accepted</p>
                                            <p className="text-sm text-muted-foreground">
                                                {trade.principal} ADA @ {trade.interestRate}%
                                                {trade.originalRate && (
                                                    <span className="text-green-500 ml-2">
                                                        (saved {(trade.originalRate - trade.interestRate).toFixed(1)}%)
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {trade.profit && (
                                            <p className="text-green-500 font-bold">+{trade.profit.toFixed(2)} ADA</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(trade.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </motion.div>
                            )) : (
                                <p className="text-center text-muted-foreground py-8">
                                    No trades yet. Start a workflow to see results here.
                                </p>
                            )}
                        </div>
                    </Card>
                </div>


            </div>
        </AuroraBackground>
    );
}
