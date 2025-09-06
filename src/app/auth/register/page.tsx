"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase} from 'lucide-react';

const RegisterPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Rediriger vers l'étape 1 de l'inscription après un court délai
    const timer = setTimeout(() => {
      router.push('/auth/register/step1');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Logo et marque */}
          <div className="flex justify-center items-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-gray-900">CareerHub</span>
            </div>
          </div>
          
          {/* Indicateur de chargement */}
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
          
          <h2 className="text-xl font-medium text-gray-900 mb-2">
            Préparation de votre inscription
          </h2>
          <p className="text-sm text-gray-600">
            Redirection vers le formulaire d&apos;inscription...
          </p>
        </div>
      </div>
      
  
    </div>
  );
};

export default RegisterPage;