/**
 * Lendora AI - Unified App Layout Component
 * Standardized layout with fixed sidebar, top header, and content area
 * Ensures zero layout shift when navigating between pages
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
    TrendingUp,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface AppLayoutProps {
    children: ReactNode;
}

// Route to page title mapping
const routeTitles: Record<string, { title: string; subtitle?: string }> = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Your lending and borrowing overview' },
    '/portfolio': { title: 'Portfolio', subtitle: 'Your account overview and balances' },
    '/loans': { title: 'My Loans', subtitle: 'View all your borrowed and lent loans' },
    '/transactions': { title: 'Transactions', subtitle: 'View your complete transaction history' },
    '/markets': { title: 'Markets', subtitle: 'Browse available lending and borrowing markets' },
    '/settings': { title: 'Settings', subtitle: 'Manage your account preferences and security' },
};

const navigationItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/portfolio', icon: Wallet, label: 'Portfolio' },
    { path: '/loans', icon: ArrowLeftRight, label: 'My Loans' },
    { path: '/transactions', icon: History, label: 'Transactions' },
    { path: '/markets', icon: TrendingUp, label: 'Markets' },
    { path: '/settings', icon: Settings, label: 'Settings' },
];

export function AppLayout({ children }: AppLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { isConnected, disconnect: disconnectWallet } = useWallet();
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useLendoraData();

    // Get current page title and subtitle
    const currentRoute = location.pathname;
    const pageInfo = routeTitles[currentRoute] || { title: 'Lendora', subtitle: '' };

    const handleDisconnect = () => {
        disconnectWallet();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Fixed Sidebar - Desktop (z-40 to be below modal z-50) */}
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="hidden lg:flex w-64 border-r border-border bg-card/50 backdrop-blur-sm fixed left-0 top-0 h-screen z-40 flex-col"
            >
                {/* Logo */}
                <div className="p-6 border-b border-border">
                    <Link to="/dashboard" className="flex items-center">
                        <Logo size="md" showText={true} className="hover:opacity-80 transition-opacity" />
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigationItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link key={item.path} to={item.path}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={`w-full justify-start gap-3 transition-all ${
                                        isActive
                                            ? 'bg-secondary text-secondary-foreground shadow-sm'
                                            : 'hover:bg-secondary/50 hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium">{item.label}</span>
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </motion.aside>

            {/* Mobile Sidebar Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <motion.aside
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: mobileMenuOpen ? 0 : -100, opacity: mobileMenuOpen ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="lg:hidden fixed left-0 top-0 h-screen w-64 border-r border-border bg-card z-50 flex flex-col"
            >
                {/* Logo */}
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
                        <Logo size="md" showText={true} className="hover:opacity-80 transition-opacity" />
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navigationItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={`w-full justify-start gap-3 transition-all ${
                                        isActive
                                            ? 'bg-secondary text-secondary-foreground shadow-sm'
                                            : 'hover:bg-secondary/50 hover:text-foreground'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="font-medium">{item.label}</span>
                                </Button>
                            </Link>
                        );
                    })}
                </nav>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
                {/* Fixed Top Header (z-30 to be below sidebar z-40 and modal z-50) */}
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-sm"
                >
                    <div className="h-16 px-6 lg:px-8 flex items-center justify-between">
                        {/* Mobile Menu Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden mr-2"
                        >
                            <Menu className="w-5 h-5" />
                        </Button>

                        {/* Page Title */}
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-foreground">
                                {pageInfo.title}
                            </h1>
                            {pageInfo.subtitle && (
                                <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block">
                                    {pageInfo.subtitle}
                                </p>
                            )}
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center gap-2">
                            {/* Notifications */}
                            <NotificationDropdown
                                notifications={notifications}
                                onMarkAsRead={markNotificationAsRead}
                                onMarkAllAsRead={markAllNotificationsAsRead}
                            />

                            {/* Wallet Dropdown or Connect Button */}
                            {isConnected ? (
                                <WalletDropdown />
                            ) : (
                                <WalletConnectButton
                                    defaultAddress={walletAddress}
                                    onAddressChange={(address) => setWalletAddress(address)}
                                />
                            )}
                        </div>
                    </div>
                </motion.header>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 lg:py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

