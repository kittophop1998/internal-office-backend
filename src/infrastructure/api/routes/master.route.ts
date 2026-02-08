import { Router } from "express";
import { MasterRepository } from "../../database/MasterDataRepository";
import { MasterService } from "../../../application/services/MasterService";
import { MasterController } from "../controllers/MasterController";

export function setupMasterRoute() {
    const router = Router();
    
    /**
     * Repositories
     */
    const masterRepo = new MasterRepository();

    /**
     * Services
     */
    const masterService = new MasterService(masterRepo);

    /**
     * Controller
     */
    const masterController = new MasterController(masterService);

    /**
     * Routes
     */
    router.get('/', (req, res) => masterController.get(req, res));

    return router;
}