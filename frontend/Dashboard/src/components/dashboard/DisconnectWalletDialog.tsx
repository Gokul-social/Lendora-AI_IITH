/**
 * Lendora AI - Disconnect Wallet Dialog
 * Dialog component for wallet disconnection with Log Out and Switch Wallet options
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useWallet } from '@/hooks/useWallet';
import { LogOut, Wallet, Loader2 } from 'lucide-react';

interface DisconnectWalletDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DisconnectWalletDialog({ open, onOpenChange }: DisconnectWalletDialogProps) {
    const navigate = useNavigate();
    const { disconnect } = useWallet();
    const [isDisconnecting, setIsDisconnecting] = useState(false);

    const handleLogOut = async () => {
        setIsDisconnecting(true);
        try {
            await disconnect();
            onOpenChange(false);
            // Navigate to login page
            navigate('/');
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            setIsDisconnecting(false);
        }
    };

    const handleSwitchWallet = async () => {
        setIsDisconnecting(true);
        try {
            await disconnect();
            onOpenChange(false);
            // Navigate to login page to select a different wallet
            navigate('/');
        } catch (error) {
            console.error('Error during wallet switch:', error);
        } finally {
            setIsDisconnecting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-primary" />
                        Disconnect Wallet
                    </DialogTitle>
                    <DialogDescription>
                        What would you like to do after disconnecting your wallet?
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-4">
                    <Button
                        onClick={handleLogOut}
                        variant="outline"
                        className="w-full justify-start h-auto py-4 px-4 border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-500"
                        disabled={isDisconnecting}
                    >
                        <div className="flex items-center gap-3 w-full">
                            <LogOut className="w-5 h-5" />
                            <div className="flex-1 text-left">
                                <div className="font-semibold">Log Out</div>
                                <div className="text-xs text-muted-foreground">
                                    Disconnect and return to login page
                                </div>
                            </div>
                            {isDisconnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                        </div>
                    </Button>
                    <Button
                        onClick={handleSwitchWallet}
                        variant="outline"
                        className="w-full justify-start h-auto py-4 px-4"
                        disabled={isDisconnecting}
                    >
                        <div className="flex items-center gap-3 w-full">
                            <Wallet className="w-5 h-5" />
                            <div className="flex-1 text-left">
                                <div className="font-semibold">Switch Wallet</div>
                                <div className="text-xs text-muted-foreground">
                                    Disconnect and connect a different wallet
                                </div>
                            </div>
                            {isDisconnecting && <Loader2 className="w-4 h-4 animate-spin" />}
                        </div>
                    </Button>
                </div>
                <DialogFooter>
                    <Button
                        variant="ghost"
                        onClick={() => onOpenChange(false)}
                        disabled={isDisconnecting}
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

