
// This is a MOCK WebSocket client to simulate a real-time connection.
// In a real application, this would be replaced with a library like socket.io-client.

// A simple in-memory event emitter to mock client-server communication
const events: Record<string, ((data: any) => void)[]> = {};

export const socket = {
  /**
   * Register an event listener for messages from the "server".
   * @param event The event name to listen for.
   * @param handler The callback function to execute.
   */
  on: (event: string, handler: (data: any) => void) => {
    if (!events[event]) {
      events[event] = [];
    }
    events[event].push(handler);
    console.log(`[SocketService] Registered listener for event: '${event}'`);
  },

  /**
   * Emit an event to the "server".
   * @param event The event name to send.
   * @param data The data payload.
   */
  emit: (event: string, data: any) => {
    console.log(`[SocketService] ==> Emitting event '${event}':`, data);
    
    // --- MOCK SERVER LOGIC ---
    // Simulate the server receiving the command and broadcasting an update back to all clients.
    if (event === 'equipment-command') {
      console.log(`[SocketService] Mock server received command for equipment: ${data.id}. Broadcasting update.`);
      
      const listeners = events['equipment-status-update'];
      if (listeners) {
        // The payload for the update is the new state of the item that was changed.
        const updatedItem = { id: data.id, on: data.state };
        console.log(`[SocketService] <== Broadcasting 'equipment-status-update' with payload:`, updatedItem);
        // Notify all registered listeners about the state change.
        listeners.forEach(listener => listener(updatedItem));
      }
    }
  },

  /**
   * Unregister an event listener to prevent memory leaks.
   * @param event The event name.
   * @param handler The specific callback function to remove.
   */
  off: (event: string, handler: (data: any) => void) => {
    if (events[event]) {
      events[event] = events[event].filter(h => h !== handler);
      console.log(`[SocketService] Unregistered listener for event: '${event}'`);
    }
  }
};
