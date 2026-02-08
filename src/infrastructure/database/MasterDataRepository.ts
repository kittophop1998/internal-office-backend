import { IMasterRepository } from "../../application/repositories/masterRepo";
import { db } from "./maria";

export class MasterRepository implements IMasterRepository {
    async getMasterData(): Promise<any> {
        const [department, position, branches] = await Promise.all([
            db.selectFrom('departments').selectAll().execute(),
            db.selectFrom('positions').selectAll().execute(),
            db.selectFrom('branches').selectAll().execute()
        ]);

        return {
            department,
            position,
            branches
        };
    }
}