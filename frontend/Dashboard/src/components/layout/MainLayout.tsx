/**
 * Lendora AI - Main Layout Component
 * Shared layout with navigation bar for all authenticated pages
 */

import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { WalletConnection } from '@/components/dashboard/WalletConnection';
import { useWallet } from '@/hooks/useWallet';
import {
    LayoutDashboard,
    Wallet,
    ArrowLeftRight,
    History,
    Settings,
    LogOut,
    Bell,
    Search,
} from 'lucide-react';
import { useState } from 'react';

interface MainLayoutProps {
    children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { isConnected, disconnect: disconnectWallet, balance } = useWallet();
    const [walletAddress, setWalletAddress] = useState<string>('');

    // Detect if we're on a wizard page
    const isWizardPage = location.pathname === '/dashboard' || 
                         location.pathname.includes('/create') || 
                         location.pathname.includes('/loan');

    const navigationItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/portfolio', icon: Wallet, label: 'Portfolio' },
        { path: '/loans', icon: ArrowLeftRight, label: 'My Loans' },
        { path: '/transactions', icon: History, label: 'Transactions' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    const handleDisconnect = () => {
        disconnectWallet();
        navigate('/');
    };

    return (
        <div className={`min-h-screen bg-background ${isWizardPage ? 'flex flex-col' : ''}`}>
            {/* Top Navigation Bar */}
            <motion.nav
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`sticky top-0 z-40 border-b transition-all ${
                    isWizardPage 
                        ? 'bg-background/40 backdrop-blur-sm border-border/30 h-12' 
                        : 'glass-card h-16 border-border'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`flex items-center justify-between ${isWizardPage ? 'h-12' : 'h-16'}`}>
                        {/* Logo and Brand */}
                        <div className="flex items-center gap-3">
                            <Link to="/dashboard" className="flex items-center gap-2">
                                <div className={`rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 ${
                                    isWizardPage ? 'w-7 h-7' : 'w-10 h-10'
                                }`}>
                                    <div className={`bg-primary rounded ${isWizardPage ? 'w-3.5 h-3.5' : 'w-6 h-6'}`} />
                                </div>
                                <div>
                                    <h1 className={`font-semibold text-foreground ${isWizardPage ? 'text-base' : 'text-xl'}`}>Lendora AI</h1>
                                    <p className={`text-muted-foreground hidden sm:block ${isWizardPage ? 'text-[9px] opacity-70' : 'text-xs'}`}>Privacy-First DeFi</p>
                                </div>
                            </Link>

                            {/* Navigation Links */}
                            <div className="hidden md:flex items-center gap-1.5 ml-6">
                                {navigationItems.map((item) => {
                                    // Never show Dashboard as active on wizard pages, even if path matches
                                    const isActive = !isWizardPage && location.pathname === item.path && !(item.path === '/dashboard' && isWizardPage);
                                    const Icon = item.icon;
                                    return (
                                        <Link key={item.path} to={item.path}>
                                            <Button
                                                variant={isActive ? "secondary" : "ghost"}
                                                size={isWizardPage ? "sm" : "default"}
                                                className={`gap-2 ${
                                                    isActive 
                                                        ? 'bg-secondary text-secondary-foreground' 
                                                        : isWizardPage && item.path === '/dashboard'
                                                        ? 'hover:bg-transparent opacity-60'
                                                        : 'hover:bg-secondary/50'
                                                }`}
                                            >
                                                <Icon className={isWizardPage ? "w-3.5 h-3.5" : "w-4 h-4"} />
                                                <span className={isWizardPage ? "text-xs" : ""}>{item.label}</span>
                                            </Button>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-3">
                            {/* Search - Hidden on wizard pages */}
                            {!isWizardPage && (
                                <div className="hidden sm:block relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="pl-10 pr-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors w-48 text-sm"
                                    />
                                </div>
                            )}

                            {/* Notifications - Hidden on wizard pages */}
                            {!isWizardPage && (
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="rounded-full relative"
                                >
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                                </Button>
                            )}

                            {/* Wallet Connection */}
                            {isConnected && !isWizardPage && (
                                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                                    <Wallet className="w-4 h-4 text-primary" />
                                    <span className="text-sm font-medium text-foreground">
                                        {parseFloat(balance).toFixed(4)} ETH
                                    </span>
                                </div>
                            )}

                            {!isWizardPage && (
                                <WalletConnection
                                    defaultAddress={walletAddress}
                                    onAddressChange={(address) => setWalletAddress(address)}
                                />
                            )}

                            {/* Disconnect */}
                            {isConnected && (
                                <Button
                                    variant="ghost"
                                    size={isWizardPage ? "sm" : "sm"}
                                    onClick={handleDisconnect}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                    <LogOut className={isWizardPage ? "w-3.5 h-3.5" : "w-4 h-4"} />
                                    <span className="hidden sm:inline">Disconnect</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className={`md:hidden flex gap-2 overflow-x-auto ${isWizardPage ? 'pb-1.5' : 'pb-4'}`}>
                        {navigationItems.map((item) => {
                            // Never show Dashboard as active on wizard pages
                            const isActive = !isWizardPage && location.pathname === item.path && !(item.path === '/dashboard' && isWizardPage);
                            const Icon = item.icon;
                            return (
                                <Link key={item.path} to={item.path}>
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        size="sm"
                                        className={`gap-2 whitespace-nowrap ${
                                            isActive 
                                                ? 'bg-secondary text-secondary-foreground' 
                                                : isWizardPage && item.path === '/dashboard'
                                                ? 'opacity-60'
                                                : ''
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </motion.nav>

            {/* Main Content */}
            <main className={isWizardPage ? "w-full flex-1 flex" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
                {children}
            </main>
        </div>
    );
}
