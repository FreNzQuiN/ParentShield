export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface MeData {
  user: User;
}
