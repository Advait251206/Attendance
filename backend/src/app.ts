import dotenv from 'dotenv';
// Load env vars immediately
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import subjectRoutes from './routes/subjectRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import noteRoutes from './routes/noteRoutes';
import agentRoutes from './routes/agentRoutes';
import authRoutes from './routes/authRoutes';

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
    res.send('Cyberpunk Attendance API Running...');
});

// Routes
app.use('/api/subjects', subjectRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
