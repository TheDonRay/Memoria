import express from 'express'; 
const testRoute = express.Router(); 

import requireUserAuth from '../middleware/auth.middleware.js'; 
import testRouteController from '../controllers/testroute.controller.js'; 

testRoute.get('/testing', requireUserAuth, testRouteController); 

export default testRoute;
