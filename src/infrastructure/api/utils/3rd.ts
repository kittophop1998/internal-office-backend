export interface ErpLoginUserDetail {
    id: string;
    username: string;
    position: string;
    name: string;
    surname: string;
    branch_name: string;
}

export interface ErpLoginResponse {
    success: string;
    msg: string;
    user: ErpLoginUserDetail;
}

export const loginErp = async (username: string, password: string): Promise<ErpLoginUserDetail | null> => {
    const response = await fetch('https://dev.changsiamthailand.com/api/login_internal_office', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json() as ErpLoginResponse;
    return {
        id: data.user.id,
        username: data.user.username,
        position: data.user.position,
        name: data.user.name,
        surname: data.user.surname,
        branch_name: data.user.branch_name,
    };
};