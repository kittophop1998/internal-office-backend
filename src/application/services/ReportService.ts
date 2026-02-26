import { IReportRepository } from "../repositories/reportRepo";

export class ReportService {
    constructor(
        private reportRepository: IReportRepository
    ) { }

    async getUserReport(userId: number, filter: any): Promise<any> {
        try {
            const report = await this.reportRepository.getUserReport(userId, filter);
            return report;
        } catch (error) {
            console.error('Error fetching user report:', error);
            throw new Error('Failed to retrieve user report');
        }
    }
}