import { IMasterRepository } from "../repositories/masterRepo";

export class MasterService {
    constructor(
        private masterRepository: IMasterRepository
    ) { }

    async getMasterData(): Promise<any> {
        return this.masterRepository.getMasterData();
    }
}