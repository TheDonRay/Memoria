import express from 'express';
const userInfoRoute = express.Router();

import requireUserAuth from '../middleware/auth.middleware.js';
import userInfoController from '../controllers/userinfo.controller.js';

userInfoRoute.get('/userinfo', requireUserAuth, userInfoController);

export default userInfoRoute;
