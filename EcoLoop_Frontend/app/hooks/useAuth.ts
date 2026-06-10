import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import { Profile } from "../types";

export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await authService.getUser();
        setUser(currentUser as any);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      setUser(data.user as any);
      return data.user;
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(email, password, fullName);
      setUser(data.user as any);
      return data.user;
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message || "Error al cerrar sesión");
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };
}
export default useAuth;
