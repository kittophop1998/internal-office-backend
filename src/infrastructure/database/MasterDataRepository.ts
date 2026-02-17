import { IMasterRepository } from "../../application/repositories/masterRepo";
import { db } from "./maria";

export class MasterRepository implements IMasterRepository {
    async getMasterData(): Promise<any> {
        const [departments, roles, branches] = await Promise.all([
            db.selectFrom('departments').selectAll().execute(),
            db.selectFrom('roles').selectAll().execute(),
            db.selectFrom('branches').selectAll().execute()
        ]);

        return {
            departments,
            roles,
            branches
        };
    }
}