/**
 * Lendora AI - Stablecoin Selector
 * Select which stablecoin to lend/borrow with suggestions
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export type Stablecoin = 'USDT' | 'USDC' | 'DAI' | 'USDD' | 'TUSD' | 'BUSD';

interface StablecoinData {
    symbol: Stablecoin;
    name: string;
    apy: number;
    liquidity: number;
    trend: 'up' | 'down' | 'stable';
    recommendation: 'high' | 'medium' | 'low';
    description: string;
}

const STABLECOIN_DATA: Record<Stablecoin, StablecoinData> = {
    USDT: {
        symbol: 'USDT',
        name: 'Tether USD',
        apy: 8.5,
        liquidity: 95,
        trend: 'up',
        recommendation: 'high',
        description: 'Highest liquidity, most stable'
    },
    USDC: {
        symbol: 'USDC',
        name: 'USD Coin',
        apy: 7.8,
        liquidity: 88,
        trend: 'stable',
        recommendation: 'high',
        description: 'Regulated, trusted by institutions'
    },
    DAI: {
        symbol: 'DAI',
        name: 'Dai Stablecoin',
        apy: 9.2,
        liquidity: 72,
        trend: 'up',
        recommendation: 'medium',
        description: 'Decentralized, over-collateralized'
    },
    USDD: {
        symbol: 'USDD',
        name: 'Decentralized USD',
        apy: 10.1,
        liquidity: 45,
        trend: 'down',
        recommendation: 'low',
        description: 'Higher yield, lower liquidity'
    },
    TUSD: {
        symbol: 'TUSD',
        name: 'TrueUSD',
        apy: 7.2,
        liquidity: 38,
        trend: 'stable',
        recommendation: 'low',
        description: 'Audited, lower volume'
    },
    BUSD: {
        symbol: 'BUSD',
        name: 'Binance USD',
        apy: 6.8,
        liquidity: 52,
        trend: 'down',
        recommendation: 'low',
        description: 'Being phased out by Binance'
    },
};

interface StablecoinSelectorProps {
    value?: Stablecoin;
    onChange?: (coin: Stablecoin) => void;
    showSuggestions?: boolean;
}

export function StablecoinSelector({ value, onChange, showSuggestions = true }: StablecoinSelectorProps) {
    const [selected, setSelected] = useState<Stablecoin>(value || 'USDT');
    const [suggestions, setSuggestions] = useState<StablecoinData[]>([]);

    useEffect(() => {
        // Calculate suggestions based on APY, liquidity, and trends
        const sorted = Object.values(STABLECOIN_DATA)
            .sort((a, b) => {
                // Score: (APY * 0.4) + (Liquidity * 0.4) + (Trend bonus * 0.2)
                const scoreA = (a.apy * 0.4) + (a.liquidity * 0.4) + (a.trend === 'up' ? 2 : a.trend === 'stable' ? 1 : 0);
                const scoreB = (b.apy * 0.4) + (b.liquidity * 0.4) + (b.trend === 'up' ? 2 : b.trend === 'stable' ? 1 : 0);
                return scoreB - scoreA;
            })
            .slice(0, 3);
        
        setSuggestions(sorted);
    }, []);

    const handleChange = (coin: Stablecoin) => {
        setSelected(coin);
        if (onChange) {
            onChange(coin);
        }
    };

    const selectedData = STABLECOIN_DATA[selected];

    return (
        <div className="space-y-4">
            <div>
                <Label className="text-sm mb-2 block">Select Stablecoin</Label>
                <Select value={selected} onValueChange={handleChange}>
                    <SelectTrigger className="w-full">
                        <SelectValue>
                            <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                {selectedData.name} ({selectedData.symbol})
                            </div>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(STABLECOIN_DATA).map((coin) => (
                            <SelectItem key={coin.symbol} value={coin.symbol}>
                                <div className="flex items-center justify-between w-full">
                                    <span>{coin.name} ({coin.symbol})</span>
                                    <span className="text-xs text-muted-foreground ml-4">
                                        {coin.apy}% APY
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Selected Coin Info */}
            <Card className="glass-card p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="font-medium">{selectedData.name}</span>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                        selectedData.recommendation === 'high' ? 'bg-green-500/20 text-green-500' :
                        selectedData.recommendation === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-red-500/20 text-red-500'
                    }`}>
                        {selectedData.recommendation === 'high' ? 'Recommended' :
                         selectedData.recommendation === 'medium' ? 'Good' : 'Consider'}
                    </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{selectedData.description}</p>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                        <p className="text-muted-foreground">APY</p>
                        <p className="font-medium">{selectedData.apy}%</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Liquidity</p>
                        <p className="font-medium">{selectedData.liquidity}%</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground">Trend</p>
                        <div className="flex items-center gap-1">
                            {selectedData.trend === 'up' ? (
                                <TrendingUp className="w-3 h-3 text-green-500" />
                            ) : selectedData.trend === 'down' ? (
                                <TrendingDown className="w-3 h-3 text-red-500" />
                            ) : (
                                <div className="w-3 h-3 rounded-full bg-gray-500" />
                            )}
                            <span className="capitalize">{selectedData.trend}</span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
                <Card className="glass-card p-3">
                    <div className="flex items-center gap-2 mb-3">
                        <Info className="w-4 h-4 text-primary" />
                        <Label className="text-sm">Top Recommendations</Label>
                    </div>
                    <div className="space-y-2">
                        {suggestions.map((coin, idx) => (
                            <motion.div
                                key={coin.symbol}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                    selected === coin.symbol ? 'bg-primary/20 border border-primary' :
                                    'hover:bg-muted/50 border border-transparent'
                                }`}
                                onClick={() => handleChange(coin.symbol)}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                        idx === 0 ? 'bg-green-500' :
                                        idx === 1 ? 'bg-yellow-500' : 'bg-gray-500'
                                    }`} />
                                    <span className="font-medium text-sm">{coin.symbol}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {coin.apy}% APY • {coin.liquidity}% Liquidity
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}

