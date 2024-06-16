import db from "../database/conn.mjs";
import UserService from "./userService.mjs";
import {ObjectId} from "mongodb";
import VideoService from "./videoService.mjs";
import session from "express-session";


const createPlaylist = async(userId, playlistName, firstVideoId) => {
    try{
        await db.collection("playlists").insertOne({
            "user_id": new ObjectId(userId),
            "playlistName": playlistName,
            "videos": [new ObjectId(firstVideoId)],
        }, (error, data) => {
            if(error){ console.log("error in saving playlist", error.message); }
            }
        );

    }catch(error){
        console.log(error.message);
        throw new Error;
    }
}


const getPlaylist = async(playlistId) => {
   try{
       let playlistIdString = playlistId.toString();

        const playlist = await db.collection("playlists").findOne({
            "_id": new ObjectId(playlistIdString)
        });
        //console.log(playlist);

       const playlistVideos = await Promise.all(playlist.videos.map(async(videoId) => {
           return await VideoService.getVideo(videoId);
       }));
       console.log(playlistVideos)
        return {playlist, playlistVideos};
   }catch (error) {
        console.log("error getting playlist from db", error.message);
   }
}

const getUserPlaylists = async(username) => {
    try{
        const user = await UserService.getUserByUsername(username);
        const playlists = await db.collection("playlists").find({
            "user_id": new ObjectId(user._id)
        })
            .toArray();

        const playlistsWithThumbnails = await Promise.all(playlists.map(async (playlist) => {
            const firstVideo = await VideoService.getVideo(playlist.videos[0].toString());
            return {
                ...playlist,
                thumbnail_path: firstVideo.video.thumbnail_path,
            };
        }));
        console.log(playlistsWithThumbnails);

        return playlistsWithThumbnails;
    }catch (error){
        console.log("error in fetchin users playlists")
        throw new Error;
    }
}

const getUserPlaylistList = async(userId) => {
    const userPlaylists = db.collection("playlists").find({
        "user_id": new ObjectId(userId)
    })
        .sort("videos.length", -1)
        .project({
            "_id": 1,
            "playlistName": 1,
            //"videos": 1
        })
        .toArray()

    return userPlaylists;
}


const addToPlaylist = async(playlistId, videoId, currentUserId) => {
    try{
        const playlist = await db.collection("playlists").findOne({
            "_id": new ObjectId(playlistId)
        });

        if(playlist.user_id.toString() !== currentUserId){
            console.log("inny user");
            throw new Error;
        }else{
            await db.collection("playlists").updateOne({
                "_id": new ObjectId(playlistId)
            },
            { $push: {videos: new ObjectId(videoId)} }
            );
        }

    }catch(error){
        console.log("error adding to playlist", error.message);
        throw new Error;
    }
}

const deletePlaylist = async(playlistId, currentUserId) => {
    try{
        const playlist = await db.collection("playlists").findOne({
            "_id": new ObjectId(playlistId)
        });

        if(playlist.user_id.toString() !== currentUserId){
            console.log("inny user");
            throw new Error;
        }else{
            await db.collection("playlists").deleteOne({
                    "_id": new ObjectId(playlistId)
                }
            );
        }

    }catch(error){
        console.log("error deleting playlist", error.message);
        throw new Error;
    }
}

const removeFromPlaylist = async(playlistId, videoId, currentUserId) => {
    try{
        const playlist = await db.collection("playlists").findOne({
            "_id": new ObjectId(playlistId)
        });

        if(playlist.user_id.toString() !== currentUserId){
            console.log("inny user");
            throw new Error;
        }else{
            await db.collection("playlists").updateOne({
                    "_id": new ObjectId(playlistId)
                },
                { $pull: {videos: new ObjectId(videoId)} }
            );
        }

    }catch(error){
        console.log("error removing from playlist", error.message);
        throw new Error;
    }
}

const removeFromPlaylistAtIndex = async(playlistId, videoIndex, currentUserId) => {
    try{
        const playlist = await db.collection("playlists").findOne({
            "_id": new ObjectId(playlistId)
        });

        if(playlist.user_id.toString() !== currentUserId){
            console.log("inny user");
            throw new Error;
        }else{
            await db.collection("playlists").updateOne({
                    "_id": new ObjectId(playlistId)
                },
                { $unset: { [`videos.${videoIndex}`]: 1 } }
            );

            await db.collection("playlists").updateOne({
                    "_id": new ObjectId(playlistId)
                },
                { $pull: {videos: null} }
            );

        }

    }catch(error){
        console.log("error removing from playlist", error.message);
        throw new Error;
    }
}


export default {
    createPlaylist,
    getPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    removeFromPlaylistAtIndex,
    getUserPlaylists,
    getUserPlaylistList,
    deletePlaylist,
}
