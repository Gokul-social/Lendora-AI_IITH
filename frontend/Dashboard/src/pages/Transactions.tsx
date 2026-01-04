/**
 * Lendora AI - Transactions Page
 * Shows transaction history
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { ArrowDown, ArrowUp, Search, ExternalLink, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Transaction {
    id: string;
    type: 'borrow' | 'lend' | 'repay' | 'interest_payment' | 'withdraw';
    amount: number;
    stablecoin: string;
    status: 'pending' | 'completed' | 'failed';
    timestamp: string;
    txHash?: string;
    description: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Transactions() {
    const { address, isConnected, network } = useWallet();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (isConnected && address) {
            fetchTransactions();
        } else {
            setLoading(false);
        }
    }, [isConnected, address]);

    const fetchTransactions = async () => {
        try {
            const response = await fetch(`${API_URL}/api/transactions/${address}`);
            if (response.ok) {
                const data = await response.json();
                setTransactions(data.transactions || []);
            }
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(tx =>
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.txHash?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'borrow':
            case 'repay':
            case 'interest_payment':
                return <ArrowDown className="w-5 h-5 text-red-500" />;
            case 'lend':
            case 'withdraw':
                return <ArrowUp className="w-5 h-5 text-green-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Completed</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="glass-card p-8 max-w-md text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                    <p className="text-muted-foreground">
                        Please connect your Ethereum wallet to view transactions
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2 text-foreground">Transactions</h1>
                <p className="text-muted-foreground">View your complete transaction history</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Transaction List */}
            {loading ? (
                <Card className="glass-card p-8 text-center">
                    <p className="text-muted-foreground">Loading transactions...</p>
                </Card>
            ) : filteredTransactions.length === 0 ? (
                <Card className="glass-card p-8 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Transactions Found</h3>
                    <p className="text-muted-foreground">
                        {searchQuery ? 'Try a different search term' : 'You haven\'t made any transactions yet'}
                    </p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredTransactions.map((tx) => (
                        <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Card className="glass-card p-5 hover:border-primary/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                                            {getTransactionIcon(tx.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold text-foreground capitalize">
                                                    {tx.type.replace('_', ' ')}
                                                </p>
                                                {getStatusBadge(tx.status)}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{tx.description}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {format(new Date(tx.timestamp), 'MMM dd, yyyy HH:mm')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-lg ${
                                            tx.type === 'lend' || tx.type === 'withdraw' 
                                                ? 'text-green-500' 
                                                : 'text-red-500'
                                        }`}>
                                            {tx.type === 'lend' || tx.type === 'withdraw' ? '+' : '-'}
                                            {tx.amount.toLocaleString()} {tx.stablecoin}
                                        </p>
                                        {tx.txHash && (
                                            <a
                                                href={`https://etherscan.io/tx/${tx.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                                            >
                                                View on Etherscan
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
