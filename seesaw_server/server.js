// server.js - The "middleman" server

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const PORT = 3000; // The port our server will run on

// --- Setup HTTP Server ---
const app = express();
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Middleware to parse incoming JSON data

const server = http.createServer(app);

// --- Setup WebSocket Server ---
const wss = new WebSocket.Server({ server });

// This function will broadcast data to all connected web UI clients
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

wss.on('connection', (ws) => {
    console.log('Web UI client connected to WebSocket.');
    ws.on('close', () => {
        console.log('Web UI client disconnected.');
    });
});

// --- API Endpoint for the Phone ---
// The MIT App Inventor app will send data to this endpoint.
app.post('/setpoint', (req, res) => {
    const { angle } = req.body;

    if (typeof angle !== 'undefined') {
        console.log(`Received angle from phone: ${angle}`);
        // Broadcast the received angle to all connected web UIs
        wss.broadcast(JSON.stringify({ type: 'setpoint', value: angle }));
        res.status(200).send({ status: 'OK' });
    } else {
        res.status(400).send({ error: 'Angle data missing' });
    }
});

// --- Start the Server ---
server.listen(PORT, () => {
    console.log(`✅ Server is running!`);
    console.log(`📱 App Inventor should send data to: http://<YOUR_PC_IP>:${PORT}/setpoint`);
    console.log(`🌐 Web UI should connect to WebSocket: ws://localhost:${PORT}`);
});
