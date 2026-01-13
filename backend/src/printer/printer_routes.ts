import { Router } from "express";
import { printTicket } from "./printer_controller";

const router = Router();

// POST /api/printer/print
router.post("/print", printTicket);

export default router;
