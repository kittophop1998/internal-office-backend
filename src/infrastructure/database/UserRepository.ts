import { IUserRepository } from "../../application/repositories/userRepo";
import { db } from "./maria";

export class UserRepository implements IUserRepository {
    async create(user: any): Promise<any> {
            await db
                .insertInto('users')
                .values(user)
                .execute();
    }

    async findAll(filters: any): Promise<any[]> {
        let query = db
            .selectFrom('users')
            .innerJoin('roles', 'users.role_id', 'roles.id')
            .innerJoin('departments', 'users.department_id', 'departments.id')
            .leftJoin('branches', 'users.branch_id', 'branches.id')
            .select([
                'users.id as id',
                'users.username as username',
                'users.full_name as fullname',
                'users.email as email',
                'users.department_id as departmentId',
                'users.role_id as roleId',
                'roles.name as roleName',
                'departments.name as departmentName',
                'branches.name as branchName',
                'branches.location as branchLocation'
            ]);

        if (filters.departmentId) {
            query = query.where('users.department_id', '=', Number(filters.departmentId));
        }

        const users = await query.execute();
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
            .where('id', '=', id)
            .executeTakeFirst();

        return user || null;
    }

    async update(user: any): Promise<any> {
        await db
            .updateTable('users')
            .set(user)
            .where('id', '=', user.id)
            .execute();
    }
}