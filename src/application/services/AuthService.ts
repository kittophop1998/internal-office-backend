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
                position_id: 1,
                role: 'STAFF',
            };
            await this.userRepository.create(newUser);
            // ##############################################

            user = await this.userRepository.findByUsername(username);
            if (!user) {
                throw new Error('User creation failed');
            }
        } else {
            const isPasswordValid = await PasswordService.comparePassword(password, user.password_hash);
            if (!isPasswordValid) {
                throw new Error('Invalid username or password');
            }
        }
        
        const token = JWTService.generateToken({
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            email: user.email,
            department_id: user.department_id,
        });

        return {
            user: {
                id: user.id.toString(),
                username: user.username,
                fullname: user.full_name,
                role: user.role,
                position: user.position_id.toString(),
                positionName: user.position_title,
                branch: user.branch_id ? user.branch_id.toString() : null,
                branchName: user.branch_name || null,
                branchLocation: user.branch_location || null,
                department: user.department_id.toString(),
            },
            accessToken: token,
        };
    }
}