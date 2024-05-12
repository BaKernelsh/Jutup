import express from "express";
import db from "../database/conn.mjs";


const router = express.Router();

router.get("/channel", (req, res) => {
    res.render("channel", {isLoggedIn: false});
})

export default router;

