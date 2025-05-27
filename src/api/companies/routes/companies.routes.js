import express from "express";
import { Companies } from "../controller/companies.js";

const router = express.Router();

router.post("/", Companies.migrate);

export default router;
