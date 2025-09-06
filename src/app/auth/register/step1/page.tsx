"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Eye, EyeOff, Briefcase, Github, Linkedin } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import Image from 'next/image';

const RegisterStep1Page = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string[] }>({});

  const { registerStep1 } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: []
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFieldErrors({});

    // Basic validation
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      setIsLoading(false);
      return;
    }

    const result = await registerStep1(formData);

    if (result.success) {
      router.push(`/auth/register/step2?email=${formData.email}`);
    } else {
      if (result.errors) {
        setFieldErrors(result.errors);
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="h-screen w-full bg-white flex">
      {/* Section gauche avec image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-50">
        <div className="absolute inset-0 flex items-center justify-center ">
          <div className="relative w-full h-full w-full">
            <Image
              src="/register-illustration.svg" // Remplacez par le chemin de votre image
              alt="Registration illustration"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
       
       
      </div>

      {/* Section droite avec formulaire */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-md py-8">
          <div className="text-center mb-10">
          
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Join Concept
            </h1>
            <p className="text-gray-600 text-sm mb-4">
              Step 1 of 3: Basic Information
            </p>
            <p className="text-xs text-gray-600">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-gray-900 hover:text-gray-700 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="bg-white rounded-lg">
            <form className="space-y-5 text-gray-700" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                    First name
                  </label>
                  <div className="relative">
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2.5 border border-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-sm"
                      placeholder="John"
                    />
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                  {fieldErrors.first_name && fieldErrors.first_name.map((err, idx) => (
                    <p key={idx} className="text-red-600 text-xs mt-1">{err}</p>
                  ))}
                </div>

                <div>
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                    Last name
                  </label>
                  <div className="relative">
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      autoComplete="family-name"
                      required
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="block w-full px-3 py-2.5 border border-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-sm"
                      placeholder="Doe"
                    />
                    <User className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                  {fieldErrors.last_name && fieldErrors.last_name.map((err, idx) => (
                    <p key={idx} className="text-red-600 text-xs mt-1">{err}</p>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-colors text-sm"
                    placeholder="john.doe@example.com"
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
                {fieldErrors.email && fieldErrors.email.map((err, idx) => (
                  <p key={idx} className="text-red-600 text-xs mt-1">{err}</p>
                ))}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 pr-10 transition-colors text-sm"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && fieldErrors.password.map((err, idx) => (
                  <p key={idx} className="text-red-600 text-xs mt-1">{err}</p>
                ))}
                <p className="mt-2 text-xs text-gray-500">
                  Password must be at least 8 characters long
                </p>
              </div>

              <div>
                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 pr-10 transition-colors text-sm"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password_confirmation && fieldErrors.password_confirmation.map((err, idx) => (
                  <p key={idx} className="text-red-600 text-xs mt-1">{err}</p>
                ))}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-2"></div>
                      Creating account...
                    </div>
                  ) : (
                    'Continue to email verification'
                  )}
                </button>
              </div>
            </form>
{/* 
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-600">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="font-medium text-gray-900 hover:text-gray-700 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium text-gray-900 hover:text-gray-700 transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStep1Page;