import express from "express";
import db from "../database/conn.mjs";
import UserService from "../services/userService.mjs";
import PlaylistService from "../services/playlistService.mjs";


const router = express.Router();

router.get("/:channel/playlists", async(req, res) => {
    try{
        const userPlaylists = await PlaylistService.getUserPlaylists(req.params.channel);

        res.render("playlists", {
            isLoggedIn: req.session.user_id ? true : false,
            user: await UserService.getUser(req.session.user_id),
            playlists: userPlaylists,
        });

    }catch (error){
        return res.status(500);
    }


});


router.get("/playlist", async (req, res) => {

    const playlist = await PlaylistService.getPlaylist(req.query.playlistid);

    res.render("playlist", {
        isLoggedIn: req.session.user_id ? true : false,
        user: await UserService.getUser(req.session.user_id),
        own: playlist.playlist.user_id.toString() === req.session.user_id,
        playlist: playlist.playlist,
        playlistVideos: playlist.playlistVideos,
    });
});

//tworzenie playlisty
router.post("/playlist", async(req, res) => {
    try {
        const firstVideoId = req.body.firstVideoId;

        await PlaylistService.createPlaylist(req.session.user_id, req.body.playlistName, firstVideoId);
        res.status(201);
    }catch(error){
        res.status(500);
    }
});


router.patch("/addToPlaylist/:playlistid", async (req, res) => {
    try{
        console.log("dodawanie");
        await PlaylistService.addToPlaylist(req.params.playlistid, req.body.videoId, req.session.user_id);
        return res. status(200);
    }catch(error){
        return res.status(500);
    }
});

router.patch("/removeFromPlaylist/:playlistid", async (req, res) => {
    try{
        await PlaylistService.removeFromPlaylist(req.params.playlistid, req.body.videoId, req.session.user_id);
        return res. status(200);
    }catch(error){
        return res.status(500);
    }
});

router.patch("/removeFromPlaylistAtIndex/:playlistid", async (req, res) => {
    try{
        await PlaylistService.removeFromPlaylistAtIndex(req.params.playlistid, req.body.videoIndex, req.session.user_id);
        return res. status(200);
    }catch(error){
        return res.status(500);
    }
});

export default router;
