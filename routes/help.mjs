import express from "express";
import userAndPlaylists from "../userAndPlaylists.mjs";


const router = express.Router();

router.get("/help/mainpage",userAndPlaylists, (req, res) => {
    res.render("help/helpMainPage", {
        isLoggedIn: req.session.user_id ? true :false,
    });
});


export default router;
