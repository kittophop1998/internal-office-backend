export interface IReportRepository {
    getUserReport(userId: number, filter: any): Promise<any>;
}