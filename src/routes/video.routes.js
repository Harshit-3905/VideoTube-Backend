import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
    getAllVideos,
    getVideoById,
    publishVideo,
    deleteVideo,
    updateVideo,
    togglePublishVideo,
} from "../controllers/video.controller.js";

const router = Router();
router.use(verifyJWT);

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            { name: "videoFile", maxCount: 1 },
            { name: "thumbnail", maxCount: 1 },
        ]),
        publishVideo
    );
router
    .route("/:videoId")
    .get(getVideoById)
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);
router.route("toggle/publish/:videoId").patch(togglePublishVideo);

export default router;
