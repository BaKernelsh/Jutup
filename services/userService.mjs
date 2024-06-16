import {ObjectId} from "mongodb";
import db from "../database/conn.mjs";


const getUser = async (userId) => {
    try {
        const user = await db.collection("users").findOne({
            "_id": new ObjectId(userId)
        });
        //console.log("user z getUser: ", user);
        return user;
    } catch (error) {
        console.log("error w getUser: ", error);
        throw error;
    }
};

const getUserByUsername = async (username) => {
    try{
        const user = await db.collection("users").findOne({
            "username": username
        });
        //console.log("user z getUserByUsername: "); console.log(user);
        return user;
    }catch(error){
        console.log("nie pobralo usera: ", error.message);
        throw error;
    }
}

const changeUsernameAndDescription = async(req) => {
    try {
        await db.collection("users").updateOne({
                "_id": new ObjectId(req.session.user_id)
            },
            {
                $set: {
                    username: req.body.username,
                    channelDescription: req.body.channelDesc
                }
            }
        );
    }catch(error){
        throw new Error;
    }
}


const subscribeOrUnsubscribe = async(userId, userIdToSubscribe) => {
    try {
        //console.log(userId);
        if(userId === userIdToSubscribe){ return; }
        console.log("nie takie same");
        const user = await getUser(userId);
        //console.log(user);
        let updateDoc;
        //let subscribed;
        const index = user.subscriptions.findIndex(sub => sub.toString() === userIdToSubscribe);
        if(index !== -1){
            //console.log("juz jest");
            updateDoc = { $pull: {subscriptions: new ObjectId(userIdToSubscribe)} };
            //subscribe
        } else{
            //console.log("jeszcze nie ma")
            updateDoc = { $push: {subscriptions: new ObjectId(userIdToSubscribe)} };
        }

        await db.collection("users").updateOne({
                "_id": new ObjectId(userId)
            },
            updateDoc
        );


    }catch (error){
        console.log(error.message);
        throw new Error("Error in sub");
    }
}
//subscribeR: String | ObjectId, subscribeD: String | ObjectId
const subscribesTo = async(subscribeR, subscribeD) => {
    let subscribeDString;
    if(typeof subscribeD === "string"){
        subscribeDString = subscribeD;
    }else{
        subscribeDString = subscribeD.toString();
    }

    let subscribeRString;
    if(typeof subscribeR === "string"){
        subscribeRString = subscribeR;
    }else{
        subscribeRString = subscribeR.toString();
    }

    const user = await getUser(subscribeRString);

    return user.subscriptions.findIndex(sub => sub.toString() === subscribeDString) === -1 ? false : true;
}



export default {
    getUser,
    getUserByUsername,
    subscribeOrUnsubscribe,
    subscribesTo,
    changeUsernameAndDescription,
};
