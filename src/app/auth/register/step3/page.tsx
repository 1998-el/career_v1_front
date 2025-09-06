"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, MapPin, Phone, Calendar, Briefcase, GraduationCap, Award, Plus, X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

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

const RegisterStep3Page = () => {
  const [currentStep, setCurrentStep] = useState<'personal' | 'professional'>('personal');
  const [personalValidated, setPersonalValidated] = useState(false);

  const [formData, setFormData] = useState({
    birth_date: '',
    phone: '',
    location: '',
    bio: '',
    linkedin_url: '',
    portfolio_url: '',
    current_position: '',
    current_company: '',
    years_experience: '',
    skills: [] as string[],
    languages: [] as string[],
    education: [] as Education[],
    certifications: [] as Certification[],
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [personalErrors, setPersonalErrors] = useState<{[key: string]: string}>({});

  const { completeProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const userIdFromParams = searchParams.get('user_id');
    if (userIdFromParams) {
      setUserId(userIdFromParams);
    } else {
      router.push('/auth/register/step1');
    }
  }, [searchParams, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (personalErrors[name]) {
      setPersonalErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validatePersonalInfo = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.birth_date) {
      errors.birth_date = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.birth_date);
      const today = new Date();
      if (birthDate >= today) {
        errors.birth_date = 'Date of birth must be in the past';
      }
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (formData.phone.length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    }

    if (!formData.location) {
      errors.location = 'Location is required';
    }

    if (!formData.bio) {
      errors.bio = 'Bio is required';
    } else if (formData.bio.length < 50) {
      errors.bio = 'Bio must be at least 50 characters';
    }

    setPersonalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueToProfessional = () => {
    if (validatePersonalInfo()) {
      setPersonalValidated(true);
      setCurrentStep('professional');
    }
  };

  const handleBackToPersonal = () => {
    setCurrentStep('personal');
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addLanguage = () => {
    if (currentLanguage.trim() && !formData.languages.includes(currentLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, currentLanguage.trim()]
      }));
      setCurrentLanguage('');
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang !== languageToRemove)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', institution: '', year: new Date().getFullYear() }]
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuer: '', year: new Date().getFullYear() }]
    }));
  };

  const updateCertification = (index: number, field: keyof Certification, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) =>
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!userId) {
      setError('User session expired. Please start registration again.');
      setIsLoading(false);
      return;
    }

    try {
      const submitData = {
        user_id: parseInt(userId),
        ...formData,
        years_experience: formData.years_experience ? parseInt(formData.years_experience) : null,
        education: formData.education.filter(edu => edu.degree && edu.institution),
        certifications: formData.certifications.filter(cert => cert.name && cert.issuer),
      };

      await completeProfile(submitData);
      setSuccess('Profile completed successfully! Redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError((err as Error).message || 'Profile completion failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return ( 
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 w-full text-gray-700">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center">
              {/* Progress Steps */}
              <div className="flex items-center">
                <div className={`flex flex-col items-center ${currentStep === 'personal' ? 'text-blue-600' : 'text-gray-900'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 ${currentStep === 'personal' ? 'border-blue-600 bg-white' : personalValidated ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-white'}`}>
                    {personalValidated ? <Check className="h-5 w-5 text-green-500" /> : '1'}
                  </div>
                  <span className="text-xs mt-2 font-medium">Personal</span>
                </div>
                <div className={`w-16 h-1 mx-2 ${personalValidated ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <div className={`flex flex-col items-center ${currentStep === 'professional' ? 'text-blue-600' : personalValidated ? 'text-gray-900' : 'text-gray-400'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 ${currentStep === 'professional' ? 'border-blue-600 bg-white' : personalValidated ? 'border-gray-300 bg-white' : 'border-gray-300 bg-gray-100'}`}>
                    2
                  </div>
                  <span className="text-xs mt-2 font-medium">Professional</span>
                </div>
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Complete your profile
          </h1>
          <p className="text-gray-600 text-sm">
            Step 3 of 3: {currentStep === 'personal' ? 'Personal Information' : 'Professional Information'}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {success && (
            <div className="bg-green-50 border-b border-green-200 text-green-700 px-6 py-4 text-sm">
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-b border-red-200 text-red-700 px-6 py-4 text-sm">
              {error}
            </div>
          )}

          {currentStep === 'personal' ? (
            <div className="px-6 py-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2 text-gray-500" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="birth_date"
                      name="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        personalErrors.birth_date ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                  {personalErrors.birth_date && (
                    <p className="mt-1 text-xs text-red-600">{personalErrors.birth_date}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        personalErrors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                    <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                  {personalErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">{personalErrors.phone}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        personalErrors.location ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="City, Country"
                    />
                    <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  </div>
                  {personalErrors.location && (
                    <p className="mt-1 text-xs text-red-600">{personalErrors.location}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Bio <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      value={formData.bio}
                      onChange={handleInputChange}
                      className={`block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                        personalErrors.bio ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Tell us about yourself... (minimum 50 characters)"
                    />
                  </div>
                  {personalErrors.bio && (
                    <p className="mt-1 text-xs text-red-600">{personalErrors.bio}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.bio.length}/50 characters minimum
                  </p>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={handleContinueToProfessional}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Continue to Professional
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
              {/* Professional Links */}
              <div className="px-6 py-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Links</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1">
                      LinkedIn URL
                    </label>
                    <div className="mt-1">
                      <input
                        id="linkedin_url"
                        name="linkedin_url"
                        type="url"
                        value={formData.linkedin_url}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="portfolio_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Portfolio URL
                    </label>
                    <div className="mt-1">
                      <input
                        id="portfolio_url"
                        name="portfolio_url"
                        type="url"
                        value={formData.portfolio_url}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="https://yourportfolio.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Position */}
              <div className="px-6 py-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="h-5 w-5 mr-2 text-gray-500" />
                  Current Position
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label htmlFor="current_position" className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <div className="mt-1">
                      <input
                        id="current_position"
                        name="current_position"
                        type="text"
                        value={formData.current_position}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Software Engineer"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="years_experience" className="block text-sm font-medium text-gray-700 mb-1">
                      Years of Experience
                    </label>
                    <div className="mt-1">
                      <input
                        id="years_experience"
                        name="years_experience"
                        type="number"
                        min="0"
                        max="50"
                        value={formData.years_experience}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="current_company" className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <div className="mt-1">
                      <input
                        id="current_company"
                        name="current_company"
                        type="text"
                        value={formData.current_company}
                        onChange={handleInputChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Company Name"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="px-6 py-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1.5 rounded-full flex-shrink-0 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Add a skill..."
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Languages */}
              <div className="px-6 py-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.languages.map((language, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {language}
                      <button
                        type="button"
                        onClick={() => removeLanguage(language)}
                        className="ml-1.5 rounded-full flex-shrink-0 text-green-600 hover:text-green-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentLanguage}
                    onChange={(e) => setCurrentLanguage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                    className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Add a language..."
                  />
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Education */}
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2 text-gray-500" />
                    Education
                  </h3>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Education
                  </button>
                </div>
                {formData.education.map((edu, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Education #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeEducation(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Degree
                        </label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Bachelor of Science in Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year
                        </label>
                        <input
                          type="number"
                          min="1900"
                          max={new Date().getFullYear()}
                          value={edu.year}
                          onChange={(e) => updateEducation(index, 'year', parseInt(e.target.value))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Institution
                        </label>
                        <input
                          type="text"
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="University Name"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Certifications */}
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-gray-500" />
                    Certifications
                  </h3>
                  <button
                    type="button"
                    onClick={addCertification}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Certification
                  </button>
                </div>
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4 mb-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Certification #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Certification Name
                        </label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => updateCertification(index, 'name', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="AWS Certified Solutions Architect"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Year
                        </label>
                        <input
                          type="number"
                          min="1900"
                          max={new Date().getFullYear()}
                          value={cert.year}
                          onChange={(e) => updateCertification(index, 'year', parseInt(e.target.value))}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Issuing Organization
                        </label>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Amazon Web Services"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="px-6 py-6 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBackToPersonal}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Personal
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Completing Profile...
                      </>
                    ) : (
                      'Complete Profile'
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterStep3Page;