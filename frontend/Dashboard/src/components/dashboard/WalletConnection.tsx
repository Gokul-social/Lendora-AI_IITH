/**
 * Lendora AI - Enhanced Wallet Connection
 * Supports MetaMask and manual address input
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWallet } from '@/hooks/useWallet';
import { Wallet, Copy, Check, Edit2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { WalletName } from '@/lib/wallet/ethereum-wallet';

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

    const handleConnect = async (walletName: WalletName) => {
        try {
            await connect(walletName);
            setIsManualMode(false);
        } catch (err) {
            console.error('Connection error:', err);
            // Error is handled by the useWallet hook and displayed
        }
    };

    const handleRetryConnection = async () => {
        // Force a fresh connection attempt
        if (installedWallets.length > 0) {
            const metamaskWallet = installedWallets.find(w => w.name === 'metamask' && w.installed);
            if (metamaskWallet) {
                await handleConnect('metamask');
            }
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

    const isValidAddress = (addr: string) => {
        return addr && addr.startsWith('0x') && addr.length === 42;
    };

    const currentAddress = isConnected ? address : manualAddress;
    const currentShortAddress = isConnected ? shortAddress : (manualAddress ? `${manualAddress.slice(0, 6)}...${manualAddress.slice(-4)}` : '');

    // Sync address changes to parent component
    useEffect(() => {
        if (onAddressChange && currentAddress) {
            onAddressChange(currentAddress);
        }
    }, [currentAddress, onAddressChange]);

    // Wallet icons mapping
    const walletIcons: Record<string, string> = {
        metamask: '🦊',
        coinbase: '🔵',
        walletconnect: '🔗',
        trust: '🛡️',
        rainbow: '🌈',
    };

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
                            <p className="text-sm text-foreground/80 font-medium">Connected Wallet</p>
                            <p className="font-semibold text-foreground mt-0.5">MetaMask</p>
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
                            <Label className="text-xs text-foreground/80 font-medium">Address</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Input
                                    value={isValidAddress(currentAddress) 
                                        ? currentShortAddress 
                                        : 'Invalid address format'}
                                    readOnly
                                    className={`font-mono text-sm bg-background/50 ${
                                        isValidAddress(currentAddress)
                                            ? 'text-foreground'
                                            : 'text-red-500'
                                    }`}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={copyAddress}
                                    disabled={!isValidAddress(currentAddress)}
                                >
                                    {copied ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                            {currentAddress && !isValidAddress(currentAddress) && (
                                <p className="text-xs text-red-500 mt-1">
                                    Invalid address format. Please reconnect your wallet.
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <Label className="text-xs text-foreground/80 font-medium">Balance</Label>
                                <p className="font-semibold text-foreground mt-0.5">{balance} ETH</p>
                            </div>
                            <div>
                                <Label className="text-xs text-foreground/80 font-medium">Network</Label>
                                <p className="font-semibold text-foreground mt-0.5">{network}</p>
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
                                        variant={wallet.name === 'metamask' ? 'default' : 'outline'}
                                        onClick={() => handleConnect(wallet.name)}
                                        disabled={isConnecting}
                                        className={`justify-start ${wallet.name === 'metamask' ? 'bg-primary text-primary-foreground' : ''}`}
                                    >
                                        <span className="mr-2">{walletIcons[wallet.name] || '💳'}</span>
                                        {wallet.displayName}
                                        {wallet.name === 'metamask' && (
                                            <span className="ml-auto text-xs opacity-75">Recommended</span>
                                        )}
                                    </Button>
                                ))}
                        </div>
                        {installedWallets.filter(w => w.installed).length === 0 && (
                            <p className="text-xs text-muted-foreground mt-2">
                                No wallets detected. Install MetaMask or another Ethereum wallet extension.
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
                                        placeholder="0x..."
                                        value={manualAddress}
                                        onChange={(e) => handleManualAddress(e.target.value)}
                                        className="font-mono text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Enter your Ethereum address to use without wallet connection
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <p className="text-sm text-red-500 font-medium mb-1">Connection Error</p>
                            <p className="text-xs text-red-500 mb-3">{error}</p>
                            {error.includes('pending') && (
                                <div className="space-y-3">
                                    <div className="text-xs text-red-400 space-y-1">
                                        <p className="font-medium">Troubleshooting:</p>
                                        <ol className="list-decimal list-inside space-y-1 ml-2">
                                            <li>Check your MetaMask extension - look for a connection notification</li>
                                            <li>Click on the MetaMask icon (🦊) in your browser toolbar</li>
                                            <li>Approve the connection request if you see one</li>
                                            <li>Make sure MetaMask is unlocked</li>
                                        </ol>
                                    </div>
                                    <Button
                                        onClick={handleRetryConnection}
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs"
                                        disabled={isConnecting}
                                    >
                                        {isConnecting ? 'Connecting...' : 'Retry Connection'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Helpful Tips - Only show if MetaMask is installed */}
                    {installedWallets.some(w => w.name === 'metamask' && w.installed) && !error && (
                        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <p className="text-xs text-blue-500 font-medium mb-2">Quick Tips</p>
                            <ul className="text-xs text-blue-400 space-y-1">
                                <li>• Make sure MetaMask is unlocked</li>
                                <li>• Click the MetaMask icon if you see a notification</li>
                                <li>• Check browser popup blocker settings</li>
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {currentAddress && isValidAddress(currentAddress) && (
                <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-foreground/80 font-medium mb-1">Active Address</p>
                    <p className="font-mono text-xs break-all text-foreground">{currentAddress}</p>
                </div>
            )}
            {currentAddress && !isValidAddress(currentAddress) && (
                <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs text-red-500 font-medium mb-1">Invalid Address Format</p>
                    <p className="font-mono text-xs break-all text-red-500">{currentAddress}</p>
                    <p className="text-xs text-red-500 mt-1">Address must start with 0x and be 42 characters long</p>
                </div>
            )}
        </Card>
    );
}
