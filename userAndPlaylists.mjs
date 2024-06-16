import UserService from "./services/userService.mjs";
import PlaylistService from "./services/playlistService.mjs";


const userAndPlaylists = async(req,res, next) => {
  if(req.session.user_id){
      console.log(req.session.user_id);
    const user = await UserService.getUser(req.session.user_id);
    const userPlaylists = await PlaylistService.getUserPlaylistList(req.session.user_id);
    const userSubscriptions = await Promise.all(user.subscriptions.map(async(subId) => {
        const sub = await UserService.getUser(subId);
        return {
            subUsername: sub.username,
        }
    }))

    console.log(userSubscriptions);

    console.log(user.username);
    res.locals.username = user.username;
      console.log(res.locals.username);
    res.locals.userSubscriptions = userSubscriptions;
    res.locals.userPlaylists = userPlaylists;
  }
  next();
}

export default userAndPlaylists;
