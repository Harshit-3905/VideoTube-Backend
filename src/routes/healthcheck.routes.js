import { Router } from "express";
import ApiResonse from "../utils/ApiResponse.js";

const router = Router();

router.route("/").get((req, res) => {
    res.status(200).json(new ApiResonse(200, {}, "Server is up and running"));
});

export default router;
