import ApiError from "../utils/ApiError.js";
import ApiResonse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import {
    uploadOnCloudinary,
    deleteFromCloudinary,
} from "../utils/cloudinary.js";
import mongoose from "mongoose";

const getAllVideos = asyncHandler(async (req, res) => {
    //TODO: Pagination
    const videos = await Video.find({ isPublished: true }).populate("owner", {
        username: 1,
        avatar: 1,
    });
    res.status(200).json(new ApiResonse(200, videos, "Videos found"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");
    video.views += 1;
    await video.save();
    res.status(200).json(new ApiResonse(200, video, "Video found"));
});

const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    if (title.trim().length === 0) {
        throw new ApiError(400, "Title and Description are required");
    }
    const videoFileLocalPath = req.files["videoFile"][0].path;
    const thumbnailLocalPath = req.files["thumbnail"][0].path;
    if (!videoFileLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video File and Thumbnail are required");
    }
    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration,
        owner: req.user._id,
    });
    res.status(201).json(new ApiResonse(201, video, "Video Published"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video");
    }
    await Video.findByIdAndDelete(videoId);
    await deleteFromCloudinary(video.thumbnail);
    await deleteFromCloudinary(video.videoFile);
    res.status(200).json(
        new ApiResonse(200, null, "Video Deleted Successfully")
    );
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");
    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video");
    }
    const { title, description } = req.body;
    if (title.trim().length === 0) {
        throw new ApiError(400, "Title and Description are required");
    }
    const thumbnailLocalPath = req.file?.path;
    if (thumbnailLocalPath) {
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        await deleteFromCloudinary(video.thumbnail);
        video.thumbnail = thumbnail.url;
    }
    video.title = title;
    video.description = description;
    await video.save();
    res.status(200).json(new ApiResonse(200, video, "Video Updated"));
});

const togglePublishVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById(videoId);
    if (!video) throw new ApiError(404, "Video not found");
    video.isPublished = !video.isPublished;
    await video.save();
    res.status(200).json(
        new ApiResonse(200, null, "Video Published Status Changed")
    );
});

export {
    getAllVideos,
    getVideoById,
    publishVideo,
    deleteVideo,
    updateVideo,
    togglePublishVideo,
};
