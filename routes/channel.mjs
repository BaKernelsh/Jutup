import express from "express";
import db from "../database/conn.mjs";


const router = express.Router();

router.get("/channel", (req, res) => {
    res.render("channel", {isLoggedIn: req.session.user_id ? true : false, own: false});
});

router.get("/channel/own", (req, res) => {
    res.render("channel", {isLoggedIn: true, own: true});
});

router.get("/settings", (req, res) => {
    res.render("settings/settings", {isLoggedIn: true});
});

router.get("/settings/changepassword", (req, res) => {
    res.render("settings/changepassword", {isLoggedIn: true, oldPassGood: true, message: ""});
});

router.post("/settings/changepassword", (req, res) => {
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

router.get("/settings/mymovies", (req, res) => {
    res.render("settings/mymovies", {isLoggedIn: true});
});

router.get("/settings/moviedetails", (req, res) => {
    res.render("settings/movieDetails", {isLoggedIn: true})
})



export default router;

