import express from "express";
import db from "../database/conn.mjs";
import bcrypt from "bcrypt";
import VideoService from "../services/videoService.mjs";
import UserService from "../services/userService.mjs";

const router = express.Router();

router.get("/", async(req, res) => {

    let topThreeVideos, xLastHoursTop3=4; //TODO przypadek kiedy jest 0 filmów w bazie
    do{
        topThreeVideos = await VideoService.getTopThreeVideos(xLastHoursTop3);
        xLastHoursTop3 += 4;
    }while(topThreeVideos.length < 3)

    let twentyPopular/* = await VideoService.get20Popular(10)*/,xLastHours20Pop=4;
    let loopCount=0;
    do{
        twentyPopular = await VideoService.get20Popular(xLastHours20Pop);
        xLastHours20Pop += 4;
        loopCount++;
    }while(twentyPopular.length <= 20 && loopCount<=20)

    if(req.session.user_id) {
        const user = await UserService.getUser(req.session.user_id);
        let fourFromSubs = await VideoService.get4FromSubscribed(req.session.user_id);
        res.render("index", {
            user: user,
            isLoggedIn: true,
            topThreeVideos: topThreeVideos,
            twentyPopular: twentyPopular,
            fourFromSubs: fourFromSubs,
        });
    }else {
        res.render("index", {
            isLoggedIn: req.session.user_id ? true : false,
            topThreeVideos: topThreeVideos,
            twentyPopular: twentyPopular,
            fourFromSubs: [],
        });
    }
})

router.get("/login", (req, res) => {
    res.render("login", {
        message: "",
        email: "",
    });
})

router.post("/login", async (req, res) => {
    try{
        const user = await db.collection("users").findOne({email: req.body.email});
        if(user) {
            bcrypt.compare(req.body.password, user.password, (error, isVerified) => {
                if(isVerified){
                    //console.log(user._id);
                    req.session.user_id = user._id;
                    //console.log(req.session.user_id)
                    res.redirect("/");
                }else {
                    res.render("login", { message: "Nieprawidłowe hasło.", email: user.email });
                }
            });
        }else {
            res.render("login", { message: "Użytkownik o takim adresie email nie istnieje" });
        }
    }catch (e){
        console.dir();
    }
})

router.get("/register", (req, res) => {
    res.render("register");
})

router.post("/register", async (req, res) => {
    try{
        const user = await db.collection("users").findOne({email: req.body.email});

        //console.log(user);
        if(!user){
            bcrypt.hash(req.body.password, 10, async (error, hash) => {
                await db.collection("users").insertOne({
                    "username": req.body.username,
                    "email": req.body.email,
                    "password": hash,
                    "coverPhoto": "public/images/userAvatarChannel.png",
                    "image": "",
                    "channelDescription": "",
                    "subscribers": 0,
                    "subscriptions": [],
                    "playlists": [],
                    "videos": [],
                    "history": [],
                    "notifications": []
                }, (error, data) => {
                    res.redirect("/login");
                });
                res.redirect("/login");
            });
        } else {
            res.send("Email jest już zajęty");
        }
    } catch (e){
        console.dir();
    }
});

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
})

router.get("/help", (req, res) => {
    res.render("help", {isLoggedIn: req.session.user_id ? true : false })
})

export default router;
