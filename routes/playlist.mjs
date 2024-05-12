import express from "express";
import db from "../database/conn.mjs";


const router = express.Router();

router.get("/playlists", (req, res) => {
    res.render("playlists", {isLoggedIn: true});
});

export default router;
