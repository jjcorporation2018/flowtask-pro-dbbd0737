import { io, Socket } from 'socket.io-client';

const getSocketURL = () => {
    const url = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    // If it's a relative path starting with /api, we should use the same origin but at root
    if (url === '/api') return window.location.origin;
    // Otherwise strip /api if it's an absolute URL
    return url.replace(/\/api$/, '');
};

const BACKEND_URL = getSocketURL();

class SocketService {
    private socket: Socket | null = null;
    private listeners: Record<string, Function[]> = {};

    connect() {
        if (!this.socket) {
            this.socket = io(BACKEND_URL, {
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 1000,
                transports: ['websocket', 'polling'] // Try websocket first
            });

            this.socket.on('connect', () => {
                console.log('🔗 Connected to realtime server');
            });

            this.socket.on('kanban_sync', (data) => {
                this.trigger('kanban_sync', data);
            });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emit(event: string, data: any) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }

    on(event: string, callback: Function) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event: string, callback: Function) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }

    private trigger(event: string, data: any) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(cb => cb(data));
        }
    }
}

export const socketService = new SocketService();
