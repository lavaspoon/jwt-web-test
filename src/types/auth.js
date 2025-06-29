export const ROLE_TYPE = {
    ADMIN: 'ADMIN',
    USER: 'USER',
    GUEST: 'GUEST',
};

export class AuthRequest {
    constructor(id, username, name, roleName = ROLE_TYPE.USER) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.roleName = roleName;
    }
}

export class RefreshTokenRequest {
    constructor(refreshToken) {
        this.refreshToken = refreshToken;
    }
}

export class AuthResponse {
    constructor(accessToken, refreshToken, roleType) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.roleType = roleType;
    }
} 