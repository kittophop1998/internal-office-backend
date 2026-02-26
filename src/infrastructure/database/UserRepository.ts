import { IUserRepository } from "../../application/repositories/userRepo";
import { db } from "./maria";

export class UserRepository implements IUserRepository {
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

        return query
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
    }

    async findByUsername(username: string): Promise<any | null> {
        return db
            .selectFrom('users')
            .innerJoin('roles', 'users.role_id', 'roles.id')
            .innerJoin('departments', 'users.department_id', 'departments.id')
            .select([
                'users.id as id',
                'users.username as username',
                'users.full_name as fullName',
                'users.email as email',
                'users.department_id as departmentId',
                'users.role_id as roleId',
                'users.password_hash as passwordHash',
                'users.current_branch_id as currentBranchId',
                'roles.code as roleCode',
                'roles.name as roleName',
                'departments.name as departmentName',
            ])
            .where('users.username', '=', username)
            .executeTakeFirst();
    }

    async findById(id: number): Promise<any | null> {
        return db
            .selectFrom('users')
            .innerJoin('roles', 'users.role_id', 'roles.id')
            .innerJoin('departments', 'users.department_id', 'departments.id')
            .select([
                'users.id as id',
                'users.username as username',
                'users.full_name as fullName',
                'users.email as email',
                'users.department_id as departmentId',
                'users.role_id as roleId',
                'users.current_branch_id as currentBranchId',
                'roles.code as roleCode',
                'roles.name as roleName',
            ])
            .where('users.id', '=', id)
            .executeTakeFirst();
    }

    async update(id: number, input: any): Promise<any> {
        await db
            .updateTable('users')
            .set(input)
            .where('id', '=', id)
            .execute();
    }

    async updateCurrentBranchId(userId: number, currentBranchId: number): Promise<any> {
        await db
            .updateTable('users')
            .set({ current_branch_id: currentBranchId })
            .where('id', '=', userId)
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