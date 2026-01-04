/**
 * Lendora AI - Main Layout Component
 * Shared layout with navigation bar for all authenticated pages
 */

import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { WalletDropdown } from '@/components/dashboard/WalletDropdown';
import { WalletConnectButton } from '@/components/dashboard/WalletConnectButton';
import { NotificationDropdown } from '@/components/dashboard/NotificationDropdown';
import { Logo } from '@/components/ui/Logo';
import { useWallet } from '@/hooks/useWallet';
import { useLendoraData } from '@/hooks/useLendoraData';
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
    const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useLendoraData();

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
                        <Link to="/dashboard" className="flex items-center">
                            <Logo 
                                size={isWizardPage ? 'sm' : 'md'} 
                                showText={!isWizardPage}
                                className="hover:opacity-80 transition-opacity"
                            />
                        </Link>

                            {/* Navigation Links */}
                            <nav className="hidden md:flex items-center gap-1 ml-8">
                                {navigationItems.map((item) => {
                                    // Never show Dashboard as active on wizard pages, even if path matches
                                    const isActive = !isWizardPage && location.pathname === item.path && !(item.path === '/dashboard' && isWizardPage);
                                    const Icon = item.icon;
                                    return (
                                        <Link key={item.path} to={item.path}>
                                            <Button
                                                variant={isActive ? "secondary" : "ghost"}
                                                size={isWizardPage ? "sm" : "default"}
                                                className={`gap-2 transition-all ${
                                                    isActive 
                                                        ? 'bg-secondary text-secondary-foreground shadow-sm' 
                                                        : isWizardPage && item.path === '/dashboard'
                                                        ? 'hover:bg-transparent opacity-60'
                                                        : 'hover:bg-secondary/50 hover:text-foreground'
                                                }`}
                                            >
                                                <Icon className={isWizardPage ? "w-3.5 h-3.5" : "w-4 h-4"} />
                                                <span className={isWizardPage ? "text-xs font-medium" : "font-medium"}>{item.label}</span>
                                            </Button>
                                        </Link>
                                    );
                                })}
                            </nav>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2">
                            {/* Search - Hidden on wizard pages */}
                            {!isWizardPage && (
                                <div className="hidden lg:block relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="pl-10 pr-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all w-56 text-sm"
                                    />
                                </div>
                            )}

                            {/* Notifications - Hidden on wizard pages */}
                            {!isWizardPage && (
                                <NotificationDropdown
                                    notifications={notifications}
                                    onMarkAsRead={markNotificationAsRead}
                                    onMarkAllAsRead={markAllNotificationsAsRead}
                                />
                            )}

                            {/* Wallet Dropdown - Hidden on wizard pages */}
                            {!isWizardPage && isConnected && (
                                <WalletDropdown />
                            )}

                            {/* Wallet Connect Button - Show when not connected */}
                            {!isWizardPage && !isConnected && (
                                <WalletConnectButton
                                    defaultAddress={walletAddress}
                                    onAddressChange={(address) => setWalletAddress(address)}
                                />
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
            <main className={isWizardPage ? "w-full flex-1 flex" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8"}>
                <div className="w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
