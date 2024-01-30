import ApiError from "../utils/ApiError.js";
import ApiResonse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (content.trim().length === 0) {
        throw new ApiError(400, "Content cannot be empty");
    }
    const tweet = await Tweet.create({ content, owner: req.user._id });
    if (!tweet) {
        throw new ApiError(500, "Something went wrong");
    }
    return res
        .status(200)
        .json(new ApiResonse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    let { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid User ID");
    }
    userId = new mongoose.Types.ObjectId(userId);
    const tweets = await Tweet.find({ owner: userId });
    return res
        .status(200)
        .json(new ApiResonse(200, tweets || [], "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID");
    }
    let tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this tweet");
    }
    const { content } = req.body;
    if (content.trim().length === 0) {
        throw new ApiError(400, "Content cannot be empty");
    }
    tweet = await Tweet.findByIdAndUpdate(tweetId, { content }, { new: true });
    if (!tweet) {
        throw new ApiError(500, "Something went wrong");
    }
    return res
        .status(200)
        .json(new ApiResonse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID");
    }
    let tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }
    await Tweet.findByIdAndDelete(tweetId);
    return res
        .status(200)
        .json(new ApiResonse(200, null, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
