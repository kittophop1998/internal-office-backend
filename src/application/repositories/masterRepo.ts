export interface IMasterRepository {
    getMasterData(): Promise<any>;
    getBranchMasterData(filter: any): Promise<any>;
}