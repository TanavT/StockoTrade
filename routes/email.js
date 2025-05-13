import { Router } from 'express';
const router = Router();
import { userData, portfolioData } from '../data/index.js';
import { users } from '../config/mongodb/mongoCollections.js';
import { ObjectId } from 'mongodb';

router.route('/subscribe').post(async (req, res) => {

    let isLoggedIn = req.cookies.isAuthenticated;
    if (isLoggedIn === "true"){
        isLoggedIn = true;
    }
    else{
        isLoggedIn = false;
    }
    const userId = req.cookies.userID;

    let user = await userData.getUserById(userId);

    const userCollection = await users();

    const updatedInfo = await userCollection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { isSubscribed: true } },
        { returnDocument: 'after' }
    );

    return res.status(200).render('email', {isSubscribed:true});
});

router.route('/unsubscribe').post(async (req, res) => {

    let isLoggedIn = req.cookies.isAuthenticated;
    if (isLoggedIn === "true"){
        isLoggedIn = true;
    }
    else{
        isLoggedIn = false;
    }
    const userId = req.cookies.userID;

    let user = await userData.getUserById(userId);

    const userCollection = await users();

    const updatedInfo = await userCollection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $set: { isSubscribed: false } },
        { returnDocument: 'after' }
    );

    return res.status(200).render('email', {isSubscribed:false});
});

export default router;
