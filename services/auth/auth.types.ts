export interface AuthSession {
  uid: string;
  email: string;
  displayName?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterInput extends AuthCredentials {
  displayName: string;
}

export interface AuthRepository {
  login(credentials: AuthCredentials): Promise<AuthSession>;
  register(input: RegisterInput): Promise<AuthSession>;
  logout(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
}
