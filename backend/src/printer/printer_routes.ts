import { Router } from "express";
import { printTicket } from "./printer_controller";

const router = Router();

router.post("/print", printTicket);

export default router;
