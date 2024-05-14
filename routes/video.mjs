import express from "express";
import db from "../database/conn.mjs";

const router = express.Router();

router.get("/upload", (req, res) => {
    if(req.session.user_id){
        res.render("upload", {isLoggedIn: true});
    }else{
        res.redirect("/login");
    }
});

router.post("/upload", (req, res) => {
    res.redirect("/video");
})

router.get("/video", (req, res) => {
    res.render("videoPage", {isLoggedIn: req.session.user_id ? true : false});
});

export default router;
