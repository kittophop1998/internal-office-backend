import { IUserRepository } from "../../application/repositories/userRepo";
import { db } from "./maria";

export class UserRepository implements IUserRepository {

    private groupUserBranches(rows: any[]): any[] {
        const map = new Map<number, any>();

        for (const row of rows) {
            if (!map.has(row.id)) {
                const { branchId, branchName, ...userFields } = row;
                map.set(row.id, {
                    ...userFields,
                    branches: [],
                });
            }

            if (row.branchId !== null && row.branchId !== undefined) {
                map.get(row.id).branches.push({
                    branchId: row.branchId,
                    branchName: row.branchName,
                });
            }
        }

        return Array.from(map.values());
    }


    async create(user: any): Promise<any> {
        const createdUser = await db
            .insertInto("users")
            .values(user)
            .executeTakeFirst();

        const insertedId = createdUser?.insertId?.toString();

        return insertedId;
    }

    async findAll(filters: any): Promise<any[]> {
        let query = db
            .selectFrom('users')
            .innerJoin('roles', 'users.role_id', 'roles.id')
            .innerJoin('departments', 'users.department_id', 'departments.id')
            .leftJoin('user_branches', 'users.id', 'user_branches.user_id')
            .leftJoin('branches', 'user_branches.branch_id', 'branches.id');

        if (filters.roleId) {
            query = query.where('users.role_id', '=', Number(filters.roleId));
        }

        const rows = await query
            .select([
                'users.id as id',
                'users.username as username',
                'users.full_name as fullName',
                'users.email as email',
                'users.role_id as roleId',
                'roles.code as roleCode',
                'roles.name as roleName',
                'users.department_id as departmentId',
                'departments.name as departmentName',
                'user_branches.branch_id as branchId',
                'branches.name as branchName',
            ])
            .execute();

        return this.groupUserBranches(rows);
    }

    async findByUsername(username: string): Promise<any | null> {
        const rows = await db
            .selectFrom('users')
            .innerJoin('roles', 'users.role_id', 'roles.id')
            .innerJoin('departments', 'users.department_id', 'departments.id')
            .leftJoin('user_branches', 'users.id', 'user_branches.user_id')
            .leftJoin('branches', 'user_branches.branch_id', 'branches.id')
            .select([
                'users.id as id',
                'users.username as username',
                'users.full_name as fullName',
                'users.email as email',
                'users.department_id as departmentId',
                'users.role_id as roleId',
                'users.password_hash as passwordHash',
                'roles.code as roleCode',
                'roles.name as roleName',
                'branches.id as branchId',
                'branches.name as branchName',
                'departments.name as departmentName',
            ])
            .where('users.username', '=', username)
            .execute();

        return this.groupUserBranches(rows)[0] || null;
    }

    async findById(id: number): Promise<any | null> {
        const rows = await db
            .selectFrom('users')
            .innerJoin('roles', 'users.role_id', 'roles.id')
            .innerJoin('departments', 'users.department_id', 'departments.id')
            .leftJoin('user_branches', 'users.id', 'user_branches.user_id')
            .leftJoin('branches', 'user_branches.branch_id', 'branches.id')
            .select([
                'users.id as id',
                'users.username as username',
                'users.full_name as fullName',
                'users.email as email',
                'users.department_id as departmentId',
                'users.role_id as roleId',
                'users.branch_id as branchId',
                'roles.code as roleCode',
                'roles.name as roleName',
                'branches.name as branchName',
                'departments.name as departmentName',
            ])
            .where('users.id', '=', id)
            .execute();

        return this.groupUserBranches(rows)[0] || null;
    }

    async update(id: number, input: any): Promise<any> {
        await db
            .updateTable('users')
            .set(input)
            .where('id', '=', id)
            .execute();
    }

    async userbranchCreate(userId: number, userBranch: any): Promise<any> {
        await db
            .deleteFrom('user_branches')
            .where('user_id', '=', userId)
            .execute();

        await db.transaction().execute(async (trx) => {
            for (const item of userBranch) {
                await trx
                    .insertInto('user_branches')
                    .values({
                        ...item,
                        created_at: new Date(),
                        updated_at: new Date(),
                        deleted_at: null,
                    })
                    .execute();
            }
        });
    }
}