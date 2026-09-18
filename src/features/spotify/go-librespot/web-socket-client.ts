import { Logger } from '@nestjs/common';
import WebSocket from 'ws';

const decoder = new TextDecoder('utf-8');

const handshakeTimeout = 10000;
const defaultReconnectDelay = 1000;
const maxReconnectDelay = 30000;
const heartbeatInterval = 30000;
const minConnectionDuration = 10000;

export class WebSocketClient {
  private readonly logger: Logger;

  private wsUrl: string;
  private messageType: 'text' | 'json';
  private onTryConnect?: () => void;
  private onOpen?: () => void;
  private onMessage: (data: unknown) => void;
  private onError?: () => void;
  private onClose?: () => void;

  private ws?: WebSocket;
  private reconnectTimer?: NodeJS.Timeout;
  private heartbeatTimer?: NodeJS.Timeout;
  private reconnectDelay = 1000;

  constructor(
    wsUrl: string,
    handlers: {
      onTryConnect?: () => void;
      onOpen?: () => void;
      onMessage: (data: unknown) => void;
      onError?: () => void;
      onClose?: () => void;
    },
    opt: { name?: string; messageType?: 'text' | 'json' } = {},
  ) {
    this.logger = new Logger(
      opt.name ? `${WebSocketClient.name}-${opt.name}` : WebSocketClient.name,
    );
    this.wsUrl = wsUrl;
    this.onTryConnect = handlers.onTryConnect;
    this.onOpen = handlers.onOpen;
    this.onMessage = handlers.onMessage;
    this.onError = handlers.onError;
    this.onClose = handlers.onClose;
    this.messageType = opt.messageType ?? 'json';
  }

  public connect(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN ||
        this.ws.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    this.logger.log(`Connecting to ${this.wsUrl}`);

    const ws = new WebSocket(this.wsUrl, {
      handshakeTimeout,
    });

    this.ws = ws;

    const connectedAt = Date.now();

    this.onTryConnect?.();

    ws.on('open', () => {
      this.logger.log('Connected to WebSocket');
      this.onOpen?.();
      this.reconnectDelay = defaultReconnectDelay;
      this.startHeartbeat();
    });

    ws.on('message', (data) => {
      const messageStr = Array.isArray(data)
        ? data.map((b) => decoder.decode(b)).join('')
        : decoder.decode(data);

      if (this.messageType === 'text') {
        this.onMessage?.(messageStr);
        return;
      }

      try {
        const message = JSON.parse(messageStr) as unknown;
        this.onMessage?.(message);
      } catch (ex) {
        this.logger.warn(`Error parsing string: ${messageStr}`, ex);
        return;
      }
    });

    ws.on('error', (error) => {
      this.logger.warn(`WebSocket error: ${error.message}`);
      this.onError?.();
    });

    ws.on('close', (code, reason) => {
      this.logger.warn(`WebSocket closed: ${code} ${reason.toString() || ''}`);
      this.onClose?.();
      this.clearHeartbeatTimer();

      this.ws = undefined;

      const connectionLifetime = Date.now() - connectedAt;

      if (connectionLifetime > minConnectionDuration) {
        this.reconnectDelay = defaultReconnectDelay;
      } else {
        this.reconnectDelay = Math.min(
          this.reconnectDelay * 2,
          maxReconnectDelay,
        );
      }

      this.scheduleReconnect();
    });
  }

  public close(): void {
    this.clearReconnectTimer();
    this.clearHeartbeatTimer();

    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
      this.ws = undefined;
    }
  }

  private startHeartbeat(): void {
    this.clearHeartbeatTimer();

    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, heartbeatInterval);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      return;
    }

    this.logger.log(`Reconnecting to websocket in ${this.reconnectDelay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.clearReconnectTimer();
      this.connect();
    }, this.reconnectDelay);
  }

  private clearHeartbeatTimer(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }
}
