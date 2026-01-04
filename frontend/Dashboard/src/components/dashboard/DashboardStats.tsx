/**
 * Lendora AI - Dashboard Stats Component
 * Displays user balance, total supplied, total borrowed, and Net APY
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { useLendoraData } from '@/hooks/useLendoraData';
import { Wallet, ArrowUp, ArrowDown, TrendingUp, DollarSign } from 'lucide-react';
import CountUp from 'react-countup';

export function DashboardStats() {
    const { dashboard, loading } = useLendoraData();

    if (loading || !dashboard) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="glass-card p-6 animate-pulse">
                        <div className="h-20 bg-secondary/20 rounded" />
                    </Card>
                ))}
            </div>
        );
    }

    const netPosition = dashboard.totalSupplied - dashboard.totalBorrowed;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* User Balance */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="glass-card p-6 border-2 border-primary/20">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">User Balance</p>
                    <p className="text-2xl font-bold text-foreground">
                        <CountUp end={dashboard.userBalance} duration={1} decimals={4} /> ETH
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 font-mono">
                        {dashboard.walletAddress}
                    </p>
                </Card>
            </motion.div>

            {/* Total Supplied */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <ArrowUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Total Supplied</p>
                    <p className="text-2xl font-bold text-foreground">
                        $<CountUp end={dashboard.totalSupplied} duration={1} decimals={0} />
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Earning interest
                    </p>
                </Card>
            </motion.div>

            {/* Total Borrowed */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <ArrowDown className="w-5 h-5 text-red-500" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Total Borrowed</p>
                    <p className="text-2xl font-bold text-foreground">
                        $<CountUp end={dashboard.totalBorrowed} duration={1} decimals={0} />
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Paying interest
                    </p>
                </Card>
            </motion.div>

            {/* Net APY */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <Badge variant="outline" className="text-xs">
                            {netPosition >= 0 ? 'Positive' : 'Negative'}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">Net APY</p>
                    <p className={`text-2xl font-bold ${dashboard.netAPY >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        <CountUp end={dashboard.netAPY} duration={1} decimals={2} />%
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        Net position: ${netPosition >= 0 ? '+' : ''}
                        <CountUp end={netPosition} duration={1} decimals={0} />
                    </p>
                </Card>
            </motion.div>
        </div>
    );
}

