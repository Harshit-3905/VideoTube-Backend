import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const uploadOnCloudinary = async (file) => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        const res = await cloudinary.uploader.upload(file, {
            resource_type: "auto",
        });
        return res;
    } catch (error) {
        console.log(error);
    } finally {
        fs.unlinkSync(file);
    }
};

const deleteFromCloudinary = async (url) => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        const parts = url.split("/");
        const idWithExtension = parts[parts.length - 1];
        const public_id = idWithExtension.split(".")[0];
        let resource_type = "image";
        if (
            idWithExtension.includes("mp4") ||
            idWithExtension.includes("webm") ||
            idWithExtension.includes("mkv")
        ) {
            resource_type = "video";
        }
        const res = await cloudinary.uploader.destroy(public_id, {
            resource_type,
        });
        return res;
    } catch (error) {
        console.log(error);
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
