import express from 'express'; 
const app = express(); 

// json parser 
app.use(express.json()); 

// import statements of routes  



// default route set up 
app.get('/Welcome', (req, res) => { 
    res.json({ 
        Message: "Welcome to the backend Server for Memoria" 
    }); 
}); 

//mount on routes 


export default app; 