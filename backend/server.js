require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

// Import Service Routes
const queueRoutes = require('./src/services/queue/routes');
const tellerRoutes = require('./src/services/teller/routes');
const kycRoutes = require('./src/services/kyc/routes');
const adminRoutes = require('./src/services/admin/routes');
const receiptRoutes = require('./src/services/receipt/routes');
const authRoutes = require('./src/services/auth/routes');

const app = express();
const server = http.createServer(app);

// Setup WebSockets (Optional Enhancement)
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for dev
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Service Mounting
// In a true microservice architecture, these would be separate apps.
// Here we use a Modular Monolith approach for ease of deployment while keeping code separated.
app.use('/api/auth', authRoutes);
app.use('/api/queue', queueRoutes(io)); // Pass IO for real-time updates
app.use('/api/teller', tellerRoutes(io));
app.use('/api/kyc', kycRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/receipt', receiptRoutes);

// Root Endpoint
app.get('/', (req, res) => {
    res.json({ message: 'Bureau de Change Backend System Operational' });
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`\n🚀 Backend System running on http://localhost:${PORT}`);
    console.log(`   - Queue Service: /api/queue`);
    console.log(`   - Teller Service: /api/teller`);
    console.log(`   - KYC Service: /api/kyc`);
    console.log(`   - Admin Service: /api/admin`);
});
