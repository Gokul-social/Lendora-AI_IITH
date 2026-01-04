/**
 * Lendora AI - Loans Page
 * Shows detailed history of borrowed and lent loans
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { useWallet } from '@/hooks/useWallet';
import { ArrowDown, ArrowUp, Clock, CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface Loan {
    id: string;
    type: 'borrowed' | 'lent';
    principal: number;
    interestRate: number;
    termMonths: number;
    status: 'active' | 'completed' | 'defaulted';
    startDate: string;
    endDate?: string;
    amountPaid?: number;
    amountRemaining?: number;
    borrowerAddress?: string;
    lenderAddress?: string;
    stablecoin: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Loans() {
    const { address, isConnected } = useWallet();
    const [borrowedLoans, setBorrowedLoans] = useState<Loan[]>([]);
    const [lentLoans, setLentLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isConnected && address) {
            fetchLoans();
        } else {
            setLoading(false);
        }
    }, [isConnected, address]);

    const fetchLoans = async () => {
        try {
            // Fetch actual loans from API
            const response = await fetch(`${API_URL}/api/loans/${address}`);
            if (response.ok) {
                const data = await response.json();
                setBorrowedLoans(data.borrowed || []);
                setLentLoans(data.lent || []);
            } else {
                // If endpoint doesn't exist, use empty arrays
                console.log('Loans API not available');
            }
        } catch (error) {
            console.error('Failed to fetch loans:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-blue-500">Active</Badge>;
            case 'completed':
                return <Badge className="bg-green-500">Completed</Badge>;
            case 'defaulted':
                return <Badge variant="destructive">Defaulted</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <Clock className="w-4 h-4 text-blue-500" />;
            case 'completed':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'defaulted':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <AlertCircle className="w-4 h-4 text-gray-500" />;
        }
    };

    const LoanCard = ({ loan }: { loan: Loan }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card className="glass-card p-5 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {loan.type === 'borrowed' ? (
                            <ArrowDown className="w-6 h-6 text-red-500" />
                        ) : (
                            <ArrowUp className="w-6 h-6 text-green-500" />
                        )}
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-foreground">
                                    {loan.principal.toLocaleString()} {loan.stablecoin}
                                </h3>
                                {getStatusBadge(loan.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {loan.type === 'borrowed' ? 'Borrowed from' : 'Lent to'}{' '}
                                {loan.type === 'borrowed' 
                                    ? loan.lenderAddress?.slice(0, 6) + '...' + loan.lenderAddress?.slice(-4)
                                    : loan.borrowerAddress?.slice(0, 6) + '...' + loan.borrowerAddress?.slice(-4)
                                }
                            </p>
                        </div>
                    </div>
                    {getStatusIcon(loan.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Interest Rate</p>
                        <p className="font-semibold text-foreground">{loan.interestRate}% APR</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Term</p>
                        <p className="font-semibold text-foreground">{loan.termMonths} months</p>
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                        <p className="font-semibold text-foreground text-sm">
                            {format(new Date(loan.startDate), 'MMM dd, yyyy')}
                        </p>
                    </div>
                    {loan.endDate && (
                        <div>
                            <p className="text-xs text-muted-foreground mb-1">End Date</p>
                            <p className="font-semibold text-foreground text-sm">
                                {format(new Date(loan.endDate), 'MMM dd, yyyy')}
                            </p>
                        </div>
                    )}
                </div>

                {loan.status === 'active' && loan.amountRemaining && (
                    <div className="pt-4 border-t border-border">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Remaining Balance</span>
                            <span className="font-semibold text-foreground">
                                {loan.amountRemaining.toLocaleString()} {loan.stablecoin}
                            </span>
                        </div>
                    </div>
                )}

                <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                        View Details
                    </Button>
                    <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                </div>
            </Card>
        </motion.div>
    );

    if (!isConnected) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="glass-card p-8 max-w-md text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                    <p className="text-muted-foreground">
                        Please connect your Ethereum wallet to view your loans
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2 text-foreground">My Loans</h1>
                <p className="text-muted-foreground">View all your borrowed and lent loans</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <ArrowDown className="w-5 h-5 text-red-500" />
                        <h3 className="font-semibold text-foreground">Total Borrowed</h3>
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-1">
                        ${borrowedLoans.reduce((sum, loan) => sum + loan.principal, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {borrowedLoans.filter(l => l.status === 'active').length} active loans
                    </p>
                </Card>

                <Card className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-2">
                        <ArrowUp className="w-5 h-5 text-green-500" />
                        <h3 className="font-semibold text-foreground">Total Lent</h3>
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-1">
                        ${lentLoans.reduce((sum, loan) => sum + loan.principal, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                        {lentLoans.filter(l => l.status === 'active').length} active loans
                    </p>
                </Card>
            </div>

            {/* Loans Tabs */}
            <Tabs defaultValue="borrowed" className="w-full">
                <TabsList className="grid w-full md:w-auto grid-cols-2">
                    <TabsTrigger value="borrowed">
                        Borrowed ({borrowedLoans.length})
                    </TabsTrigger>
                    <TabsTrigger value="lent">
                        Lent ({lentLoans.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="borrowed" className="space-y-4 mt-6">
                    {loading ? (
                        <Card className="glass-card p-8 text-center">
                            <p className="text-muted-foreground">Loading loans...</p>
                        </Card>
                    ) : borrowedLoans.length === 0 ? (
                        <Card className="glass-card p-8 text-center">
                            <ArrowDown className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-xl font-semibold mb-2">No Borrowed Loans</h3>
                            <p className="text-muted-foreground mb-4">
                                You haven't borrowed any loans yet
                            </p>
                        </Card>
                    ) : (
                        borrowedLoans.map((loan) => <LoanCard key={loan.id} loan={loan} />)
                    )}
                </TabsContent>

                <TabsContent value="lent" className="space-y-4 mt-6">
                    {loading ? (
                        <Card className="glass-card p-8 text-center">
                            <p className="text-muted-foreground">Loading loans...</p>
                        </Card>
                    ) : lentLoans.length === 0 ? (
                        <Card className="glass-card p-8 text-center">
                            <ArrowUp className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-xl font-semibold mb-2">No Lent Loans</h3>
                            <p className="text-muted-foreground mb-4">
                                You haven't lent any funds yet
                            </p>
                        </Card>
                    ) : (
                        lentLoans.map((loan) => <LoanCard key={loan.id} loan={loan} />)
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
