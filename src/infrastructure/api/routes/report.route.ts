import { Router } from "express";
import { ReportRepository } from "../../database/ReportRepository";
import { ReportService } from "../../../application/services/ReportService";
import { ReportController } from "../controllers/ReportController";
import { authMiddleware } from "../middlewares/authMiddleware";

export function setupReportRoute() {
    const router = Router();

    /**
     * Repositories
     */
    const reportRepo = new ReportRepository();

    /**
     * Services
     */
    const reportService = new ReportService(reportRepo);

    /**
     * Controller
     */
    const reportController = new ReportController(reportService);

    /**
     * Routes
     */
    router.get('/user', authMiddleware, (req, res) => reportController.getUserReport(req, res));
    router.get('/export-pdf', authMiddleware, (req, res) => reportController.exportPdf(req, res));

    return router;
}