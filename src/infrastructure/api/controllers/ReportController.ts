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

            const PAGE_MARGIN   = 40;
            const PAGE_WIDTH    = 595.28;   // A4
            const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

            const doc = new PDFDocument({ margin: PAGE_MARGIN, size: "A4", autoFirstPage: true });

            doc.registerFont("Thai",      FONT_REGULAR);
            doc.registerFont("Thai-Bold", FONT_BOLD);

            const filename = `report_user_${userId}_${filter.date ?? "all"}.pdf`;
            res.setHeader("Content-Type", "application/pdf");
            res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
            doc.pipe(res);

            // ─────────────────────────────────────────────────────────────────
            // Helper : draw a bordered cell (fills bg, strokes border, writes text)
            // ─────────────────────────────────────────────────────────────────
            const cell = (
                x: number, y: number, w: number, h: number,
                text: string,
                opts: {
                    bg?: string;
                    borderColor?: string;
                    font?: string;
                    fontSize?: number;
                    color?: string;
                    align?: "left" | "center" | "right";
                    paddingX?: number;
                    paddingY?: number;
                } = {}
            ) => {
                const {
                    bg = "#ffffff",
                    borderColor = "#aaaaaa",
                    font = "Thai",
                    fontSize = 9,
                    color = "black",
                    align = "left",
                    paddingX = 5,
                    paddingY = 4,
                } = opts;

                doc.rect(x, y, w, h).fillAndStroke(bg, borderColor);
                doc.font(font).fontSize(fontSize).fillColor(color);
                doc.text(text, x + paddingX, y + paddingY, {
                    width: w - paddingX * 2,
                    lineBreak: true,
                    align,
                });
            };

            // ═════════════════════════════════════════════════════════════════
            // SECTION 1 : HEADER  "Kpi Store 2025 – Year-End Review"
            // ═════════════════════════════════════════════════════════════════
            const HEADER_H = 50;
            const headerY  = PAGE_MARGIN;

            // Logo placeholder box (left)
            const LOGO_W = 60;
            doc.rect(PAGE_MARGIN, headerY, LOGO_W, HEADER_H)
                .fillAndStroke("#eeeeee", "#aaaaaa");
            doc.font("Thai-Bold").fontSize(7).fillColor("#888888")
                .text("LOGO", PAGE_MARGIN, headerY + 20, { width: LOGO_W, align: "center" });

            // Title (right of logo)
            const titleX = PAGE_MARGIN + LOGO_W + 10;
            doc.font("Thai-Bold").fontSize(16).fillColor("#1a1a1a")
                .text("Kpi Store 2025", titleX, headerY + 8, { continued: true })
                .font("Thai").fillColor("#e74c3c")
                .text(" - Year-End Review");

            doc.moveDown(0.2);

            // ═════════════════════════════════════════════════════════════════
            // SECTION 2 : EMPLOYEE INFO  (2-column grid, 4 rows)
            // ═════════════════════════════════════════════════════════════════
            const infoY     = headerY + HEADER_H + 12;
            const COL_LABEL = 110;   // width of label cell
            const COL_VALUE = 170;   // width of value cell
            const PAIR_W    = COL_LABEL + COL_VALUE;   // one label+value pair
            const GAP       = 10;
            const INFO_H    = 22;

            // Left column starts at PAGE_MARGIN, right column starts in the middle
            const leftX  = PAGE_MARGIN;
            const rightX = PAGE_MARGIN + PAIR_W + GAP;

            const infoRows: [string, string, string, string][] = [
                ["Name :",       report.name ?? "",  "Department :",                        ""],
                ["Employee ID :", "",                "Starting Date :",                     filter.date ?? ""],
                ["Position :",   "",                 "Starting Date in current position :", ""],
                ["Company :",    "",                 "Supervisor Name :",                    ""],
            ];

            const LABEL_BG  = "#e8e8e8";
            const VALUE_BG  = "#f7f7f7";
            const BORDER_C  = "#c0c0c0";

            infoRows.forEach(([lLabel, lValue, rLabel, rValue], i) => {
                const rowY = infoY + i * INFO_H;
                cell(leftX,             rowY, COL_LABEL, INFO_H, lLabel,  { bg: LABEL_BG, borderColor: BORDER_C, font: "Thai-Bold", fontSize: 8 });
                cell(leftX + COL_LABEL, rowY, COL_VALUE, INFO_H, lValue,  { bg: VALUE_BG, borderColor: BORDER_C, fontSize: 8 });
                cell(rightX,            rowY, COL_LABEL, INFO_H, rLabel,  { bg: LABEL_BG, borderColor: BORDER_C, font: "Thai-Bold", fontSize: 8 });
                cell(rightX + COL_LABEL,rowY, COL_VALUE, INFO_H, rValue,  { bg: VALUE_BG, borderColor: BORDER_C, fontSize: 8 });
            });

            // ═════════════════════════════════════════════════════════════════
            // SECTION 3 : INSTRUCTION + RATING SCORE DEFINITION
            // ═════════════════════════════════════════════════════════════════
            const instrY  = infoY + infoRows.length * INFO_H + 12;
            const INSTR_LABEL_W = 110;
            const INSTR_W       = CONTENT_WIDTH - INSTR_LABEL_W;

            // "Instruction:" label (spans 2 rows)
            const instrLines = [
                "1) Please explain your 5 critical tasks which would impact to your overall performance based on your job description.",
                "2) Please allocate weight and rate score to each critical task according to rating score definition.",
                "3) Please rate score to each core values and competencies according to rating score definition.",
            ];
            const INSTR_ROW_H = 16;
            const instrBlockH = instrLines.length * INSTR_ROW_H;

            doc.rect(PAGE_MARGIN, instrY, INSTR_LABEL_W, instrBlockH)
                .fillAndStroke(LABEL_BG, BORDER_C);
            doc.font("Thai-Bold").fontSize(8).fillColor("black")
                .text("Instruction:\n(for 1 and 2)", PAGE_MARGIN + 4, instrY + (instrBlockH - 28) / 2, {
                    width: INSTR_LABEL_W - 8, lineBreak: true
                });

            instrLines.forEach((line, i) => {
                const rY = instrY + i * INSTR_ROW_H;
                cell(PAGE_MARGIN + INSTR_LABEL_W, rY, INSTR_W, INSTR_ROW_H, line,
                    { bg: "#ffffff", borderColor: BORDER_C, fontSize: 7, paddingY: 4 });
            });

            // Rating Score Definition rows
            const ratingDefs: { rate: string; desc: string; highlight?: boolean }[] = [
                { rate: "Rate 5", desc: "Exceed all expectation with an outstanding performance (ได้ผลงานเกินที่คาดหวังไว้ในทุกด้าน)" },
                { rate: "Rate 4", desc: "Exceed some expectation with a good performance (ได้ผลงานเกินที่คาดหวังไว้ในบางด้าน)" },
                { rate: "Rate 3", desc: "Meet all expectation as committed (ได้ผลงานตามที่คาดหวังไว้ในทุกด้าน)", highlight: true },
                { rate: "Rate 2", desc: "Meet only some expectation and the majority need improvement (ได้ผลงานต่ำกว่าที่คาดหวังไว้บางด้าน)" },
                { rate: "Rate 1", desc: "None expectation is met and improvement is urgently required (ได้ผลงานต่ำกว่าที่คาดหวังไว้ในทุกด้าน)" },
            ];

            const rDefY       = instrY + instrBlockH;
            const RATE_H      = 16;
            const RATE_LABEL_W = INSTR_LABEL_W;   // label column (same width as "Instruction")
            const RATE_RATE_W  = 55;
            const RATE_DESC_W  = INSTR_W - RATE_RATE_W;

            // "Rating Score Definition" label (spans all rate rows)
            const rDefBlockH = ratingDefs.length * RATE_H;
            doc.rect(PAGE_MARGIN, rDefY, RATE_LABEL_W, rDefBlockH)
                .fillAndStroke("#c0392b", "#c0392b");
            doc.font("Thai-Bold").fontSize(8).fillColor("white")
                .text("Rating Score\nDefinition", PAGE_MARGIN + 4, rDefY + (rDefBlockH - 24) / 2, {
                    width: RATE_LABEL_W - 8, align: "center", lineBreak: true
                });

            ratingDefs.forEach((rd, i) => {
                const rY      = rDefY + i * RATE_H;
                const rateBg  = rd.highlight ? "#fde8e8" : "#f7f7f7";
                const rateCol = rd.highlight ? "#c0392b" : "black";
                const rateFont = rd.highlight ? "Thai-Bold" : "Thai";
                cell(PAGE_MARGIN + RATE_LABEL_W,              rY, RATE_RATE_W, RATE_H, rd.rate,
                    { bg: rateBg, borderColor: BORDER_C, font: rateFont, fontSize: 8, color: rateCol, align: "center" });
                cell(PAGE_MARGIN + RATE_LABEL_W + RATE_RATE_W, rY, RATE_DESC_W, RATE_H, rd.desc,
                    { bg: rd.highlight ? "#fde8e8" : "#ffffff", borderColor: BORDER_C, font: rateFont, fontSize: 7, color: rateCol });
            });

            // ═════════════════════════════════════════════════════════════════
            // SECTION 4 : "1. TASKS" TABLE
            // ═════════════════════════════════════════════════════════════════
            const taskSectionY = rDefY + rDefBlockH + 14;

            // Section title
            doc.font("Thai-Bold").fontSize(10).fillColor("black")
                .text("1.  TASKS ", PAGE_MARGIN, taskSectionY, { continued: true })
                .font("Thai").fontSize(8).fillColor("#555555")
                .text("(Based on Job Description and how your l tasks support team's KPI)");

            const taskTableY = taskSectionY + 16;

            // Column layout
            const COL_TASK_W    = CONTENT_WIDTH - 60 - 50 - 50;   // Critical Tasks
            const COL_WEIGHT_W  = 60;
            const COL_RATING_W  = 50;
            const COL_SCORE_W   = 50;
            const TABLE_ROW_H   = 30;
            const HEADER_ROW_H  = 22;

            const colTaskX   = PAGE_MARGIN;
            const colWeightX = colTaskX   + COL_TASK_W;
            const colRatingX = colWeightX + COL_WEIGHT_W;
            const colScoreX  = colRatingX + COL_RATING_W;

            // Header row
            const HEADER_BG = "#5d6d7e";
            cell(colTaskX,   taskTableY, COL_TASK_W,   HEADER_ROW_H, "Critical Tasks",
                { bg: HEADER_BG, borderColor: HEADER_BG, font: "Thai-Bold", fontSize: 9, color: "white", align: "center" });
            cell(colWeightX, taskTableY, COL_WEIGHT_W, HEADER_ROW_H, "Weight",
                { bg: HEADER_BG, borderColor: HEADER_BG, font: "Thai-Bold", fontSize: 9, color: "white", align: "center" });
            cell(colRatingX, taskTableY, COL_RATING_W, HEADER_ROW_H, "Rating",
                { bg: HEADER_BG, borderColor: HEADER_BG, font: "Thai-Bold", fontSize: 9, color: "white", align: "center" });
            cell(colScoreX,  taskTableY, COL_SCORE_W,  HEADER_ROW_H, "Score",
                { bg: HEADER_BG, borderColor: HEADER_BG, font: "Thai-Bold", fontSize: 9, color: "white", align: "center" });

            // Data rows
            report.tasksReports.forEach((row: any, i: number) => {
                const rowY  = taskTableY + HEADER_ROW_H + i * TABLE_ROW_H;
                const rowBg = i % 2 === 0 ? "#f0f3f4" : "#ffffff";

                cell(colTaskX,   rowY, COL_TASK_W,   TABLE_ROW_H, row.name,
                    { bg: rowBg, borderColor: BORDER_C, fontSize: 8 });
                cell(colWeightX, rowY, COL_WEIGHT_W, TABLE_ROW_H, `${row.weight}%`,
                    { bg: rowBg, borderColor: BORDER_C, fontSize: 8, align: "center" });
                cell(colRatingX, rowY, COL_RATING_W, TABLE_ROW_H, String(row.rating),
                    { bg: rowBg, borderColor: BORDER_C, fontSize: 8, align: "center" });
                cell(colScoreX,  rowY, COL_SCORE_W,  TABLE_ROW_H, String(row.score),
                    { bg: rowBg, borderColor: BORDER_C, fontSize: 8, align: "center" });
            });

            // Overall Critical Tasks Rating row (footer row)
            const overallY     = taskTableY + HEADER_ROW_H + report.tasksReports.length * TABLE_ROW_H;
            const OVERALL_ROW_H = 22;
            const overallRating = report.overall_crittical_task_rating.rating;

            // "100%" weight total + label spanning task & weight cols
            const labelSpanW = COL_TASK_W;
            cell(colTaskX,   overallY, labelSpanW,   OVERALL_ROW_H, "Overall Critical Tasks Rating",
                { bg: "#d5d8dc", borderColor: BORDER_C, font: "Thai-Bold", fontSize: 8, align: "right" });
            cell(colWeightX, overallY, COL_WEIGHT_W, OVERALL_ROW_H, "100%",
                { bg: "#d5d8dc", borderColor: BORDER_C, font: "Thai-Bold", fontSize: 8, align: "center" });
            // Span Rating + Score cols for the overall value
            const overallValW = COL_RATING_W + COL_SCORE_W;
            cell(colRatingX, overallY, overallValW, OVERALL_ROW_H, String(overallRating),
                { bg: "#d5d8dc", borderColor: BORDER_C, font: "Thai-Bold", fontSize: 11, align: "center" });

            // ═════════════════════════════════════════════════════════════════
            // FOOTER
            // ═════════════════════════════════════════════════════════════════
            const footerY = overallY + OVERALL_ROW_H + 16;
            doc.font("Thai").fontSize(7).fillColor("#999999")
                .text(`Generated on ${new Date().toISOString()}`, PAGE_MARGIN, footerY, {
                    width: CONTENT_WIDTH, align: "right"
                });

            doc.end();
        } catch (error: any) {
            if (!res.headersSent) {
                ResponseUtil.error(res, 'Failed to export PDF', 500, error.message);
            }
        }
    }
}