"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

export type UserRole = "admin" | "adminstaff" | "user";

export interface UserProfile {
  id: number | null;
  user_id: number | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  is_active: boolean;
  deleted_at: string | null;
  created_at?: string;
  profile?: UserProfile | null;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  role?: UserRole;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAdminStaff: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<User | null>;
  updateAuthState: (userData: User, authToken: string) => void;
  deactivateOwnAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const USER_STORAGE_KEY = "authUser";
const TOKEN_STORAGE_KEY = "authToken";

const USER_SESSION_KEY = "sessionAuthUser";
const TOKEN_SESSION_KEY = "sessionAuthToken";

const LEGACY_USER_KEY = "user";
const LEGACY_TOKEN_KEY = "token";
const LEGACY_MOCK_USER_KEY = "mockUser";

function isPrivilegedRole(role?: UserRole) {
  return role === "admin" || role === "adminstaff";
}

function clearBrowserAuthStorage() {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_MOCK_USER_KEY);

  sessionStorage.removeItem(USER_SESSION_KEY);
  sessionStorage.removeItem(TOKEN_SESSION_KEY);
  sessionStorage.removeItem(LEGACY_USER_KEY);
  sessionStorage.removeItem(LEGACY_TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_MOCK_USER_KEY);
}

function getStoredAuth() {
  const sessionUser = sessionStorage.getItem(USER_SESSION_KEY);
  const sessionToken = sessionStorage.getItem(TOKEN_SESSION_KEY);

  if (sessionUser && sessionToken) {
    try {
      return {
        user: JSON.parse(sessionUser) as User,
        token: sessionToken,
      };
    } catch {
      sessionStorage.removeItem(USER_SESSION_KEY);
      sessionStorage.removeItem(TOKEN_SESSION_KEY);
    }
  }

  const localUser = localStorage.getItem(USER_STORAGE_KEY);
  const localToken = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (localUser && localToken) {
    try {
      return {
        user: JSON.parse(localUser) as User,
        token: localToken,
      };
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }

  return null;
}

function persistAuthByRole(userData: User, authToken: string) {
  clearBrowserAuthStorage();

  if (isPrivilegedRole(userData.role)) {
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(userData));
    sessionStorage.setItem(TOKEN_SESSION_KEY, authToken);
    return;
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  localStorage.setItem(TOKEN_STORAGE_KEY, authToken);
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    clearBrowserAuthStorage();
  }, []);

  const persistAuth = useCallback((userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    persistAuthByRole(userData, authToken);
  }, []);

  const updateAuthState = useCallback(
    (userData: User, authToken: string) => {
      persistAuth(userData, authToken);
    },
    [persistAuth]
  );

  useEffect(() => {
    const storedAuth = getStoredAuth();

    if (storedAuth) {
      setUser(storedAuth.user);
      setToken(storedAuth.token);
    } else {
      clearBrowserAuthStorage();
    }

    setIsLoading(false);
  }, []);

  const handleAuthResponse = useCallback(
    (data: AuthResponse) => {
      if (!data.user) {
        throw new Error("Authentication failed");
      }

      if (!data.user.is_active) {
        throw new Error("This account has been deactivated");
      }

      persistAuth(data.user, data.token);

      return data.user;
    },
    [persistAuth]
  );

  const login = useCallback(
    async (payload: LoginPayload): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to login");
      }

      return handleAuthResponse(data);
    },
    [handleAuthResponse]
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          role: payload.role || "user",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to register");
      }

      return handleAuthResponse(data);
    },
    [handleAuthResponse]
  );

  const loginWithGoogle = useCallback(
    async (idToken: string): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_token: idToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to login with Google");
      }

      return handleAuthResponse(data);
    },
    [handleAuthResponse]
  );

  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    const storedAuth = getStoredAuth();
    const savedToken = token || storedAuth?.token || null;

    if (!savedToken) {
      clearAuth();
      return null;
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${savedToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      clearAuth();
      throw new Error(data.message || "Failed to fetch current user");
    }

    if (!data.user) {
      clearAuth();
      throw new Error("Failed to fetch current user");
    }

    if (!data.user.is_active) {
      clearAuth();
      throw new Error("This account has been deactivated");
    }

    setUser(data.user);
    setToken(savedToken);
    persistAuthByRole(data.user, savedToken);

    return data.user as User;
  }, [token, clearAuth]);

  const logout = useCallback(async () => {
    const storedAuth = getStoredAuth();
    const savedToken = token || storedAuth?.token || null;

    try {
      if (savedToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      clearAuth();
    }
  }, [token, clearAuth]);

  const deactivateOwnAccount = useCallback(async () => {
    const storedAuth = getStoredAuth();
    const savedToken = token || storedAuth?.token || null;

    if (!savedToken) {
      throw new Error("No token provided");
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${savedToken}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to deactivate account");
    }

    clearAuth();
  }, [token, clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token && !!user.is_active,
        isAdmin: user?.role === "admin",
        isAdminStaff: user?.role === "adminstaff",
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        fetchCurrentUser,
        updateAuthState,
        deactivateOwnAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};