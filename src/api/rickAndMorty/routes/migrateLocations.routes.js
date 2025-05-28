import express from "express";
import { RickAndMorty } from "../controller/rickAndMorty.js";

const router = express.Router();

router.get("/", RickAndMorty.MigrateLocations);

export default router;
