import express from "express";
import db from "../database/conn.mjs";
import bcrypt from "bcrypt";

const router = express.Router();

router.get("/", (req, res) => {
    res.render("index", {isLoggedIn: req.session.user_id ? true : false });
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
                    req.session.user_id = user._id;
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
                    "coverPhoto": "",
                    "image": "",
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
