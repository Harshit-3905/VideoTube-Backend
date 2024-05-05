import ApiError from "../utils/ApiError.js";
import ApiResonse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import { redisClient } from "../utils/redis.js";

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const userId = req.params.userId || req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (page < 1) throw new ApiError(400, "Invalid page number");
    if (limit < 1) throw new ApiError(400, "Invalid limit number");
    const key = `subscriptions:${userId}:${page}:${limit}`;
    const cached = await redisClient.get(key);
    if (cached) {
        const subscriptions = JSON.parse(cached);
        return res
            .status(200)
            .json(
                new ApiResonse(
                    200,
                    { subscriptions },
                    "Subscriptions fetched successfully"
                )
            );
    }
    const skip = (page - 1) * limit;
    const subscriptions = await Subscription.find({ subscriber: userId })
        .skip(skip)
        .limit(limit)
        .populate("channel", "username avatar")
        .select("-subscriber");
    if (!subscriptions) throw new ApiError(404, "No subscriptions found");
    await redisClient.set(key, JSON.stringify(subscriptions), "EX", 60);
    res.status(200).json(
        new ApiResonse(
            200,
            { subscriptions },
            "Subscriptions fetched successfully"
        )
    );
});

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id;
    const subscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId,
    });
    if (subscription) {
        await Subscription.findByIdAndDelete(subscription._id);
        return res
            .status(200)
            .json(new ApiResonse(200, null, "Unsubscribed Successfully"));
    }
    const newSubscription = await Subscription.create({
        subscriber: userId,
        channel: channelId,
    });
    return res
        .status(200)
        .json(new ApiResonse(200, newSubscription, "Subscribed Successfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (page < 1) throw new ApiError(400, "Invalid page number");
    if (limit < 1) throw new ApiError(400, "Invalid limit number");
    const key = `channelSubscribers:${channelId}:${page}:${limit}`;
    const cached = await redisClient.get(key);
    if (cached) {
        const subscriptions = JSON.parse(cached);
        return res
            .status(200)
            .json(
                new ApiResonse(
                    200,
                    { subscriptions },
                    "Subscriptions fetched successfully"
                )
            );
    }
    const skip = (page - 1) * limit;
    const subscriptions = await Subscription.find({
        channel: channelId,
    })
        .skip(skip)
        .limit(limit)
        .populate("subscriber", "username avatar")
        .select("-channel");
    if (!subscriptions) throw new ApiError(404, "No subscriptions found");
    await redisClient.set(key, JSON.stringify(subscriptions), "EX", 60);
    res.status(200).json(
        new ApiResonse(
            200,
            { subscriptions },
            "Subscriptions fetched successfully"
        )
    );
});

export { getSubscribedChannels, toggleSubscription, getUserChannelSubscribers };
