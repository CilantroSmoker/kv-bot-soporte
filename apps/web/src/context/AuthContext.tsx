import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

interface User {
  id: string;
  discordId: string;
  discordUsername?: string | null;
  minecraftUsername?: string | null;
  minecraftUuid?: string | null;
  email?: string | null;
}

interface AuthContextType {
  sessionToken: string | null;
  user: User | null;
  loading: boolean;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    window.__sessionToken = undefined;
    setSessionToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const data = await apiFetch('/shop/me');
      setUser(data);
    } catch (e) {
      logout();
    }
  };

useEffect(() => {
  console.log("=== AuthContext montado ===");
  console.log("URL:", window.location.href);
  console.log("Search:", window.location.search);

  const handleAuth = async () => {
    console.log("handleAuth iniciado");

    const devMode = import.meta.env.VITE_DEV_MODE === 'true';
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');

    console.log("Token encontrado:", urlToken);

    if (urlToken) {
      try {
        console.log("Llamando a /shop/login...");

        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(`${API_BASE_URL}/shop/login?token=${urlToken}`);

        console.log("Status:", res.status);

        if (!res.ok) throw new Error("Token inválido o expirado");

        const data = await res.json();
        console.log("Respuesta:", data);

        window.__sessionToken = data.sessionToken;
localStorage.setItem('sessionToken', data.sessionToken);
setSessionToken(data.sessionToken);

        const user = devMode
  ? { 
      ...data.user, 
      minecraftUuid: import.meta.env.VITE_DEV_UUID 
    }
  : data.user;

setUser(user);

await refreshUser();

        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (error) {
        console.error("Error en login automático:", error);
      }
    }

    setLoading(false);
  };

  handleAuth();
}, []);

  return (
    <AuthContext.Provider value={{ sessionToken, user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de un AuthProvider');
  return context;
};

declare global {
  interface Window {
    __sessionToken?: string;
  }
}
