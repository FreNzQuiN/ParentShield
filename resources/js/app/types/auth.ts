export interface User {
  id: number;
  name: string;
  email: string;
  has_api_key?: boolean;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface MeData {
  user: User;
}
