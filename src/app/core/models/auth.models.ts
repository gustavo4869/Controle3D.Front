// Authentication Request/Response Models

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    userId: string;
    email: string;
    tenantId: string;
    tenantName: string;
    role: string;
}

export interface User {
    id: string;
    email: string;
    tenantId: string;
    tenantName: string;
    role: string;
    name?: string; // Optional if not provided in login response
}

export interface AuthError {
    message: string;
    statusCode?: number;
}
