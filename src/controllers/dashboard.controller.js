import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResonse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { redisClient } from "../utils/redis.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const videos = await Video.find({ owner: userId });
    if (!videos) throw new ApiError(404, "Videos not found");
    const key = `channelStats:${userId}`;
    const cached = await redisClient.get(key);
    if (cached) {
        const stats = JSON.parse(cached);
        return res
            .status(200)
            .json(
                new ApiResonse(200, stats, "Channel stats fetched successfully")
            );
    }
    const totalViews = videos.reduce((acc, video) => acc + video.views, 0);
    const totalSubscribers = await Subscription.countDocuments({
        channel: userId,
    });
    await redisClient.set(
        key,
        JSON.stringify({
            totalViews,
            totalSubscribers,
            totalVideos: videos?.length || 0,
        }),
        "EX",
        60
    );
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
    const key = `channelVideos:${_id}`;
    const cached = await redisClient.get(key);
    if (cached) {
        const videos = JSON.parse(cached);
        return res
            .status(200)
            .json(new ApiResonse(200, videos, "Videos fetched successfully"));
    }
    const videos = await Video.find({ owner: _id });
    if (!videos) throw new ApiError(404, "Videos not found");
    await redisClient.set(key, JSON.stringify(videos), "EX", 60);
    res.status(200).json(
        new ApiResonse(200, videos, "Videos fetched successfully")
    );
});

export { getChannelStats, getChannelVideos };
