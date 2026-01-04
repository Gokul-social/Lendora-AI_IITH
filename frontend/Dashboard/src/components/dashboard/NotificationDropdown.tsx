/**
 * Lendora AI - Notification Dropdown Component
 * Displays notifications with unread badge and click-outside-to-close functionality
 */

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

export interface Notification {
    id: string;
    type: 'success' | 'warning' | 'info' | 'error';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

interface NotificationDropdownProps {
    notifications: Notification[];
    onMarkAsRead?: (notificationId: string) => void;
    onMarkAllAsRead?: () => void;
}

export function NotificationDropdown({ 
    notifications, 
    onMarkAsRead,
    onMarkAllAsRead 
}: NotificationDropdownProps) {
    const [open, setOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    // Mark all as read when dropdown opens
    useEffect(() => {
        if (open && unreadCount > 0 && onMarkAllAsRead) {
            onMarkAllAsRead();
        }
    }, [open]);

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
            case 'error':
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'info':
            default:
                return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    const handleNotificationClick = (notificationId: string) => {
        if (onMarkAsRead) {
            onMarkAsRead(notificationId);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button 
                    size="icon" 
                    variant="ghost" 
                    className="rounded-lg relative hover:bg-secondary/50"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Bell className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-foreground">Notifications</h3>
                            {unreadCount > 0 && (
                                <Badge variant="destructive" className="ml-2">
                                    {unreadCount}
                                </Badge>
                            )}
                        </div>
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setOpen(false)}
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        )}
                    </div>

                    <Separator className="mb-4" />

                    {/* Notifications List */}
                    {notifications.length === 0 ? (
                        <div className="text-center py-8">
                            <Bell className="w-12 h-12 mx-auto mb-2 text-muted-foreground opacity-50" />
                            <p className="text-sm text-muted-foreground">No notifications</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-[400px]">
                            <div className="space-y-2">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                                            notification.read
                                                ? 'bg-background border-border/50'
                                                : 'bg-primary/5 border-primary/20'
                                        } hover:bg-secondary/50`}
                                        onClick={() => handleNotificationClick(notification.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5">
                                                {getNotificationIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <p className="text-sm font-semibold text-foreground">
                                                        {notification.title}
                                                    </p>
                                                    {!notification.read && (
                                                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mb-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(notification.timestamp), 'MMM dd, HH:mm')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

