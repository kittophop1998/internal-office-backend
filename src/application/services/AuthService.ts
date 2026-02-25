import { loginErp } from "../../infrastructure/api/utils/3rd";
import { JWTService } from "../../infrastructure/api/utils/JWTService";
import { PasswordService } from "../../infrastructure/api/utils/PasswordService";
import { IUserRepository } from "../repositories/userRepo";

export class AuthService {
    constructor(
        private userRepository: IUserRepository
    ) { }

    async login(credentials: {
        username: string;
        password: string;
    }): Promise<any> {
        const username = credentials.username.trim();
        const password = credentials.password.trim();

        let user = await this.userRepository.findByUsername(username);
        if (!user) {
            const erpUser = await loginErp(username, password);
            if (!erpUser) {
                throw new Error('Invalid username or password');
            }

            // ##### Create new user in local database #####
            const hashedPassword = await PasswordService.hashPassword(password);
            const newUser = {
                username: erpUser.username,
                password_hash: hashedPassword,
                full_name: `${erpUser.name} ${erpUser.surname}`,
                email: `${erpUser.username}@changsiamthailand.com`,
                department_id: 1,
                role_id: 1,
            };
            await this.userRepository.create(newUser);
            // ##############################################

            user = await this.userRepository.findByUsername(username);
            if (!user) {
                throw new Error('User creation failed');
            }
        } else {
            const isPasswordValid = await PasswordService.comparePassword(password, user.passwordHash);
            if (!isPasswordValid) {
                throw new Error('Invalid username or password');
            }
        }
        
        const token = JWTService.generateToken({
            id: user.id,
            username: user.username,
            full_name: user.fullname,
            email: user.email,
            department_id: user.departmentId,
        });

        return {
            user: {
                id: user.id,
                username: user.username,
                fullName: user.fullName,
                roleId: user.roleId,
                roleCode: user.roleCode,
                roleName: user.roleName,
                positionName: user.positionTitle,
                branch: user.branchId ? user.branchId.toString() : null,
                branchName: user.branchName || null,
                branchLocation: user.branchLocation || null,
                department: user.departmentId.toString(),
            },
            accessToken: token,
        };
    }
}