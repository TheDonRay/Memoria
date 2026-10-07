import 'dotenv/config'; 
import app from './app.js';   


// database connection line import  
import {databaseConnection} from './config/db.connection.js'; 

//invoke database function to run  
databaseConnection(); 


const PORT = process.env.PORT; 

app.listen(PORT, () => { 
    console.log(`Server Successfully running on http://localhost:${PORT}`);
}); 

