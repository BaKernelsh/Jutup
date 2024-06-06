import * as path from 'path';
import multer from 'multer';
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../public");
//console.log(uploadDir);



// Configure multer to handle image and video uploads
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, cb) {
            if (file.mimetype.startsWith('image/')) {
                cb(null, path.join(uploadDir, 'thumbnails'));
            } else if (file.mimetype.startsWith('video/')) {
                cb(null, path.join(uploadDir, 'videos'));
            }
        },
        filename(req, file, cb) {
            const filename = `${req.session.user_id}-${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`;
            cb(null, filename);

            if(!req.filesPaths) {
                req.filesPaths = {};
            }

            if(file.fieldname === "thumbnail"){
                req.filesPaths.thumbnail = path.join(uploadDir, "thumbnails", filename);
            }else if(file.fieldname === "video"){
                req.filesPaths.video = path.join(uploadDir, "videos", filename);
            }

            //cb(null, `${Date.now()}-${file.fieldname}${path.extname(file.originalname)}`);
        },
    }),
    fileFilter(req, file, cb) {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and videos are allowed!'));
        }
    },
    limits: { fileSize: 1000 * 1024 * 1024 }, // Set a larger limit for video files
}).fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]);


export { upload };
