export interface User { id: number; username: string; }
export interface AuthResponse { accessToken: string; user: User; }
export interface DriveFile { id: string; name: string; size: number; mimeType: string; createdAt: string; updatedAt: string; }
