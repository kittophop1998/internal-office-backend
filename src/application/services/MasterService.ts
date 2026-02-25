import { IMasterRepository } from "../repositories/masterRepo";

export class MasterService {
    constructor(
        private masterRepository: IMasterRepository
    ) { }

    async getMasterData(): Promise<any> {
        return this.masterRepository.getMasterData();
    }

    async getBranchMasterData(filter: any): Promise<any> {
        return this.masterRepository.getBranchMasterData(filter);
    }
}