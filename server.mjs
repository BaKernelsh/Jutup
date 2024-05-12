import express from "express";
import expressSession from "express-session";
import "express-async-errors";
import basic from "./routes/basic.mjs";
import video from "./routes/video.mjs";
import playlist from "./routes/playlist.mjs";
import path from "path";
import { fileURLToPath } from 'url';
import bodyParser from "body-parser";
import channel from "./routes/channel.mjs";

const app = express();

app.use(expressSession({
    "key": "user_id",
    "secret": "User secret Object Id",
    "resave": true,
    "saveUninitialized": true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("views", path.join(__dirname, "views"));
app.use("/public", express.static(__dirname+ "/public"));
app.set("view engine", "ejs");

app.use(basic);
app.use(video);
app.use(channel);
app.use(playlist);
//app.use("/movies", movies);

/*app.use((err, req, res, next) => {
    res.status(500).send("Błąd serwera");
});*/


app.listen(3000, () => {
    console.log("Server is running.");
})


