import ApiError from "../utils/ApiError.js";
import ApiResonse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: pagination
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;
    const { _id } = req.user;
    if (!mongoose.Types.ObjectId.isValid(videoId))
        throw new ApiError(400, "Invalid Video ID");
    if (content.length === 0)
        throw new ApiError(400, "Comment cannot be empty");
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");
    const comment = await Comment.create({
        content,
        video: videoId,
        owner: _id,
    });
    if (!comment) throw new ApiError(500, "Something went wrong");
    res.status(201).json(new ApiResonse(201, comment, "Comment added"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { _id } = req.user;
    if (!mongoose.Types.ObjectId.isValid(commentId))
        throw new ApiError(400, "Invalid Comment ID");
    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");
    if (comment.owner.toString() !== _id.toString())
        throw new ApiError(
            403,
            "You are not authorized to delete this comment"
        );
    await Comment.findByIdAndDelete(commentId);
    res.status(200).json(
        new ApiResonse(200, {}, "Comment deleted Successfully")
    );
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const { _id } = req.user;
    if (!mongoose.Types.ObjectId.isValid(commentId))
        throw new ApiError(400, "Invalid Comment ID");
    const comment = await Comment.findById(commentId);
    if (!comment) throw new ApiError(404, "Comment not found");
    if (comment.owner.toString() !== _id.toString())
        throw new ApiError(
            403,
            "You are not authorized to update this comment"
        );
    comment.content = content;
    await comment.save();
    res.status(200).json(
        new ApiResonse(200, comment, "Comment Updated Successfully")
    );
});

export { getVideoComments, addComment, deleteComment, updateComment };