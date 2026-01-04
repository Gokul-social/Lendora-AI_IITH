/**
 * Lendora AI - Wallet Dropdown Component
 * Compact wallet display for navigation bar with popover details
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useWallet } from '@/hooks/useWallet';
import { Wallet, Copy, Check, ChevronDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DisconnectWalletDialog } from './DisconnectWalletDialog';

export function WalletDropdown() {
    const { isConnected, address, shortAddress, balance, network } = useWallet();
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);
    const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);

    const copyAddress = () => {
        if (address) {
            navigator.clipboard.writeText(address);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isConnected || !address) {
        return null;
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="hidden sm:flex items-center gap-2 h-9 px-3 bg-background/50 hover:bg-background border-border/50"
                >
                    <Wallet className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">{shortAddress}</span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Wallet className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Wallet</p>
                                <p className="text-xs text-muted-foreground">Connected</p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Balance */}
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Balance</p>
                        <p className="text-lg font-semibold text-foreground">
                            {parseFloat(balance || '0').toFixed(4)} ETH
                        </p>
                    </div>

                    {/* Network */}
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Network</p>
                        <p className="text-sm font-medium text-foreground">{network || 'Unknown'}</p>
                    </div>

                    <Separator />

                    {/* Active Address */}
                    <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Active Address</p>
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 border border-border/50">
                            <p className="flex-1 font-mono text-xs text-foreground break-all">
                                {address}
                            </p>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 flex-shrink-0"
                                onClick={copyAddress}
                            >
                                {copied ? (
                                    <Check className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                                )}
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Disconnect Button */}
                    <Button
                        variant="outline"
                        className="w-full border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                        onClick={() => {
                            setOpen(false);
                            setShowDisconnectDialog(true);
                        }}
                    >
                        Disconnect
                    </Button>
                </div>
            </PopoverContent>
            
            {/* Disconnect Wallet Dialog */}
            <DisconnectWalletDialog 
                open={showDisconnectDialog} 
                onOpenChange={setShowDisconnectDialog} 
            />
        </Popover>
    );
}

