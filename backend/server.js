import 'dotenv/config'; 
import app from './app.js';   


// database connection line import 

//invoke database function to run 


const PORT = process.env.PORT; 

app.listen(PORT, () => { 
    console.log(`Server Successfully running on http://localhost:${PORT}`);
}); 

