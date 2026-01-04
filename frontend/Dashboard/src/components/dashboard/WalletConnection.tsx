/**
 * Lendora AI - Enhanced Wallet Connection
 * Supports Nami and manual address input
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/hooks/useWallet';
import { Wallet, Copy, Check, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WalletConnectionProps {
    onAddressChange?: (address: string) => void;
    defaultAddress?: string;
}

export function WalletConnection({ onAddressChange, defaultAddress }: WalletConnectionProps) {
    const {
        installedWallets,
        isConnecting,
        isConnected,
        error,
        wallet,
        address,
        shortAddress,
        balance,
        network,
        connect,
        disconnect,
    } = useWallet();

    const [manualAddress, setManualAddress] = useState(defaultAddress || '');
    const [isManualMode, setIsManualMode] = useState(!defaultAddress);
    const [copied, setCopied] = useState(false);

    const handleConnect = async (walletName: 'nami' | 'eternl' | 'yoroi' | 'flint' | 'typhon' | 'gerowallet') => {
        try {
            await connect(walletName);
            setIsManualMode(false);
            if (onAddressChange && address) {
                onAddressChange(address);
            }
        } catch (err) {
            console.error('Connection error:', err);
        }
    };

    const handleManualAddress = (addr: string) => {
        setManualAddress(addr);
        if (onAddressChange) {
            onAddressChange(addr);
        }
    };

    const copyAddress = () => {
        const addr = isConnected ? address : manualAddress;
        navigator.clipboard.writeText(addr);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const currentAddress = isConnected ? address : manualAddress;
    const currentShortAddress = isConnected ? shortAddress : (manualAddress ? `${manualAddress.slice(0, 8)}...${manualAddress.slice(-8)}` : '');

    return (
        <Card className="glass-card p-4">
            <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Wallet Connection</h3>
            </div>

            {isConnected ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Connected Wallet</p>
                            <p className="font-medium">{wallet?.name || 'Unknown'}</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={disconnect}
                        >
                            Disconnect
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <div>
                            <Label className="text-xs text-muted-foreground">Address</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Input
                                    value={currentShortAddress}
                                    readOnly
                                    className="font-mono text-sm"
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={copyAddress}
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs text-muted-foreground">Balance</Label>
                                <p className="font-medium">{balance} ADA</p>
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Network</Label>
                                <p className="font-medium">{network}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Wallet Options */}
                    <div>
                        <Label className="text-sm mb-2 block">Connect Wallet</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {installedWallets
                                .filter(w => w.installed)
                                .map((wallet) => (
                                    <Button
                                        key={wallet.name}
                                        variant={wallet.name === 'eternl' ? 'default' : 'outline'}
                                        onClick={() => handleConnect(wallet.name)}
                                        disabled={isConnecting}
                                        className={`justify-start ${wallet.name === 'eternl' ? 'bg-primary text-primary-foreground' : ''}`}
                                    >
                                        <Wallet className="w-4 h-4 mr-2" />
                                        {wallet.displayName}
                                        {wallet.name === 'eternl' && (
                                            <span className="ml-auto text-xs opacity-75">Recommended</span>
                                        )}
                                    </Button>
                                ))}
                        </div>
                        {installedWallets.filter(w => w.installed).length === 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                                No wallets detected. Install Eternl or another Cardano wallet extension.
                            </p>
                        )}
                    </div>

                    {/* Manual Address Input */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm">Or Enter Address Manually</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsManualMode(!isManualMode)}
                            >
                                {isManualMode ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                            </Button>
                        </div>
                        <AnimatePresence>
                            {isManualMode && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <Input
                                        placeholder="addr1..."
                                        value={manualAddress}
                                        onChange={(e) => handleManualAddress(e.target.value)}
                                        className="font-mono text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Enter your Cardano address to use without wallet connection
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {error && (
                        <p className="text-xs text-red-500">{error}</p>
                    )}
                </div>
            )}

            {currentAddress && (
                <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-1">Active Address</p>
                    <p className="font-mono text-xs break-all">{currentAddress}</p>
                </div>
            )}
        </Card>
    );
}

