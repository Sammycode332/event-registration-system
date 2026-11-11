import { createContext,useState,useContext,useEffect} from "react";
import type{ReactNode} from "react"

import type { User } from "../types/auth";


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login:(email: string,password:string)=>Promise<void>
  logout:()=>Promise<void>
  register: (
  name: string,
  email: string,
  password: string
) => Promise<{ requiresEmailVerification: boolean }>;
resendVerificationEmail: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType |null>(null)
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  sessionStorage.setItem("access_token", data.access_token);
  sessionStorage.setItem("refresh_token", data.refresh_token);

  const profileResponse = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
      },
    }
  );

  if (!profileResponse.ok) {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");

    throw new Error("Unable to retrieve your user profile");
  }

  const profileData: { user: User } = await profileResponse.json();

  setUser(profileData.user);
};
const register = async (
  name: string,
  email: string,
  password: string
): Promise<{ requiresEmailVerification: boolean }> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return {
    requiresEmailVerification: data.requiresEmailVerification,
  };
};
const resendVerificationEmail = async (email: string): Promise<void> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/resend-verification`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to resend verification email");
  }
};
const logout = async (): Promise<void> => {
  const accessToken = sessionStorage.getItem("access_token");

  try {
    if (accessToken) {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/logout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Backend logout failed:", response.status);
      }
    }
  } catch (error) {
    console.error("Logout request failed:", error);
  } finally {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    setUser(null);
  }
};
  useEffect(() => {
  let isMounted = true;

  const restoreSession = async () => {
    const accessToken = sessionStorage.getItem("access_token");

    if (!accessToken) {
      if (isMounted) setIsLoading(false);
      return;
    }

    try {
let response = await fetch(
  `${import.meta.env.VITE_API_URL}/auth/me`,
  {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  }
);

if (response.status === 401) {
  const refreshToken = sessionStorage.getItem("refresh_token");

  if (!refreshToken) {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    return;
  }

  const refreshResponse = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/refresh`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    }
  );

  if (!refreshResponse.ok) {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    return;
  }

  const tokens: {
    access_token: string;
    refresh_token: string;
  } = await refreshResponse.json();

  sessionStorage.setItem("access_token", tokens.access_token);
  sessionStorage.setItem("refresh_token", tokens.refresh_token);

  response = await fetch(
    `${import.meta.env.VITE_API_URL}/auth/me`,
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    }
  );
}

if (!response.ok) {
  if (response.status === 401) {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
  }

  if (isMounted) setUser(null);
  return;
}

const data: { user: User } = await response.json();

if (isMounted) {
  setUser(data.user);
}
    } catch (error) {
      console.error("Session restoration failed:", error);
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  restoreSession();

  return () => {
    isMounted = false;
  };
}, []);
  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};