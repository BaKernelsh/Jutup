import UserService from "./userService.mjs";
import db from "../database/conn.mjs";
import {getVideoDurationInSeconds} from "get-video-duration";
import {ObjectId} from "mongodb";


const insertVideoIntoDb = async(req) =>{
    console.log(req.session.user_id);
    await UserService.getUser(req.session.user_id, async(userFromDb) => {
        await db.collection("videos").insertOne({
            "user_id": userFromDb._id,
            "title": req.body.title,
            "description": req.body.description,
            "category": req.body.category,
            "upload_date": new Date().getTime(),
            "length_in_seconds": await getVideoDurationInSeconds(req.filesPaths.video),
            "views": 0,
            "avg_rating": 0,
            "rating_count": 0,
            "users_rating": [],
            "comments": [],
            "video_path": req.filesPaths.video.replace("C:\\Users\\User\\Desktop\\Informatyka\\Semestr VI\\KCK\\aplikacja\\jutupts\\", ""),
            "thumbnail_path": req.filesPaths.thumbnail.replace("C:\\Users\\User\\Desktop\\Informatyka\\Semestr VI\\KCK\\aplikacja\\jutupts\\", ""),
        }, (error, data) =>{
            if(error){ console.log("error inserting movie to db");}
        })
    });
}


const getVideo = async(videoId) => {
    try {
        const video = await db.collection("videos").findOne({
            "_id": new ObjectId(videoId)
        })
            .then(response => {
                console.log("video response:"); console.log(response)
                return response;
            })
            .catch(error => {
                console.log("error w pobieraniu filmu");
                console.log(error);
            });

        if (video) {
            let videoSender;
            await UserService.getUser(video.user_id, (userFromDb) => {
                videoSender = userFromDb;
            });
            return {video, videoSender};
        }

    } catch (error) {
        return {error: error.message};
    }
}


const updateVideoRating = async(videoId, rating, userId) => {
    try{
        const video = await db.collection("videos").findOne({
            "_id": new ObjectId(videoId)
         });
        console.log(video._id);
        const index = video.users_rating.findIndex(el => el.user_id === userId)
        if(index !== -1){
            video.users_rating = video.users_rating.toSpliced(index, 1);
        }

        video.users_rating.push({
            user_id: userId,
            rating: rating
        });


        let ratingSum =0;
        video.users_rating.forEach(el => {
            ratingSum += el.rating;
        })

        const newRating = ratingSum / video.users_rating.length;

        const updateDoc = {
            $set: {
                avg_rating: newRating,
                users_rating: video.users_rating,
            }
        }

        await db.collection("videos").updateOne({
            "_id": new ObjectId(videoId)
        }, updateDoc);

    } catch (error) {
        console.log(error.message);
    }
}


export default {
    insertVideoIntoDb,
    getVideo,
    updateVideoRating
}
