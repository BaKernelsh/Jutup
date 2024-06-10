import express from "express";
import db from "../database/conn.mjs";
import UserService from "../services/userService.mjs";
import VideoService from "../services/videoService.mjs";


const router = express.Router();
//TODO zmienić na /:channel
router.get("/channel", async(req, res) => {
    const channelOwnerUsername = req.query.username;

    const channelOwner = await UserService.getUserByUsername(channelOwnerUsername); console.log("owner: ", channelOwner);
    const ownerVideos = await VideoService.getUserVideosByUserId(channelOwner._id);

    res.render("channel", {
        isLoggedIn: req.session.user_id ? true : false,
        user: await UserService.getUser(req.session.user_id),
        own: req.session.user_id === channelOwner._id.toString() ? true : false,
        ownerVideos: ownerVideos,
        owner: {
            username: channelOwner.username,
            avatar: channelOwner.coverPhoto,
            description: channelOwner.channelDescription,
        }
    });
});


router.get("/settings", async(req, res) => {
    res.render("settings/settings", {isLoggedIn: true, user: await UserService.getUser(req.session.user_id),});
});

router.get("/settings/changepassword", async(req, res) => {
    res.render("settings/changepassword", {isLoggedIn: true, user: await UserService.getUser(req.session.user_id), oldPassGood: true, message: ""});
});

router.post("/settings/changepassword", async(req, res) => {
    if(!req.body.oldPassword ==="dobre"){
        res.render("settings/changepassword",{isLoggedIn: true, oldPassGood: false});
    }
    else {
        if(!req.body.password === req.body.confirmPassword) {
            res.render("settings/changepassword",{isLoggedIn: true, oldPassGood: true, message: "notmatch"});
        }else {
            res.render("settings/changepassword",{isLoggedIn: true, oldPassGood: true, message: "ok"});
        }
    }
});

router.get("/settings/mymovies", async(req, res) => {
    res.render("settings/mymovies", {isLoggedIn: true, user: await UserService.getUser(req.session.user_id),});
});

router.get("/settings/moviedetails", async(req, res) => {
    res.render("settings/movieDetails", {isLoggedIn: true, user: await UserService.getUser(req.session.user_id),})
})

router.patch("/subscribe", async(req, res) => {
    try {
        if (req.session.user_id) {
            const userIdToSubscribe = req.body.useridtosubscribe;
            console.log(req.body.useridtosubscribe);
            console.log("subskrybowanie");
            if (userIdToSubscribe) {
                await UserService.subscribeOrUnsubscribe(req.session.user_id, userIdToSubscribe);
            }
            res.status(200);
        }
    }catch (error){
        res.status(500);
    }
});


export default router;

