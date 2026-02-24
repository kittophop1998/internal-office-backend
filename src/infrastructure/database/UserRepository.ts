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

        const users = await query
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

        return users;
    }

    async findByUsername(username: string): Promise<any | null> { 
        const user = await db
            .selectFrom('users')
            .innerJoin('roles', 'users.role_id', 'roles.id')
            .innerJoin('departments', 'users.department_id', 'departments.id')
            .leftJoin('branches', 'users.branch_id', 'branches.id')
            .select([
                'users.id as id',
                'users.username as username',
                'users.password_hash as passwordHash',
                'users.full_name as fullName',
                'users.email as email',
                'users.department_id as departmentId',
                'users.role_id as roleId',
                'users.branch_id as branchId',
                'roles.code as roleCode',
                'roles.name as roleName',
                'departments.name as departmentName',
                'branches.name as branchName',
                'branches.location as branchLocation',
            ])
            .where('username', '=', username)
            .executeTakeFirst();

        return user || null;
    }

    async findById(id: number): Promise<any | null> {
        const user = await db
            .selectFrom('users')
            .innerJoin('roles', 'users.role_id', 'roles.id')
            .innerJoin('departments', 'users.department_id', 'departments.id')
            .leftJoin('branches', 'users.branch_id', 'branches.id')
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
                'departments.name as departmentName',
                'branches.name as branchName',
                'branches.location as branchLocation',
            ])
            .where('users.id', '=', id)
            .executeTakeFirst();

        return user || null;
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