import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { _id } = req.user;
    const like = await Like.findOne({ video: videoId, likedBy: _id });
    if (like) {
        await Like.findByIdAndDelete(like._id);
        return res.status(200).json(new ApiResponse(200, {}, "Like removed"));
    }
    const newLike = await Like.create({ video: videoId, likedBy: _id });
    if (!newLike) throw new ApiError(500, "Something went wrong");
    res.status(201).json(new ApiResponse(201, newLike, "Like added"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { _id } = req.user;
    const like = await Like.findOne({ comment: commentId, likedBy: _id });
    if (like) {
        await Like.findByIdAndDelete(like._id);
        return res.status(200).json(new ApiResponse(200, {}, "Like removed"));
    }
    const newLike = await Like.create({ comment: commentId, likedBy: _id });
    if (!newLike) throw new ApiError(500, "Something went wrong");
    res.status(201).json(new ApiResponse(201, newLike, "Like added"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { _id } = req.user;
    const like = await Like.findOne({ tweet: tweetId, likedBy: _id });
    if (like) {
        await Like.findByIdAndDelete(like._id);
        return res.status(200).json(new ApiResponse(200, {}, "Like removed"));
    }
    const newLike = await Like.create({ tweet: tweetId, likedBy: _id });
    if (!newLike) throw new ApiError(500, "Something went wrong");
    res.status(201).json(new ApiResponse(201, newLike, "Like added"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const likes = await Like.find({ likedBy: _id }).populate("video");
    if (!likes) throw new ApiError(500, "Something went wrong");
    res.status(200).json(new ApiResponse(200, likes, "Liked videos"));
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
