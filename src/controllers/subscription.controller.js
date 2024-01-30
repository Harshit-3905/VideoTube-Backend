import ApiError from "../utils/ApiError.js";
import ApiResonse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";

const getSubscribedChannels = asyncHandler(async (req, res) => {});

const toggleSubscription = asyncHandler(async (req, res) => {});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {});

export { getSubscribedChannels, toggleSubscription, getUserChannelSubscribers };
