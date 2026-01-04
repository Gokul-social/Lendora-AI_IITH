/**
 * Lendora AI - Settings Page
 * User settings and preferences
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWallet } from '@/hooks/useWallet';
import { Settings as SettingsIcon, Wallet, Bell, Globe, Shield } from 'lucide-react';

export default function Settings() {
    const { address, network, disconnect } = useWallet();

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2 text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences</p>
            </div>

            {/* Wallet Settings */}
            <Card className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Wallet className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Wallet</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <Label className="text-sm text-muted-foreground">Connected Address</Label>
                        <p className="font-mono text-sm mt-1 p-3 rounded-lg bg-secondary/30">{address || 'Not connected'}</p>
                    </div>
                    <div>
                        <Label className="text-sm text-muted-foreground">Network</Label>
                        <p className="text-sm mt-1 p-3 rounded-lg bg-secondary/30">{network || 'Not connected'}</p>
                    </div>
                    <Button variant="outline" onClick={disconnect}>
                        Disconnect Wallet
                    </Button>
                </div>
            </Card>

            {/* Notification Settings */}
            <Card className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Bell className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive updates via email</p>
                        </div>
                        <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Loan Alerts</Label>
                            <p className="text-sm text-muted-foreground">Get notified about loan status changes</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Interest Rate Changes</Label>
                            <p className="text-sm text-muted-foreground">Alerts for market rate updates</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </div>
            </Card>

            {/* Preferences */}
            <Card className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Globe className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Preferences</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <Label>Default Stablecoin</Label>
                        <Select defaultValue="USDC">
                            <SelectTrigger className="mt-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="USDC">USDC</SelectItem>
                                <SelectItem value="USDT">USDT</SelectItem>
                                <SelectItem value="DAI">DAI</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Default Network</Label>
                        <Select defaultValue={network || 'arbitrum-sepolia'}>
                            <SelectTrigger className="mt-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                                <SelectItem value="arbitrum">Arbitrum One</SelectItem>
                                <SelectItem value="arbitrum-sepolia">Arbitrum Sepolia</SelectItem>
                                <SelectItem value="optimism">Optimism</SelectItem>
                                <SelectItem value="base">Base</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* Security */}
            <Card className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">Security</h2>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                        </div>
                        <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Transaction Confirmations</Label>
                            <p className="text-sm text-muted-foreground">Require confirmation for all transactions</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </div>
            </Card>
        </div>
    );
}
