import { Request, Response } from 'express';
import { ResponseUtil } from '../utils/Response';
import { MasterService } from '../../../application/services/MasterService';

export class MasterController {
    constructor(
        private masterService: MasterService
    ) {}

    async get(_: Request, res: Response): Promise<void> {
        try {
            const masterData = await this.masterService.getMasterData();
            ResponseUtil.success(res, masterData, 'Request processed successfully');
        }catch (error: any) {
            ResponseUtil.error(res, 'An error occurred while processing the request.', 500, error.message);
        }
    }
}