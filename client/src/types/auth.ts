export type UserRole = "user" | "organizer" | "admin";

export interface User {
  id: number;
  auth_user_id: string;
  name: string;
  email: string;
  role: UserRole;
}