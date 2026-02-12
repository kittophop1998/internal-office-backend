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
            .innerJoin('positions', 'users.position_id', 'positions.id')
            .innerJoin('departments', 'users.department_id', 'departments.id')
            .leftJoin('branches', 'users.branch_id', 'branches.id')
            .select([
                'users.id as id',
                'users.username as username',
                'users.full_name as full_name',
                'users.email as email',
                'users.department_id as department_id',
                'users.position_id as position_id',
                'users.role as role',
                'users.branch_id as branch_id',
                'positions.code as position_code',
                'positions.title as position_title',
                'departments.name as department_name',
                'branches.name as branch_name',
                'branches.location as branch_location',
            ]);

        if (filters.department_id) {
            query = query.where('users.department_id', '=', Number(filters.department_id));
        }

        const users = await query.execute();
        return users;
    }

    async findByUsername(username: string): Promise<any | null> { 
        const user = await db
            .selectFrom('users')
            .innerJoin('positions', 'users.position_id', 'positions.id')
            .innerJoin('departments', 'users.department_id', 'departments.id')
            .leftJoin('branches', 'users.branch_id', 'branches.id')
            .select([
                'users.id as id',
                'users.username as username',
                'users.password_hash as password_hash',
                'users.full_name as full_name',
                'users.email as email',
                'users.department_id as department_id',
                'users.position_id as position_id',
                'users.role as role',
                'users.branch_id as branch_id',
                'positions.code as position_code',
                'positions.title as position_title',
                'departments.name as department_name',
                'branches.name as branch_name',
                'branches.location as branch_location',
            ])
            .where('username', '=', username)
            .executeTakeFirst();

        return user || null;
    }

    async findById(id: number): Promise<any | null> {
        const user = await db
            .selectFrom('users')
            .innerJoin('positions', 'users.position_id', 'positions.id')
            .innerJoin('departments', 'users.department_id', 'departments.id')
            .leftJoin('branches', 'users.branch_id', 'branches.id')
            .select([
                'users.id as id',
                'users.username as username',
                'users.full_name as full_name',
                'users.email as email',
                'users.department_id as department_id',
                'users.position_id as position_id',
                'users.branch_id as branch_id',
                'positions.code as position_code',
                'positions.title as position_title',
                'departments.name as department_name',
                'branches.name as branch_name',
                'branches.location as branch_location',
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