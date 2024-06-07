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


const subscribeOrUnsubscribe = async(userId, userIdToSubscribe) => {
    try {
        if(userId === userIdToSubscribe){ return; }
        console.log("nie takie same");
        const user = await getUser(userId);
        console.log(user);
        //const subscriptions = user.subscriptions;
        const index = user.subscriptions.findIndex(sub => new ObjectId(sub) === new ObjectId(userIdToSubscribe));
        if(index !== -1){
            console.log("juz jest");
            user.subscriptions.toSpliced(index,1);
            /*await db.collection("users").updateOne({
                    "_id": userId
                },
                { $pull: {subscriptions: new ObjectId(userIdToSubscribe)} }
            );*/
        } else{
            user.subscriptions.push(userIdToSubscribe);
            console.log("jeszcze nie ma")
            /*await db.collection("users").updateOne({
                    "_id": userId
                },
                { $push: {subscriptions: new ObjectId(userIdToSubscribe)} }
            );*/
        }

        await db.collection("users").updateOne({
                "_id": userId
            },
            { $set: {subscriptions: user.subscriptions} }
        );

    }catch (error){
        console.log(error.message);
    }
}


export default {
    getUser,
    subscribeOrUnsubscribe,
};
