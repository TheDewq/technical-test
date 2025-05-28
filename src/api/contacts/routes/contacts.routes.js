import express from "express";
import { Contacts } from "../controller/contacts.js";

const router = express.Router();

router.post("/", Contacts.migrate);

export default router;
