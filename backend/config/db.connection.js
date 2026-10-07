import mongoose from 'mongoose'; 

const databaseConnection = async () =>  { 
    const URIstring = process.env.URI;  

    if (!URIstring) { 
        console.error("URI is not defined in .env file"); 
        process.exit(1) 
    } 

    try { 
        await mongoose.connect(URIstring); 
        console.log("Connected to Database Successfully"); 
    } catch (error) { 
        console.error("Error Connecting to Database", error.message); 
        process.exit(1); 
    }
}; 

export { databaseConnection }; 