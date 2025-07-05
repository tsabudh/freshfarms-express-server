import https from 'http';
import WebSocket from 'ws';

import Message from './models/Message';
import app from './app';

const server = https.createServer(app);
const websocketServer = new WebSocket.Server({ server });

// Define the message data type
interface MessageData {
  sender: string;
  recipient: string;
  message: string;
  messageId: string;
  type: string;
}

const clients: Record<string, Set<WebSocket>> = {};

websocketServer.on('connection', async (ws) => {
  ws.on('message', async (message) => {
    try {
      const data = await JSON.parse(message.toString());

      const newMessage: MessageData = {
        sender: data.sender,
        type: data.type,
        recipient: data.recipient,
        message: data.message,
        messageId: data.messageId,
      };

      const registerClient = function () {
        if (!clients[data.sender]) {
          const x = (clients[data.sender] = new Set());
          x.add(ws);
        }
        if (clients[data.sender] && !clients[data.sender]?.has(ws)) {
          clients[data.sender]?.add(ws);
        }
      };

      const forwardMessageToRecipient = function () {
        const recipientSockets = clients[data.recipient];

        if (recipientSockets) {
          recipientSockets.forEach((recipientSocket) => {
            recipientSocket.send(JSON.stringify(newMessage));
          });
        }
      };

      const sendAcknowledgmentToClient = function () {
        const ackMessage = {
          type: 'ack',
          sender: data.sender,
          recipient: data.recipient,
          message: data.message,
          messageId: data.messageId,
        };

        const ackClients = clients[data.sender];

        if (!ackClients) {
          console.error(`No client found for sender: ${data.sender}`);
          return;
        }
        ackClients.forEach((ackClient) => ackClient.send(JSON.stringify(ackMessage)));
      };

      switch (data.type) {
        case 'message':
        case null:
          forwardMessageToRecipient();
          // Save the message to MongoDB using Mongoose
          Message.create(newMessage);
          sendAcknowledgmentToClient();
          break;
        case 'register':
          registerClient();
          break;
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.log(err.message);
      } else {
        console.error("Unknown error when ws received 'message'.");
      }
    }
  });

  ws.on('close', () => {
    // Remove the WebSocket connection from the clients object
    for (const [username, socketSet] of Object.entries(clients)) {
      if (socketSet.has(ws)) {
        socketSet.delete(ws);
        if (socketSet.size === 0) {
          delete clients[username];
        }
        break;
      }
    }
  });
});

websocketServer.on('error', (error) => {
  console.error('WebSocket server error:', error);
});

websocketServer.on('listening', () => {
  console.log('WebSocket server is listening');
});

export { server };
