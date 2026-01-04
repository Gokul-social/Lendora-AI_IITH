/**
 * Lendora AI - useLendoraData Hook
 * Custom hook to fetch mock data with simulated API delay
 */

import { useState, useEffect } from 'react';
import {
    mockDashboardData,
    mockMarkets,
    mockTransactions,
    mockNotifications,
    DashboardData,
    MarketAsset,
    Transaction,
    Notification,
} from '@/data/mockData';

interface UseLendoraDataReturn {
    dashboard: DashboardData | null;
    markets: MarketAsset[];
    transactions: Transaction[];
    notifications: Notification[];
    loading: boolean;
    markNotificationAsRead: (id: string) => void;
    markAllNotificationsAsRead: () => void;
}

const SIMULATED_DELAY = 500; // 500ms delay to mimic API call

export function useLendoraData(): UseLendoraDataReturn {
    const [dashboard, setDashboard] = useState<DashboardData | null>(null);
    const [markets, setMarkets] = useState<MarketAsset[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch all data with simulated delay
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY));
            
            // Set mock data
            setDashboard(mockDashboardData);
            setMarkets(mockMarkets);
            setTransactions(mockTransactions);
            setNotifications(mockNotifications);
            
            setLoading(false);
        };

        fetchData();
    }, []);

    // Mark a single notification as read
    const markNotificationAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    // Mark all notifications as read
    const markAllNotificationsAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    return {
        dashboard,
        markets,
        transactions,
        notifications,
        loading,
        markNotificationAsRead,
        markAllNotificationsAsRead,
    };
}

