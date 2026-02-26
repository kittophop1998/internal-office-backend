import { ReportService } from "../../../application/services/ReportService";
import { ResponseUtil } from "../utils/Response";
import path from "path";

const FONT_REGULAR = path.join(__dirname, "../../../infrastructure/assets/fonts/Sarabun-Regular.ttf");
const FONT_BOLD    = path.join(__dirname, "../../../infrastructure/assets/fonts/Sarabun-Bold.ttf");

export class ReportController {
    constructor(
        private reportService: ReportService
    ) {}

    async getUserReport(req: any, res: any): Promise<void> {
        try {
            const userId = req.query.userId ? Number(req.query.userId) : undefined;
            const branchId = req.query.branchId ? Number(req.query.branchId) : undefined;

            if (!userId || isNaN(userId)) {
                ResponseUtil.error(res, 'Invalid or missing userId', 400);
                return;
            }

            if (req.query.branchId && isNaN(Number(req.query.branchId))) {
                ResponseUtil.error(res, 'Invalid branchId', 400);
                return;
            }

            const filter = {
                type: req.query.type ?? null,
                branchId,
                date: req.query.date
            };

            const report = await this.reportService.getUserReport(userId, filter);

            if (!report) {
                ResponseUtil.error(res, 'User not found', 404);
                return;
            }

            ResponseUtil.success(res, report, 'User report retrieved successfully');
        } catch (error: any) {
            ResponseUtil.error(res, 'Failed to retrieve user report', 500, error.message);
        }
    }

    async exportPdf(req: any, res: any): Promise<void> {
        try {
            const userId = req.query.userId ? Number(req.query.userId) : undefined;
            const branchId = req.query.branchId ? Number(req.query.branchId) : undefined;

            if (!userId || isNaN(userId)) {
                ResponseUtil.error(res, 'Invalid or missing userId', 400);
                return;
            }

            if (req.query.branchId && isNaN(Number(req.query.branchId))) {
                ResponseUtil.error(res, 'Invalid branchId', 400);
                return;
            }

            const filter = {
                type: req.query.type ?? null,
                branchId,
                date: req.query.date
            };

            const report = await this.reportService.getUserReport(userId, filter);

            if (!report) {
                ResponseUtil.error(res, 'User not found', 404);
                return;
            }

            // ── สร้าง PDF ──────────────────────────────────────────────────────
            const PDFDocument = (await import("pdfkit")).default;
            const doc = new PDFDocument({ margin: 40, size: "A4" });

            // ลงทะเบียน font ภาษาไทย
            doc.registerFont("Thai",      FONT_REGULAR);
            doc.registerFont("Thai-Bold", FONT_BOLD);

            const filename = `report_user_${userId}_${filter.date ?? "all"}.pdf`;
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

            doc.pipe(res);

            // ── Header ─────────────────────────────────────────────────────────
            doc.fontSize(18).font("Thai-Bold").text("User Task Report", { align: "center" });
            doc.moveDown(0.5);

            doc.fontSize(11).font("Thai").text(`Name: ${report.name}`, { align: "center" });
            if (filter.date) {
                doc.text(`Date: ${filter.date}`, { align: "center" });
            }
            if (filter.type) {
                doc.text(`Type: ${filter.type}`, { align: "center" });
            }
            doc.moveDown(1);

            // ── Overall Rating ─────────────────────────────────────────────────
            doc.fontSize(13).font("Thai-Bold").text("Overall Critical Task Rating");
            doc.moveDown(0.3);
            doc.fontSize(11).font("Thai")
                .text(`Rating : ${report.overall_crittical_task_rating.rating}`)
                .text(`Percent: ${report.overall_crittical_task_rating.percent}%`);
            doc.moveDown(1);

            // ── Task Group Table ───────────────────────────────────────────────
            doc.fontSize(13).font("Thai-Bold").text("Task Group Summary");
            doc.moveDown(0.5);

            const tableTop = doc.y;
            const colX = { name: 40, weight: 300, rating: 370, score: 450 };
            const rowHeight = 24;

            // Table Header
            doc.fontSize(10).font("Thai-Bold");
            doc.rect(colX.name, tableTop, 510, rowHeight).fillAndStroke("#2c3e50", "#2c3e50");
            doc.fillColor("white")
                .text("Group Name",  colX.name   + 5, tableTop + 7, { width: 250, lineBreak: false })
                .text("Weight (%)",  colX.weight + 5, tableTop + 7, { width: 65,  lineBreak: false })
                .text("Rating",      colX.rating + 5, tableTop + 7, { width: 75,  lineBreak: false })
                .text("Score",       colX.score  + 5, tableTop + 7, { width: 55,  lineBreak: false });
            doc.fillColor("black");

            // Table Rows
            doc.font("Thai").fontSize(10);
            report.tasksReports.forEach((row: any, i: number) => {
                const rowY = tableTop + rowHeight * (i + 1);
                const bg = i % 2 === 0 ? "#ecf0f1" : "#ffffff";
                doc.rect(colX.name, rowY, 510, rowHeight).fillAndStroke(bg, "#bdc3c7");
                doc.fillColor("black")
                    .text(row.name,            colX.name   + 5, rowY + 7, { width: 250, lineBreak: false })
                    .text(String(row.weight),  colX.weight + 5, rowY + 7, { width: 65,  lineBreak: false })
                    .text(String(row.rating),  colX.rating + 5, rowY + 7, { width: 75,  lineBreak: false })
                    .text(String(row.score),   colX.score  + 5, rowY + 7, { width: 55,  lineBreak: false });
            });

            // ── Footer ─────────────────────────────────────────────────────────
            const afterTable = tableTop + rowHeight * (report.tasksReports.length + 1);
            doc.y = afterTable + 20;
            doc.fontSize(9).font("Thai").fillColor("gray")
                .text(`Generated on ${new Date().toISOString()}`, { align: "right" });

            doc.end();
        } catch (error: any) {
            if (!res.headersSent) {
                ResponseUtil.error(res, 'Failed to export PDF', 500, error.message);
            }
        }
    }
}