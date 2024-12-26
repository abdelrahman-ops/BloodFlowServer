import express from "express";
import { createRequest, registerPatient } from "../controllers/patientController.js";


const router = express.Router();

router.post('./register', registerPatient);
router.post('./request', createRequest)


export default router;