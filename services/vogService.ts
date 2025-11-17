import { VOGRequest, VOGResponse, VOGParams } from '../types';

export class VOGService {
  private serviceUrl: string;
  private interpreterUrl: string;
  private authToken: string | null = null;

  constructor(serviceUrl: string, interpreterUrl: string) {
    this.serviceUrl = serviceUrl;
    this.interpreterUrl = interpreterUrl;
  }

  async getAuthToken(subject: string = 'director', roles: string[] = ['director']): Promise<string> {
    try {
      const response = await fetch(
        `${this.serviceUrl}/v1/auth/token?subject=${subject}&roles=${roles.join(',')}`,
        { method: 'POST' }
      );

      if (!response.ok) {
        throw new Error(`Failed to get auth token: ${response.status}`);
      }

      const data = await response.json();
      this.authToken = data.access_token;
      return data.access_token;
    } catch (error) {
      console.error('Auth error:', error);
      throw error;
    }
  }

  async createVOG(request: VOGRequest): Promise<VOGResponse> {
    if (!this.authToken) {
      await this.getAuthToken();
    }

    try {
      const response = await fetch(`${this.serviceUrl}/v1/vog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`VOG creation failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('VOG creation error:', error);
      throw error;
    }
  }

  async getVOGStatus(cueId: string): Promise<VOGResponse> {
    if (!this.authToken) {
      await this.getAuthToken();
    }

    try {
      const response = await fetch(`${this.serviceUrl}/v1/vog/status/${cueId}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`Status check failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Status check error:', error);
      throw error;
    }
  }

  async playVOG(text: string, preset: string = 'GOD-THUNDER'): Promise<void> {
    if (!this.authToken) {
      await this.getAuthToken();
    }

    try {
      const response = await fetch(`${this.interpreterUrl}/play/vog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
          preset,
          token: this.authToken
        })
      });

      if (!response.ok) {
        throw new Error(`Play failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Play error:', error);
      throw error;
    }
  }

  async updateParams(params: Partial<VOGParams>): Promise<VOGParams> {
    try {
      const response = await fetch(`${this.interpreterUrl}/params`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`Param update failed: ${response.status}`);
      }

      const data = await response.json();
      return data.params;
    } catch (error) {
      console.error('Param update error:', error);
      throw error;
    }
  }

  async getParams(): Promise<VOGParams> {
    try {
      const response = await fetch(`${this.interpreterUrl}/params`);

      if (!response.ok) {
        throw new Error(`Get params failed: ${response.status}`);
      }

      const data = await response.json();
      return data.params;
    } catch (error) {
      console.error('Get params error:', error);
      throw error;
    }
  }

  connectWebSocket(onMessage: (data: any) => void, onError?: (error: Event) => void): WebSocket {
    const wsUrl = this.interpreterUrl.replace('http', 'ws') + '/ws';
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('VOG WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage(data);
      } catch (e) {
        console.error('WebSocket message parse error:', e);
      }
    };

    ws.onerror = (error) => {
      console.error('VOG WebSocket error:', error);
      if (onError) {
        onError(error);
      }
    };

    ws.onclose = () => {
      console.log('VOG WebSocket disconnected');
    };

    return ws;
  }
}

// Default instance
export const vogService = new VOGService(
  import.meta.env.VITE_VOG_SERVICE_URL || 'http://localhost:8000',
  import.meta.env.VITE_INTERPRETER_URL || 'http://localhost:8001'
);
