export type UserRole = "admin" | "student";

export type JwtUserPayload = {
  sub: string;
  role: UserRole;
  email: string;
  name: string;
};

