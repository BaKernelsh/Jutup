import {ObjectId} from "mongodb";
import db from "../database/conn.mjs";

const getUser = async(userId, callBack) => {
    await db.collection("users").findOne({
        "_id": new ObjectId(userId)
        }
    ).then(response => {
        if(callBack != null){
            console.log("user z getUser "); console.log(response);
            callBack(response)
        }
    },error => {
        console.log("error w getUser");
        console.log(error);
    })


}


export default {getUser};
