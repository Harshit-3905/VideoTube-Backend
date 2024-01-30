import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResonse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const videos = await Video.find({ owner: userId });
    if (!videos) throw new ApiError(404, "Videos not found");
    const totalViews = videos.reduce((acc, video) => acc + video.views, 0);
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId,
    });
    res.status(200).json(
        new ApiResonse(
            200,
            { totalViews, totalSubscribers, totalVideos: videos?.length || 0 },
            "Channel stats fetched successfully"
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const _id = req.user._id;
    const videos = await Video.find({ owner: _id });
    if (!videos) throw new ApiError(404, "Videos not found");
    res.status(200).json(
        new ApiResonse(200, videos, "Videos fetched successfully")
    );
});

export { getChannelStats, getChannelVideos };
