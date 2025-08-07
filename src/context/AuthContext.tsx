"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/apiClient';

interface User {
  id: number;
  id_role: number;
  name: string;
  email: string;
  profile_image: string;
  phone: string;
  active: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  role: {
    id: number;
    name: string;
    guard_name: string;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
  };
}

interface LoginResponse {
  status: string;
  message: string;
  user: User;
  access_token: string;
  token_type: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginByPhone: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshUser: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Define logout function early to avoid hoisting issues
  const logout = useCallback(async () => {
    try {
      if (token) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all cookies and state
      Cookies.remove("token");
      Cookies.remove("user");
      setToken(null);
      setUser(null);
      window.location.href = "/signin";
    }
  }, [token]);

  // Define refreshUser function before initializeAuth to avoid hoisting issues
  const refreshUser = useCallback(async () => {
    const storedToken = Cookies.get("token");
    if (!storedToken) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await authAPI.getUser();
      const userData = (response as { data: User }).data;
      let mergedUser = userData;
      // Nếu thiếu role, fallback từ cookie và log cảnh báo
      if (!userData.role || !userData.role.guard_name) {
        const storedUser = Cookies.get("user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed.role) {
              mergedUser = { ...userData, role: parsed.role };
              if (typeof window !== 'undefined') {
                console.warn('User API thiếu role, đã fallback từ cookie. Nên sửa backend trả về user kèm role.');
              }
            }
          } catch {}
        }
      }
      setUser(mergedUser);
      Cookies.set("user", JSON.stringify(mergedUser), { 
        expires: 1,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
    } catch (error) {
      console.error("Failed to refresh user:", error);
      // If the token is invalid, logout
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((error as any).message === 'Unauthorized') {
        await logout();
      }
    }
  }, [logout]);

  // Initialize CSRF cookie and check existing auth
  const initializeAuth = useCallback(async () => {
    try {
      // Initialize CSRF token
      await authAPI.initialize();

      // Check for existing authentication
      const storedToken = Cookies.get("token");
      const storedUser = Cookies.get("user");

      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
          
          // Verify token is still valid
          await refreshUser();
        } catch (error) {
          console.error("Error parsing stored user:", error);
          await logout();
        }
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
    } finally {
      setLoading(false);
    }
  }, [logout, refreshUser]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      console.log("Login API response:", response); // Debug log
      
      // Handle different response structures
      let data: LoginResponse;
      if (response && typeof response === 'object') {
        // If response has data property, use it
        if ('data' in response && response.data) {
          data = response.data as LoginResponse;
        } else {
          // If response is the data itself
          data = response as unknown as LoginResponse;
        }
      } else {
        throw new Error("Invalid response format");
      }

      console.log("Processed login data:", data); // Debug log

      if (data && data.status === "success") {
        // Lưu token vào cookie với security options
        Cookies.set("token", data.access_token, { 
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        // Lưu toàn bộ thông tin user vào cookie
        Cookies.set("user", JSON.stringify(data.user), { 
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        // Lưu toàn bộ thông tin user vào state
        setToken(data.access_token);
        setUser(data.user);

        if (data.user.role.guard_name === "manager" || data.user.role.guard_name === "staff") {
          window.location.href = "/";
        } else {
          throw new Error("Unauthorized access - Invalid role");
        }
      } else {
        throw new Error(data?.message || "Login failed - Invalid response");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const loginByPhone = async (phone: string, password: string) => {
    try {
      const response = await authAPI.loginByPhone(phone, password);
      console.log("LoginByPhone API response:", response); // Debug log
      
      // Handle different response structures
      let data: LoginResponse;
      if (response && typeof response === 'object') {
        // If response has data property, use it
        if ('data' in response && response.data) {
          data = response.data as LoginResponse;
        } else {
          // If response is the data itself
          data = response as unknown as LoginResponse;
        }
      } else {
        throw new Error("Invalid response format");
      }

      console.log("Processed loginByPhone data:", data); // Debug log

      if (data && data.status === "success") {
        // Lưu token vào cookie với security options
        Cookies.set("token", data.access_token, { 
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        // Lưu toàn bộ thông tin user vào cookie
        Cookies.set("user", JSON.stringify(data.user), { 
          expires: 1,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict'
        });

        // Lưu toàn bộ thông tin user vào state
        setToken(data.access_token);
        setUser(data.user);

        if (data.user.role.guard_name === "manager" || data.user.role.guard_name === "staff") {
          window.location.href = "/";
        } else {
          throw new Error("Unauthorized access - Invalid role");
        }
      } else {
        throw new Error(data?.message || "LoginByPhone failed - Invalid response");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginByPhone, logout, loading, refreshUser, initializeAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 