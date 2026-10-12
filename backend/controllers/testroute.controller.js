// test controller here  
import { getAuth } from '@clerk/express'; 
import testRouteService from '../services/testroute.services.js'; 

const testRouteController = (req, res) => { 
    const { userId } = getAuth(req); 
    res.json(testRouteService(userId)); 
} 

export default testRouteController;
