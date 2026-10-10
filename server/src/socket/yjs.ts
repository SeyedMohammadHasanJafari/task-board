import { WebSocketServer, type WebSocket } from 'ws';
import type { IncomingMessage, Server as HTTPServer } from 'node:http';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

const messageSync = 0;
const messageAwareness = 1;

class WSSharedDoc extends Y.Doc {
  name: string;
  conns: Map<WebSocket, Set<number>>;
  awareness: awarenessProtocol.Awareness;

  constructor(name: string) {
    super({ gc: true });
    this.name = name;
    this.conns = new Map();
    this.awareness = new awarenessProtocol.Awareness(this);
    this.awareness.setLocalState(null);

    const awarenessChangeHandler = (
      { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
      origin: any
    ) => {
      const changedClients = added.concat(updated, removed);
      if (origin !== null && origin !== undefined) {
        const connControlledIds = this.conns.get(origin);
        if (connControlledIds !== undefined) {
          added.forEach((clientId) => connControlledIds.add(clientId));
          removed.forEach((clientId) => connControlledIds.delete(clientId));
        }
      }

      // Broadcast awareness update to all clients in doc
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageAwareness);
      encoding.writeVarUint8Array(
        encoder,
        awarenessProtocol.encodeAwarenessUpdate(this.awareness, changedClients)
      );
      const buff = encoding.toUint8Array(encoder);
      this.conns.forEach((_, c) => {
        send(this, c, buff);
      });
    };

    this.awareness.on('update', awarenessChangeHandler);

    this.on('update', (update: Uint8Array, origin: any) => {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeUpdate(encoder, update);
      const message = encoding.toUint8Array(encoder);
      this.conns.forEach((_, c) => {
        if (c !== origin) {
          send(this, c, message);
        }
      });
    });
  }
}

const docs = new Map<string, WSSharedDoc>();

function getYDoc(docName: string): WSSharedDoc {
  let doc = docs.get(docName);
  if (!doc) {
    doc = new WSSharedDoc(docName);
    docs.set(docName, doc);
  }
  return doc;
}

function send(doc: WSSharedDoc, conn: WebSocket, m: Uint8Array) {
  if (conn.readyState === 1) { // WebSocket.OPEN
    conn.send(m, (err) => {
      if (err) {
        closeConn(doc, conn);
      }
    });
  }
}

function closeConn(doc: WSSharedDoc, conn: WebSocket) {
  if (doc.conns.has(conn)) {
    const controlledIds = doc.conns.get(conn);
    doc.conns.delete(conn);
    if (controlledIds) {
      awarenessProtocol.removeAwarenessStates(
        doc.awareness,
        Array.from(controlledIds),
        null
      );
    }
  }
  try {
    conn.close();
  } catch {
    // Ignore close errors
  }
}

export function setupYjsServer(httpServer: HTTPServer): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request: IncomingMessage, socket, head) => {
    const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);

    if (url.pathname.startsWith('/yjs')) {
      wss.handleUpgrade(request, socket, head, (ws: WebSocket) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (conn: WebSocket, req: IncomingMessage) => {
    conn.binaryType = 'arraybuffer';
    const url = new URL(req.url || '', `http://${req.headers.host || 'localhost'}`);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const docName =
      (pathParts[0] === 'yjs' ? pathParts[1] : pathParts[0]) ||
      url.searchParams.get('room') ||
      'default-doc';

    const doc = getYDoc(docName);
    doc.conns.set(conn, new Set());

    // Listen for incoming messages from client
    conn.on('message', (message: any) => {
      try {
        const u8 =
          message instanceof Uint8Array
            ? new Uint8Array(message.buffer, message.byteOffset, message.byteLength)
            : new Uint8Array(message);

        const encoder = encoding.createEncoder();
        const decoder = decoding.createDecoder(u8);
        const messageType = decoding.readVarUint(decoder);

        switch (messageType) {
          case messageSync: {
            encoding.writeVarUint(encoder, messageSync);
            syncProtocol.readSyncMessage(decoder, encoder, doc, conn);
            if (encoding.length(encoder) > 1) {
              send(doc, conn, encoding.toUint8Array(encoder));
            }
            break;
          }
          case messageAwareness: {
            awarenessProtocol.applyAwarenessUpdate(
              doc.awareness,
              decoding.readVarUint8Array(decoder),
              conn
            );
            break;
          }
        }
      } catch (err) {
        console.error('[Yjs] Error handling message:', err);
      }
    });

    conn.on('close', () => {
      closeConn(doc, conn);
    });

    // Initial document synchronization
    {
      const encoder = encoding.createEncoder();
      encoding.writeVarUint(encoder, messageSync);
      syncProtocol.writeSyncStep1(encoder, doc);
      send(doc, conn, encoding.toUint8Array(encoder));

      const awarenessStates = doc.awareness.getStates();
      if (awarenessStates.size > 0) {
        const awEncoder = encoding.createEncoder();
        encoding.writeVarUint(awEncoder, messageAwareness);
        encoding.writeVarUint8Array(
          awEncoder,
          awarenessProtocol.encodeAwarenessUpdate(
            doc.awareness,
            Array.from(awarenessStates.keys())
          )
        );
        send(doc, conn, encoding.toUint8Array(awEncoder));
      }
    }

    console.log(`[yjs] Client connected to document: ${docName}`);
  });

  return wss;
}
