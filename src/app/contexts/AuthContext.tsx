"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Education {
  degree: string;
  institution: string;
  year: number;
}

interface Certification {
  name: string;
  issuer: string;
  year: number;
}

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  name: string;
  registration_step: string;
  birth_date?: string;
  phone?: string;
  location?: string;
  bio?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  current_position?: string;
  current_company?: string;
  years_experience?: number;
  skills?: string[];
  languages?: string[];
  education?: Education[];
  certifications?: Certification[];
  profile?: Record<string, unknown>;
}

interface RegisterStep1Data {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  errors?: { [key: string]: string[] };
  data?: T;
}

interface RegisterStep1Response extends ApiResponse {
  data?: {
    user: User;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  registerStep1: (data: RegisterStep1Data) => Promise<RegisterStep1Response>;
  verifyEmail: (email: string, code: string) => Promise<ApiResponse>;
  completeProfile: (data: Record<string, unknown>) => Promise<ApiResponse>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    refreshUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApiResponse = async (response: Response) => {
    console.log('=== Server Response Details ===');
    console.log('Status:', response.status, response.statusText);
    console.log('URL:', response.url);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    const contentType = response.headers.get('content-type');
    let data;

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
        console.log('Response Body (JSON):', JSON.stringify(data, null, 2));
      } else {
        const textData = await response.text();
        console.log('Response Body (Text):', textData);
        data = { message: textData };
      }
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw new Error(`Failed to parse response: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }

    if (!response.ok) {
      const errorMessage = data.message ||
                          (data.errors && Object.values(data.errors).flat().join(', ')) ||
                          (data.error) ||
                          `HTTP error! status: ${response.status}`;
      console.error('Server Error Response:', {
        status: response.status,
        statusText: response.statusText,
        errorMessage,
        fullData: data
      });
      throw new Error(errorMessage);
    }

    console.log('Successful Response Processed');
    return data;
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await handleApiResponse(response);

      if (data.success) {
        if (data.data?.user) {
          setUser(data.data.user);
        } else if (data.user) {
          setUser(data.user);
        } else {
          await refreshUser();
        }
      } else {
        throw new Error(data.message || data.error || 'Login failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('Login error:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        await handleApiResponse(response);
      }

      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const registerStep1 = async (data: RegisterStep1Data): Promise<RegisterStep1Response> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register/step1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await handleApiResponse(response);
      
      return {
        success: true,
        ...result
      };
    } catch (error: unknown) {
      console.error('Register step1 error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      return {
        success: false,
        message: errorMessage,
        errors: { general: [errorMessage] }
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string): Promise<ApiResponse> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register/step2/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const result = await handleApiResponse(response);

      if (result.success || result.message?.includes('verified')) {
        await refreshUser();
      }

      return result;
    } catch (error: unknown) {
      console.error('Verify email error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      return {
        success: false,
        message: errorMessage,
        errors: { general: [errorMessage] }
      };
    } finally {
      setIsLoading(false);
    }
  };

  const completeProfile = async (data: Record<string, unknown>): Promise<ApiResponse> => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register/step3/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await handleApiResponse(response);
      
      if (result.success && result.data?.user) {
        setUser(result.data.user);
      }
      
      return result;
    } catch (error: unknown) {
      console.error('Complete profile error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Profile completion failed';
      return {
        success: false,
        message: errorMessage,
        errors: { general: [errorMessage] }
      };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/user');
      
      if (response.ok) {
        const data = await handleApiResponse(response);
        if (data.success && data.data) {
          setUser(data.data);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    registerStep1,
    verifyEmail,
    completeProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};