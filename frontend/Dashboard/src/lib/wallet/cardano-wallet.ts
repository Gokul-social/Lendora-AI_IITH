/**
 * Lendora AI - Cardano Wallet Integration
 * CIP-30 compliant wallet connection for Nami, Eternl, Yoroi
 */

// CIP-30 Wallet API Types
interface CardanoWalletApi {
    getNetworkId(): Promise<number>;
    getUtxos(): Promise<string[] | undefined>;
    getBalance(): Promise<string>;
    getUsedAddresses(): Promise<string[]>;
    getUnusedAddresses(): Promise<string[]>;
    getChangeAddress(): Promise<string>;
    getRewardAddresses(): Promise<string[]>;
    signTx(tx: string, partialSign?: boolean): Promise<string>;
    signData(addr: string, payload: string): Promise<{ signature: string; key: string }>;
    submitTx(tx: string): Promise<string>;
    getCollateral(): Promise<string[] | undefined>;
}

interface CardanoWallet {
    name: string;
    icon: string;
    apiVersion: string;
    enable(): Promise<CardanoWalletApi>;
    isEnabled(): Promise<boolean>;
}

export type WalletName = 'nami' | 'eternl' | 'yoroi' | 'flint' | 'typhon' | 'gerowallet';

export interface WalletInfo {
    name: WalletName;
    displayName: string;
    icon: string;
    installed: boolean;
}

export interface ConnectedWallet {
    name: WalletName;
    api: CardanoWalletApi;
    address: string;
    balance: string;
    networkId: number;
}

// Wallet metadata
const WALLET_METADATA: Record<WalletName, { displayName: string; icon: string }> = {
    nami: { displayName: 'Nami', icon: 'N' },
    eternl: { displayName: 'Eternl', icon: 'E' },
    yoroi: { displayName: 'Yoroi', icon: 'Y' },
    flint: { displayName: 'Flint', icon: 'F' },
    typhon: { displayName: 'Typhon', icon: 'T' },
    gerowallet: { displayName: 'Gero', icon: 'G' },
};

/**
 * Get the Cardano wallet window object
 */
function getCardanoWindow(): Record<string, CardanoWallet> | undefined {
    if (typeof window !== 'undefined') {
        return (window as Window & { cardano?: Record<string, CardanoWallet> }).cardano;
    }
    return undefined;
}

/**
 * Check which wallets are installed in the browser
 */
export function getInstalledWallets(): WalletInfo[] {
    const cardano = getCardanoWindow();
    const wallets: WalletInfo[] = [];

    // Check for Eternl (also known as ccvault in some versions)
    // Eternl can appear as 'eternl', 'ccvault', or 'eternlwallet'
    const eternlInstalled = cardano ? (
        !!cardano['eternl'] ||
        !!cardano['ccvault'] ||
        !!cardano['eternlwallet'] ||
        !!(cardano as Record<string, unknown>)?.eternl
    ) : false;

    for (const [key, meta] of Object.entries(WALLET_METADATA)) {
        let installed = false;

        // Special handling for Eternl - check multiple possible names
        if (key === 'eternl') {
            installed = eternlInstalled;
        } else {
            installed = cardano ? !!cardano[key] : false;
        }

        wallets.push({
            name: key as WalletName,
            displayName: meta.displayName,
            icon: meta.icon,
            installed,
        });
    }

    // Sort: Eternl first if installed, then other installed wallets, then uninstalled
    return wallets.sort((a, b) => {
        if (a.name === 'eternl' && a.installed) return -1;
        if (b.name === 'eternl' && b.installed) return 1;
        if (a.installed && !b.installed) return -1;
        if (!a.installed && b.installed) return 1;
        return 0;
    });
}

/**
 * Connect to a Cardano wallet
 */
export async function connectWallet(walletName: WalletName): Promise<ConnectedWallet> {
    const cardano = getCardanoWindow();

    if (!cardano) {
        throw new Error('Cardano wallet interface not found. Please install a wallet extension like Eternl.');
    }

    // Debug: Log available wallet keys
    if (walletName === 'eternl') {
        console.log('[Wallet] Available cardano keys:', Object.keys(cardano));
    }

    // Special handling for Eternl (may be under 'eternl', 'ccvault', or 'eternlwallet')
    let wallet = cardano[walletName];

    if (walletName === 'eternl' && !wallet) {
        // Try alternative names for Eternl
        wallet = cardano['ccvault'] || cardano['eternlwallet'] || (cardano as Record<string, CardanoWallet>)?.eternl;

        // Also check if it's available but under a different key
        if (!wallet) {
            // Check all keys in cardano object
            for (const key in cardano) {
                const w = (cardano as Record<string, CardanoWallet>)[key];
                if (w && (w.name?.toLowerCase().includes('eternl') || w.name?.toLowerCase().includes('ccvault'))) {
                    wallet = w;
                    console.log(`[Wallet] Found Eternl under key: ${key}`);
                    break;
                }
            }
        }
    }

    if (!wallet) {
        const displayName = WALLET_METADATA[walletName].displayName;
        if (walletName === 'eternl') {
            console.error('[Wallet] Eternl not found. Available keys:', Object.keys(cardano));
            throw new Error(`${displayName} wallet not found. Please make sure the Eternl extension is installed and enabled in your browser. Refresh the page after installing.`);
        }
        throw new Error(`${displayName} wallet not found. Please install the extension.`);
    }

    try {
        console.log(`[Wallet] Attempting to connect to ${walletName}...`);
        // Enable the wallet (user will see connection popup)
        const api = await wallet.enable();
        console.log(`[Wallet] ${walletName} enabled successfully`);

        // Get wallet details with better error handling
        let addresses: string[] = [];
        let balance = '0';
        let networkId = 0;
        let address = '';

        try {
            [addresses, balance, networkId] = await Promise.all([
                api.getUsedAddresses(),
                api.getBalance(),
                api.getNetworkId(),
            ]);
            address = addresses[0] || (await api.getChangeAddress());
        } catch (err) {
            // Fallback: try getChangeAddress if getUsedAddresses fails
            try {
                address = await api.getChangeAddress();
                balance = await api.getBalance();
                networkId = await api.getNetworkId();
            } catch (fallbackErr) {
                throw new Error('Failed to retrieve wallet information. Please try again.');
            }
        }

        // Convert balance from hex CBOR to lovelace
        const balanceInLovelace = parseBalance(balance);
        const balanceInAda = (balanceInLovelace / 1_000_000).toFixed(2);

        return {
            name: walletName,
            api,
            address,
            balance: balanceInAda,
            networkId,
        };
    } catch (error) {
        if (error instanceof Error) {
            const errorMsg = error.message.toLowerCase();
            if (errorMsg.includes('user') || errorMsg.includes('reject') || errorMsg.includes('denied') || errorMsg.includes('cancel')) {
                throw new Error('Connection rejected. Please approve the connection in your wallet.');
            }
            if (errorMsg.includes('enable') || errorMsg.includes('not enabled')) {
                throw new Error(`Please unlock ${WALLET_METADATA[walletName].displayName} wallet and try again.`);
            }
            if (errorMsg.includes('timeout')) {
                throw new Error('Connection timeout. Please make sure your wallet is unlocked and try again.');
            }
            // Return the original error message for debugging
            throw new Error(`Failed to connect: ${error.message}`);
        }
        throw new Error('Failed to connect to wallet. Please try again.');
    }
}

/**
 * Check if a wallet is currently connected
 */
export async function isWalletConnected(walletName: WalletName): Promise<boolean> {
    const cardano = getCardanoWindow();

    if (!cardano) {
        return false;
    }

    // Special handling for Eternl
    let wallet = cardano[walletName];
    if (walletName === 'eternl' && !wallet) {
        wallet = cardano['ccvault'];
    }

    if (!wallet) {
        return false;
    }

    try {
        return await wallet.isEnabled();
    } catch {
        return false;
    }
}

/**
 * Parse balance from CBOR hex string
 * Simplified version - in production use a proper CBOR library
 */
function parseBalance(balanceHex: string): number {
    try {
        // Simple case: just a number encoded
        if (balanceHex.length <= 18) {
            return parseInt(balanceHex, 16);
        }

        // For complex CBOR (with tokens), we need proper parsing
        // This is a simplified version that handles basic cases
        const bytes = hexToBytes(balanceHex);

        // Check if it's a simple integer or a map/array (multi-asset)
        if (bytes[0] <= 0x1b) {
            // Simple integer
            return parseCborInt(bytes);
        }

        // Multi-asset case: [lovelace, {policy: {asset: amount}}]
        // For now, return 0 if we can't parse
        return 0;
    } catch {
        return 0;
    }
}

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

function parseCborInt(bytes: Uint8Array): number {
    const major = bytes[0] >> 5;
    const additional = bytes[0] & 0x1f;

    if (major !== 0) return 0; // Not an unsigned int

    if (additional < 24) {
        return additional;
    } else if (additional === 24) {
        return bytes[1];
    } else if (additional === 25) {
        return (bytes[1] << 8) | bytes[2];
    } else if (additional === 26) {
        return (bytes[1] << 24) | (bytes[2] << 16) | (bytes[3] << 8) | bytes[4];
    } else if (additional === 27) {
        // 64-bit - JavaScript can handle up to 2^53
        let value = 0;
        for (let i = 1; i <= 8; i++) {
            value = value * 256 + bytes[i];
        }
        return value;
    }

    return 0;
}

/**
 * Get human-readable network name
 */
export function getNetworkName(networkId: number): string {
    switch (networkId) {
        case 0:
            return 'Testnet';
        case 1:
            return 'Mainnet';
        default:
            return 'Unknown';
    }
}

/**
 * Shorten address for display
 */
export function shortenAddress(address: string, chars: number = 8): string {
    if (!address) return '';
    if (address.length <= chars * 2 + 3) return address;
    return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

