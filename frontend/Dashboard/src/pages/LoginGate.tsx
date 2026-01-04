/**
 * Lendora AI - Login Gate
 * Portal entrance with HeroCube and wallet connection
 */

import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HeroCube } from '@/components/3d/HeroCube';
import { ParticleField } from '@/components/3d/ParticleField';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, ExternalLink, AlertCircle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useTheme } from 'next-themes';
import type { WalletName } from '@/lib/wallet/cardano-wallet';

const ANIMATION_DURATION = 1500;

export default function LoginGate() {
    const [isAnimating, setIsAnimating] = useState(false);
    const [showWalletList, setShowWalletList] = useState(false);
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    const {
        installedWallets,
        isConnecting,
        isConnected,
        error,
        shortAddress,
        balance,
        network,
        connect,
        disconnect,
    } = useWallet();

    const handleWalletSelect = async (walletName: WalletName) => {
        try {
            await connect(walletName);
            setShowWalletList(false);

            // Animate and navigate after successful connection
            setIsAnimating(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, ANIMATION_DURATION);
        } catch {
            // Error is handled by the hook
        }
    };

    const handleDemoMode = () => {
        setIsAnimating(true);
        setTimeout(() => {
            navigate('/dashboard');
        }, ANIMATION_DURATION);
    };

    const installedCount = installedWallets.filter(w => w.installed).length;

    return (
        <div className="relative w-full h-screen overflow-hidden bg-background transition-colors duration-500">
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 z-50">
                <Button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    variant="outline"
                    size="icon"
                    className="backdrop-blur-xl bg-card/50 border-border"
                >
                    {theme === 'dark' ? 'Light' : 'Dark'}
                </Button>
            </div>

            {/* 3D Background Canvas */}
            <div className="absolute inset-0">
                <Canvas
                    camera={{ position: [0, 0, 8], fov: 50 }}
                    dpr={[1, 2]}
                    performance={{ min: 0.5 }}
                >
                    <ParticleField count={typeof window !== 'undefined' && window.innerWidth < 768 ? 1500 : 3000} />
                    <HeroCube isAnimating={isAnimating} />
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        maxPolarAngle={Math.PI / 2}
                        minPolarAngle={Math.PI / 2}
                    />
                </Canvas>
            </div>

            {/* UI Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full pointer-events-none px-4">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="text-center mb-8 md:mb-12"
                >
                    <h1 className="text-5xl md:text-8xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
                        Lendora AI
                    </h1>
                    <p className="text-lg md:text-2xl text-muted-foreground font-light">
                        Privacy-First DeFi Lending on Cardano
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 1 }}
                    className="pointer-events-auto w-full max-w-md"
                >
                    <Card className="p-6 md:p-8 backdrop-blur-2xl bg-card/80 border-2 border-primary/30 hover:border-primary transition-all duration-300">
                        <div className="text-center mb-6">
                            <Wallet className="w-12 md:w-16 h-12 md:h-16 mx-auto mb-4 text-primary" />
                            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                                {isConnected ? 'Wallet Connected' : 'Connect Your Wallet'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {isConnected
                                    ? `${shortAddress} • ${balance} ₳ • ${network}`
                                    : 'Select a wallet to start using Lendora AI'
                                }
                            </p>
                        </div>

                        {/* Error Message */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-4 p-3 rounded-lg bg-destructive/20 border border-destructive/30 flex items-center gap-2"
                                >
                                    <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                                    <p className="text-sm text-destructive">{error}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-3">
                            {isConnected ? (
                                <>
                                    <Button
                                        onClick={() => {
                                            setIsAnimating(true);
                                            setTimeout(() => navigate('/dashboard'), ANIMATION_DURATION);
                                        }}
                                        className="w-full bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white font-semibold py-5 md:py-6 text-lg transition-all duration-300"
                                    >
                                        Enter Dashboard
                                    </Button>
                                    <Button
                                        onClick={disconnect}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Disconnect Wallet
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {/* Wallet Selection Button */}
                                    <Button
                                        onClick={() => setShowWalletList(!showWalletList)}
                                        disabled={isConnecting}
                                        className="w-full bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-primary text-white font-semibold py-5 md:py-6 text-lg transition-all duration-300"
                                    >
                                        {isConnecting ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Connecting...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Connect Wallet
                                                <ChevronDown className={`w-5 h-5 transition-transform ${showWalletList ? 'rotate-180' : ''}`} />
                                            </span>
                                        )}
                                    </Button>

                                    {/* Wallet List Dropdown */}
                                    <AnimatePresence>
                                        {showWalletList && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="space-y-2 pt-2">
                                                    {installedWallets.map((wallet) => (
                                                        <Button
                                                            key={wallet.name}
                                                            onClick={() => wallet.installed && handleWalletSelect(wallet.name)}
                                                            variant={wallet.name === 'eternl' && wallet.installed ? 'default' : 'outline'}
                                                            disabled={!wallet.installed || isConnecting}
                                                            className={`w-full justify-between ${wallet.name === 'eternl' && wallet.installed
                                                                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                                                : wallet.installed
                                                                    ? 'hover:border-primary'
                                                                    : 'opacity-50 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <span className="text-xl">{wallet.icon}</span>
                                                                {wallet.displayName}
                                                                {wallet.name === 'eternl' && wallet.installed && (
                                                                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Recommended</span>
                                                                )}
                                                            </span>
                                                            {wallet.installed ? (
                                                                <span className="text-xs text-success">Installed</span>
                                                            ) : (
                                                                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                                                            )}
                                                        </Button>
                                                    ))}
                                                </div>

                                                {installedCount === 0 && (
                                                    <p className="text-xs text-center text-muted-foreground mt-3">
                                                        No wallets detected. Install{' '}
                                                        <a href="https://eternl.io" target="_blank" rel="noopener" className="text-primary hover:underline font-medium">
                                                            Eternl
                                                        </a>
                                                        {' '}(recommended),{' '}
                                                        <a href="https://namiwallet.io" target="_blank" rel="noopener" className="text-primary hover:underline">
                                                            Nami
                                                        </a>
                                                        , or{' '}
                                                        <a href="https://yoroi-wallet.com" target="_blank" rel="noopener" className="text-primary hover:underline">
                                                            Yoroi
                                                        </a>
                                                    </p>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Demo Mode */}
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-border" />
                                        </div>
                                        <div className="relative flex justify-center text-xs">
                                            <span className="bg-card px-2 text-muted-foreground">or</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleDemoMode}
                                        variant="ghost"
                                        className="w-full text-muted-foreground hover:text-foreground"
                                    >
                                        Continue in Demo Mode
                                    </Button>
                                </>
                            )}
                        </div>
                    </Card>
                </motion.div>

                {/* Feature badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1.5 }}
                    className="absolute bottom-6 md:bottom-8 flex flex-wrap justify-center gap-4 md:gap-6 text-sm px-4"
                >
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                        <span>AI Negotiation</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                        <span>Hydra L2</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span>ZK Privacy</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
