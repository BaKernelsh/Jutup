import express from "express";
import {upload} from "../services/vidAndThumbSavingService.mjs";
import VideoService from "../services/videoService.mjs";
import videoService from "../services/videoService.mjs";



const router = express.Router();

router.get("/upload", (req, res) => {
    if(req.session.user_id){
        res.render("upload", {isLoggedIn: true});
    }else{
        res.redirect("/login");
    }
});




router.post("/upload", async(req, res) => {
    if(req.session.user_id){

        await upload(req,res, async (err) => {
            if (!err) {
                await VideoService.insertVideoIntoDb(req);

                res.redirect("/");
            }else{
                console.log("error w zapisywaniu");
                res.redirect("/");
            }


        })


    }else {
        res.redirect("/login");
    }
})


router.get("/video", async(req, res) => {
    const videoId = req.query.videoid;
    console.log(videoId);

    const videoAndUser = await videoService.getVideo(videoId);
    if(videoAndUser.error){
        console.log("error w pobraniu");
        res.redirect("/");
    }
    else{
        res.render("videoPage", {
            isLoggedIn: req.session.user_id ? true : false,
            videoPath: videoAndUser.video.video_path,
            title: videoAndUser.video.title,
            description: videoAndUser.video.description,
            comments: videoAndUser.video.comments,
            avgRating: Math.round(videoAndUser.video.avg_rating),

            sender: {
                username: videoAndUser.videoSender.username,
                avatar: videoAndUser.videoSender.coverPhoto,
            }
        });
    }


});


router.patch("/rate_video", async(req, res) => {
    console.log("patch");
    if(req.session.user_id){
        console.log("zalogowany");
        await VideoService.updateVideoRating(req.body.videoId, req.body.rating, req.session.user_id);
    }
})

export default router;
