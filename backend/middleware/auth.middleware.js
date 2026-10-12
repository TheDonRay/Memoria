// Clerk Middleware function here to actually protect routes from unsigned users etc. 
import { getAuth } from '@clerk/express'; 

const requireUserAuth = (req, res, next) => { 
    const {userId} = getAuth(req); 
    if (!userId) { 
        return res.status(401).json({error: "Unauthorized User"}); 
    } 
    next(); 
}

export default requireUserAuth;
