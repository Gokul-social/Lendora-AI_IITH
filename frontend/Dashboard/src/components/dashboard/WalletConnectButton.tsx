/**
 * Lendora AI - Wallet Connect Button Component
 * Compact button with popover for wallet connection in navigation bar
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WalletConnection } from '@/components/dashboard/WalletConnection';
import { Wallet } from 'lucide-react';

interface WalletConnectButtonProps {
    defaultAddress?: string;
    onAddressChange?: (address: string) => void;
}

export function WalletConnectButton({ defaultAddress, onAddressChange }: WalletConnectButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="default"
                    className="hidden sm:flex items-center gap-2 h-9"
                >
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0 bg-transparent border-0 shadow-none" align="end">
                <WalletConnection
                    defaultAddress={defaultAddress}
                    onAddressChange={(address) => {
                        if (onAddressChange) {
                            onAddressChange(address);
                        }
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}

