import UserService from "./userService.mjs";
import db from "../database/conn.mjs";
import {getVideoDurationInSeconds} from "get-video-duration";
import {ObjectId} from "mongodb";


const insertVideoIntoDb = async(req) =>{
    console.log(req.session.user_id);
    const user = await UserService.getUser(req.session.user_id)
        await db.collection("videos").insertOne({
            "user_id": user._id,
            "title": req.body.title,
            "description": req.body.description,
            "category": req.body.category,
            "upload_date": new Date().getTime(),
            "length_in_seconds": await getVideoDurationInSeconds(req.filesPaths.video),
            "views": 0,
            "avg_rating": 0,
            "rating_count": 0,
            "users_rating": [],
            "popularity_score": 0,
            "comments": [],
            "video_path": req.filesPaths.video.replace("C:\\Users\\User\\Desktop\\Informatyka\\Semestr VI\\KCK\\aplikacja\\jutupts\\", ""),
            "thumbnail_path": req.filesPaths.thumbnail.replace("C:\\Users\\User\\Desktop\\Informatyka\\Semestr VI\\KCK\\aplikacja\\jutupts\\", ""),
        }, (error, data) =>{
            if(error){ console.log("error inserting movie to db");}
        });
}


const getVideo = async(videoId) => {
    try {
        const video = await db.collection("videos").findOne({
            "_id": new ObjectId(videoId)
        })
            .then(response => {
                //console.log("video response:"); console.log(response)
                return response;
            })
            .catch(error => {
                console.log("error w pobieraniu filmu");
                console.log(error);
            });

        if (video) {
            let videoSender;
            const user = await UserService.getUser(video.user_id);
                videoSender = user;

            return {video, videoSender};
        }

    } catch (error) {
        return {error: error.message};
    }
}


const getTopThreeVideos = async(xLastHours) => {
    try {
        const topThreeVideos = await db.collection("videos").find({
            upload_date: {$gte: new Date().getTime() - (xLastHours * 60 * 60 * 1000)}
        })
            .sort({popularity_score: -1})
            .limit(3)
            .toArray();

        //console.log(topThreeVideos);

        const topThreeVideosWithSender = await Promise.all(topThreeVideos.map(async (video) => {
            const sender = await UserService.getUser(video.user_id);
            return {
                ...video,
                senderUsername: sender.username,
                senderAvatarPath: sender.coverPhoto
            };
        }));

        return topThreeVideosWithSender;
    } catch (error){
        console.log(error.message);
    }
}


const get20Popular = async(xLastHours) => {
    try{
        const twentyPopular = await db.collection("videos").find({
            upload_date: {$gte: new Date().getTime() - (xLastHours * 60 * 60 * 1000)}
        })
            .sort({popularity_score: -1})
            .limit(20)
            .toArray();

        const twentyPopularWithSender = await Promise.all(twentyPopular.map(async (video) => {
            const sender = await UserService.getUser(video.user_id);
            return {
                ...video,
                senderUsername: sender.username,
                senderAvatarPath: sender.coverPhoto
            };
        }));


        return twentyPopularWithSender;

    }catch (error){
        console.log(error.message);
    }
}

const get4FromSubscribed = async(userId) => {

    const user = await UserService.getUser(userId);

    const fourFromSubscribed = await db.collection("videos").find({
        "user_id": { $in: user.subscriptions }
    })
        .sort({popularity_score: -1})
        .limit(4)
        .toArray();

    const fourFromSubscribedWithSender = await Promise.all(fourFromSubscribed.map(async (video) => {
        const sender = await UserService.getUser(video.user_id);
        return {
            ...video,
            senderUsername: sender.username,
            senderAvatarPath: sender.coverPhoto
        };
    }));

    return fourFromSubscribedWithSender;

}

const updateVideoViewCount = async(videoId) => {
    try{
        const video = await db.collection("videos").findOne({
            "_id": new ObjectId(videoId)
        });

        const newScore = ((video.views+1) - video.users_rating.length)
            + video.users_rating.length * video.avg_rating;

        const updateDoc = {
            $inc: { views: 1},
            $set: { popularity_score: newScore }
        }

        await db.collection("videos").updateOne({
            "_id": new ObjectId(videoId)
        }, updateDoc);


    }catch (error) {
        console.log(error.message);
    }
}


const updateVideoRating = async(videoId, rating, userId) => {
    try{
        const video = await db.collection("videos").findOne({
            "_id": new ObjectId(videoId)
         });

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

        const newScore = (video.views - video.users_rating.length)
            + video.users_rating.length * newRating;

        const updateDoc = {
            $set: {
                avg_rating: newRating,
                users_rating: video.users_rating,
                popularity_score: newScore,
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
    updateVideoRating,
    updateVideoViewCount,
    getTopThreeVideos,
    get20Popular,
    get4FromSubscribed,

}
