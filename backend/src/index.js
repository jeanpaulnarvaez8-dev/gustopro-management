require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io); // Make socket.io accessible in routes

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/tables', require('./routes/table.routes'));
app.use('/api/menu', require('./routes/menu.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/kds', require('./routes/kds.routes'));
app.use('/api/billing', require('./routes/billing.routes'));

// Basic Route for testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Riva Management API running' });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
