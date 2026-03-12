import { io } from 'socket.io-client';

// In production, this would be an environment variable
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
    autoConnect: false, // We will connect manually when needed (e.g., after login)
});

// Helper function to connect
export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
    }
};

// Helper function to disconnect
export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
    }
};
