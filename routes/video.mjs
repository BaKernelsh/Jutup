import express from "express";
import {upload} from "../services/vidAndThumbSavingService.mjs";
import VideoService from "../services/videoService.mjs";
import videoService from "../services/videoService.mjs";
import UserService from "../services/userService.mjs";
import PlaylistService from "../services/playlistService.mjs";



const router = express.Router();

router.get("/upload", async(req, res) => {
    if(req.session.user_id){
        const user = await UserService.getUser(req.session.user_id);
        res.render("upload", {
            isLoggedIn: true,
            user: user,
        });
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

//Strona wyswietlająca video
router.get("/video", async(req, res) => {
    let videoId = req.query.videoid;
    //console.log(videoId);

    let videoAndUser; let playlist; let lastInPlaylist = false;
    if(req.query.playlistid && req.query.playlistindex){    //Są w URL playlistid i playlist index
        playlist = await PlaylistService.getPlaylist(req.query.playlistid);
        videoAndUser = playlist.playlistVideos[req.query.playlistindex];
        videoId = videoAndUser.video._id;
        if(Number(req.query.playlistindex) === playlist.playlistVideos.length-1){   //ostatni na playliscie
            lastInPlaylist = true;
        }
    }else{  //w URL jest videoid
        videoAndUser = await videoService.getVideo(videoId);
    }

    let userPlaylists; //let user;
    if(req.session.user_id){
        //user = await UserService.getUser(req.session.user_id);
        userPlaylists = await PlaylistService.getUserPlaylistList(req.session.user_id);
        console.log(userPlaylists);
    }


    if(videoAndUser.error){
        console.log("error w pobraniu");
        res.redirect("/");
    }
    else{
        //console.log(videoAndUser.videoSender._id);
        res.render("videoPage", {
            isLoggedIn: req.session.user_id ? true : false,
            user: await UserService.getUser(req.session.user_id),
            videoId: videoId,
            videoPath: videoAndUser.video.video_path,
            title: videoAndUser.video.title,
            description: videoAndUser.video.description,
            comments: videoAndUser.video.comments,
            avgRating: Math.round(videoAndUser.video.avg_rating),

            lastInPlaylist: lastInPlaylist,
            userPlaylists: userPlaylists,

            sender: {
                username: videoAndUser.videoSender.username,
                avatar: videoAndUser.videoSender.coverPhoto,
                id: videoAndUser.videoSender._id,
                subscribed: req.session.user_id ? await UserService.subscribesTo(req.session.user_id, videoAndUser.videoSender._id) : false,
                isCurrentUser: videoAndUser.videoSender._id.toString() === req.session.user_id,
            }
        });
        await VideoService.updateVideoViewCount(videoId);
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
