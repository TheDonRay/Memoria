import express from 'express'; 
const app = express(); 
import { clerkMiddleware } from '@clerk/express';
// json parser 
app.use(express.json()); 
app.use(clerkMiddleware())

// import statements of routes
import testRoute from './routes/usertest.route.js';



// default route set up 
app.get('/Welcome', (req, res) => { 
    res.json({ 
        Message: "Welcome to the backend Server for Memoria" 
    }); 
}); 

//mount on routes
app.use('/api', testRoute);


export default app; 