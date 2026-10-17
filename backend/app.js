import express from 'express'; 
const app = express(); 
import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';

// allow the frontend to call the API (set CLIENT_URL in .env, defaults to Vite dev server)
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));

// json parser and clerk middleware
app.use(express.json()); 
app.use(clerkMiddleware())

// import statements of routes
import userInfoRoute from './routes/userinfo.route.js';
// upload memory route
import userMemories from './routes/memory.route.js';


// default route set up 
app.get('/Welcome', (req, res) => { 
    res.json({ 
        Message: "Welcome to the backend Server for Memoria" 
    }); 
}); 

//mount on routes
app.use('/api/v1', userInfoRoute);
app.use('/api/v1', userMemories);


export default app; 