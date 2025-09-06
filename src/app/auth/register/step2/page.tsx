"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

interface VerifyEmailResult {
  message: string;
  user?: {
    id: number;
  };
}

const RegisterStep2Page = () => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');

  const { verifyEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailFromParams = searchParams.get('email');

    if (emailFromParams) {
      setEmail(emailFromParams);
    } else {
      router.push('/auth/register/step1');
    }
  }, [searchParams, router]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setCode(value);
      if (error) setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (code.length !== 6) {
      setError('Please enter a 6-digit verification code');
      setIsLoading(false);
      return;
    }

    try {
      const result = await verifyEmail(email, code) as VerifyEmailResult;
      if (result.user?.id) {
        setSuccess('Email verified successfully! Redirecting...');
        setTimeout(() => {
          router.push(`/auth/register/step3?user_id=${result.user!.id}`);
        }, 2000);
      } else {
        setError(result.message || 'Verification failed. User data not found.');
      }
    } catch (error) {
      setError((error as Error).message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      setSuccess('Verification code resent! Please check your email.');
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex w-full">
  

      {/* Section droite avec formulaire */}
      <div className="w-full m-auto flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-24 text-gray-700">
        <div className="mx-auto w-full max-w-md">
          <div className="text-center mb-10">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-6">
              <Mail className="h-5 w-5 text-gray-900" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verify your email
            </h1>
            <p className="text-gray-600 text-sm mb-4">
              Step 2 of 3: Email Verification
            </p>
            <p className="text-xs text-gray-600">
              We&apos;ve sent a verification code to{' '}
              <span className="font-medium text-gray-900">{email}</span>
            </p>
          </div>

          <div className="bg-white rounded-lg">
            {success && (
              <div className="bg-green-50 border border-green-100 text-green-700 px-4 py-3 rounded-md text-sm mb-6">
                {success}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-700 px-4 py-3 rounded-md text-sm mb-6">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 text-center mb-2">
                  Enter verification code
                </label>
                <div className="mt-1">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    required
                    value={code}
                    onChange={handleCodeChange}
                    className="block w-full px-4 py-3 border border-gray-200 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-center text-xl tracking-widest transition-colors"
                    placeholder="000000"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify email'
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-600">
                Didn&apos;t receive the code?{' '}
                <button
                  onClick={handleResendCode}
                  disabled={isResending}
                  className="font-medium text-gray-900 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto transition-colors"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    'Resend code'
                  )}
                </button>
              </p>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/auth/register/step1"
                className="text-xs text-gray-600 hover:text-gray-900 font-medium transition-colors inline-flex items-center"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Back to previous step
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStep2Page;