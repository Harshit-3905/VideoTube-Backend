import ApiError from "../utils/ApiError.js";
import ApiResonse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { userId } = req.user;
    const subscriptions = await Subscription.find({ subscriber: userId })
        .populate("channel", "name avatar")
        .select("-subscriber");
    if (!subscriptions) throw new ApiError(404, "No subscriptions found");
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
    const { userId } = req.user;
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
    await Subscription.create({
        subscriber: userId,
        channel: channelId,
    });
    return res
        .status(200)
        .json(new ApiResonse(200, null, "Subscribed Successfully"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "name avatar")
        .select("-subscriber");
    if (!subscriptions) throw new ApiError(404, "No subscriptions found");
    res.status(200).json(
        new ApiResonse(
            200,
            { subscriptions },
            "Subscriptions fetched successfully"
        )
    );
});

export { getSubscribedChannels, toggleSubscription, getUserChannelSubscribers };
