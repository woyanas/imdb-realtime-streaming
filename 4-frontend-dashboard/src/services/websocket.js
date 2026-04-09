import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = new Map();
  }

  /**
   * Connect to the STOMP WebSocket server
   * @param {function} onConnect - Callback when connected
   * @param {function} onError - Callback for connection errors
   */
  connect(onConnect, onError, onDisconnect) {
    try {
      // Create STOMP client
      this.client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws-dashboard'),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('Connected to WebSocket server');
          if (onConnect) onConnect();
        },
        onWebSocketClose: () => {
          console.log('Disconnected from WebSocket server');
          if (onDisconnect) onDisconnect();
        },
        onStompError: (error) => {
          console.error('STOMP error:', error);
          if (onError) onError(error);
        }
      });

      this.client.activate();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      if (onError) onError(error);
    }
  }

  /**
   * Subscribe to a topic
   * @param {string} topic - Topic to subscribe to
   * @param {function} callback - Callback for received messages
   */
  subscribe(topic, callback) {
    if (!this.client || !this.client.connected) {
      console.error('WebSocket not connected');
      return null;
    }

    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.subscriptions.set(topic, subscription);
    return subscription;
  }

  /**
   * Unsubscribe from a topic
   * @param {string} topic - Topic to unsubscribe from
   */
  unsubscribe(topic) {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.client) {
      // Unsubscribe from all topics
      this.subscriptions.forEach((subscription, topic) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();

      this.client.deactivate();
      this.client = null;
      console.log('Disconnected from WebSocket server');
    }
  }

  /**
   * Check if connected to WebSocket server
   */
  isConnected() {
    return this.client && this.client.connected;
  }
}

// Export singleton instance
export default new WebSocketService();