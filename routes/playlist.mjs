import express from "express";
import db from "../database/conn.mjs";
import UserService from "../services/userService.mjs";
import PlaylistService from "../services/playlistService.mjs";
import userAndPlaylists from "../userAndPlaylists.mjs";


const router = express.Router();

router.get("/:channel/playlists",userAndPlaylists, async(req, res) => {
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


router.get("/playlist",userAndPlaylists, async (req, res) => {

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
        return res.status(201).json({ message: "Utworzono playlistę" });
    }catch(error){
        return res.status(500).json({ message: "błąd w tworwniu playlisty" });
    }
});


router.patch("/addToPlaylist/:playlistid", async (req, res) => {
    try{
        console.log("dodawanie");
        await PlaylistService.addToPlaylist(req.params.playlistid, req.body.videoId, req.session.user_id);
        return res. status(200).json({ message: "Dodano do playlisty" });
    }catch(error){
        return res.status(500).json({ message: "Wystapił błąd w dodawaniu do playlisty" });
    }
});


router.delete("/playlist/:playlistid", async(req,res) => {
    try{
        await PlaylistService.deletePlaylist(req.params.playlistid, req.session.user_id);
        return res. status(200).json({ message: "Usunięto playlistę" });
    }catch(error){
        return res.status(500).json({ message: "Wystapił błąd w usuwaniu playlisty" });
    }
})


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
