/**
 * Lendora AI - WebSocket Manager
 * Real-time updates from Python backend
 */

type MessageHandler = (data: unknown) => void;

class WebSocketManager {
    private ws: WebSocket | null = null;
    private url: string;
    private handlers: Map<string, Set<MessageHandler>> = new Map();
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;

    constructor(url?: string) {
        // Priority: explicit URL > VITE_WS_URL > derived from VITE_API_URL > localhost
        if (url) {
            this.url = url;
        } else if (import.meta.env.VITE_WS_URL) {
            // Use explicit WebSocket URL if provided
            const wsUrl = import.meta.env.VITE_WS_URL;
            this.url = wsUrl.endsWith('/ws') ? wsUrl : `${wsUrl}/ws`;
        } else {
            // Derive from API URL
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
            // Convert http(s):// to ws(s):// and add /ws
            this.url = apiUrl.replace(/^http/, 'ws') + '/ws';
        }
    }

    connect() {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return;
        }

        // console.log('[WebSocket] Connecting to', this.url);
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            // console.log('[WebSocket] Connected');
            this.reconnectAttempts = 0;
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                const { type, data } = message;

                // Notify all handlers for this message type
                const handlers = this.handlers.get(type);
                if (handlers) {
                    handlers.forEach(handler => handler(data));
                }
            } catch (error) {
                // console.error('[WebSocket] Error parsing message:', error);
            }
        };

        this.ws.onerror = (error) => {
            // console.error('[WebSocket] Error:', error);
        };

        this.ws.onclose = () => {
            // console.log('[WebSocket] Disconnected');
            this.attemptReconnect();
        };
    }

    private attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            // console.error('[WebSocket] Max reconnect attempts reached');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        // console.log(`[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        setTimeout(() => {
            this.connect();
        }, delay);
    }

    subscribe(type: string, handler: MessageHandler) {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set());
        }
        this.handlers.get(type)!.add(handler);

        // Return unsubscribe function
        return () => {
            const handlers = this.handlers.get(type);
            if (handlers) {
                handlers.delete(handler);
            }
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

export const wsManager = new WebSocketManager();

// Auto-connect on module load
if (typeof window !== 'undefined') {
    wsManager.connect();
}
