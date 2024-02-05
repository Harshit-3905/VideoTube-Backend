import ApiError from "../utils/ApiError.js";
import ApiResonse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    if (name.trim().length === 0) throw new ApiError(400, "Name is required");
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
    });
    return res
        .status(201)
        .json(new ApiResonse(201, playlist, "Playlist Created Successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!mongoose.isValidObjectId(playlistId))
        throw new ApiError(400, "Invalid Playlist Id");
    const playlist = await Playlist.findById(playlistId).populate({
        path: "videos",
        select: "title thumbnail owner",
        populate: { path: "owner", select: "username avatar" },
    });
    if (!playlist) throw new ApiError(404, "Playlist Not Found");
    return res
        .status(200)
        .json(new ApiResonse(200, playlist, "Playlist Fetched Successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    if (!mongoose.isValidObjectId(playlistId))
        throw new ApiError(400, "Invalid Playlist Id");
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist Not Found");
    if (playlist.owner.toString() !== req.user._id.toString())
        throw new ApiError(403, "You are not allowed to perform this action");
    if (name.trim().length === 0) throw new ApiError(400, "Name is required");
    playlist.name = name;
    playlist.description = description;
    await playlist.save();
    return res
        .status(200)
        .json(new ApiResonse(200, playlist, "Playlist Updated Successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    if (!mongoose.isValidObjectId(playlistId))
        throw new ApiError(400, "Invalid Playlist Id");
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist Not Found");
    if (playlist.owner.toString() !== req.user._id.toString())
        throw new ApiError(403, "You are not allowed to perform this action");
    await Playlist.findByIdAndDelete(playlistId);
    return res
        .status(200)
        .json(new ApiResonse(200, null, "Playlist Deleted Successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params;
    if (!mongoose.isValidObjectId(playlistId))
        throw new ApiError(400, "Invalid Playlist Id");
    if (!mongoose.isValidObjectId(videoId))
        throw new ApiError(400, "Invalid Video Id");
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist Not Found");
    if (playlist.owner.toString() !== req.user._id.toString())
        throw new ApiError(403, "You are not allowed to perform this action");
    if (playlist.videos.includes(videoId))
        throw new ApiError(400, "Video already in playlist");
    playlist.videos.push(videoId);
    await playlist.save();
    return res
        .status(200)
        .json(new ApiResonse(200, playlist, "Video Added Successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { videoId, playlistId } = req.params;
    if (!mongoose.isValidObjectId(playlistId))
        throw new ApiError(400, "Invalid Playlist Id");
    if (!mongoose.isValidObjectId(videoId))
        throw new ApiError(400, "Invalid Video Id");
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw new ApiError(404, "Playlist Not Found");
    if (playlist.owner.toString() !== req.user._id.toString())
        throw new ApiError(403, "You are not allowed to perform this action");
    if (!playlist.videos.includes(videoId))
        throw new ApiError(400, "Video not in playlist");
    playlist.videos = playlist.videos.filter(
        (video) => video.toString() !== videoId
    );
    await playlist.save();
    return res
        .status(200)
        .json(new ApiResonse(200, playlist, "Video Removed Successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    if (!mongoose.isValidObjectId(userId))
        throw new ApiError(400, "Invalid User Id");
    const playlists = await Playlist.find({ owner: userId }).populate({
        path: "videos",
        select: "title thumbnail owner",
        populate: { path: "owner", select: "username avatar" },
    });
    return res
        .status(200)
        .json(new ApiResonse(200, playlists, "Playlists Fetched Successfully"));
});

export {
    createPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    getUserPlaylists,
};
