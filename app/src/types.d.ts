export interface User {
  id: number;
  username: string;
  password_hash: string;
  crated_at: Date;
}

declare module 'express-session' {
  interface SessionData {
    user: User;
  }
}
