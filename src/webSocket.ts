import http from 'http';
import * as WebSocket from 'ws';

import Message from './models/Message';
import app from "./app";
import { Mongoose } from 'mongoose';



const server = http.createServer(app);
const websocketServer = new WebSocket.Server({ server });



// Define the message data type
interface MessageData {
    sender: string;
    recipient: string;
    message: string;
    messageId: string;
}

// Define the WebSocket entity map type
interface WebSocketEntityMap {
    [key: string]: WebSocket;
}

const clients: WebSocketEntityMap = {};

websocketServer.on("connection", (ws) => {

    // console.log(ws)

    ws.on("message", async (message) => {
        const data = JSON.parse(message);


        const clientId = data.sender;
        const recipientId = data.recipient;




        const newMessage = {
            sender: data.sender,
            type: data.type,
            recipient: data.recipient,
            message: data.message,
            messageId: data.messageId
        }


        const registerClient = function () {
            if (!clients[data.sender]) {
                clients[data.sender] = ws;
            }
        }

        const forwardMessageToRecipient = function () {
            if (clients[data.recipient]) {
                clients[data.recipient].send(JSON.stringify(newMessage));
            }
        }


        const sendAcknowledgmentToClient = function () {
            const ackMessage = {
                type: "ack",
                sender: data.recipient,
                recipient: data.sender,
                message: data.message,
                messageId: data.messageId
            };
            clients[data.sender].send(JSON.stringify(ackMessage));
        }

        switch (data.type) {
            case null || 'message':
                forwardMessageToRecipient();
                // Save the message to MongoDB using Mongoose
                Message.create(newMessage);
                sendAcknowledgmentToClient();
                break;
            case 'register':
                registerClient();
                break;
        }


    });

    ws.on("close", () => {
        // Remove the WebSocket connection from the clients object
        for (const [username, socket] of Object.entries(clients)) {
            if (socket === ws) {
                console.log(`Removed socket of name: ${username}`);
                delete clients[username];
                break;
            }
        }
        console.log("Client disconnected!");
    });
});

websocketServer.on('error', (error) => {
    console.error('WebSocket server error:', error);
});

websocketServer.on('listening', () => {
    console.log('WebSocket server is listening');
});


export { server };
