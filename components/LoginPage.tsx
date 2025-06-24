import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SupabaseClient } from '@supabase/supabase-js';
import { AlertTriangleIcon, AtSymbolIcon, LockClosedIcon, UserIcon } from './icons';
import InputWithIcon from './InputWithIcon'; // Import the new component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

interface LoginPageProps {
  supabaseClient: SupabaseClient;
}

const LoginPage: React.FC<LoginPageProps> = ({ supabaseClient }) => {
  const { t } = useTranslation();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  const handleAuthAction = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (isRegisterMode) {
      if (password !== confirmPassword) {
        setError(t('loginPage.errors.passwordsDoNotMatch'));
        setIsLoading(false);
        return;
      }
      if (!name.trim()) {
        setError(t('loginPage.errors.nameRequired'));
        setIsLoading(false);
        return;
      }

      const { data, error: signUpError } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: { 
            name: name.trim(),
            role: 'user', // Default role
          }
        }
      });

      if (signUpError) {
        setError(signUpError.message);
      } else if (data.user && data.user.identities && data.user.identities.length === 0) {
        setError(t('loginPage.errors.emailTaken'));
      } else if (data.session) {
        setSuccessMessage(t('loginPage.registrationSuccessAutoLogin'));
      } else if (data.user) {
        setSuccessMessage(t('loginPage.registrationSuccessConfirmEmail'));
      } else {
        setError(t('loginPage.errors.unknownError'));
      }

    } else { // Login mode
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        if (signInError.message === 'Invalid login credentials') {
             setError(t('loginPage.errors.invalidCredentials'));
        } else {
            setError(signInError.message);
        }
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Branding Column */}
      <div className="hidden md:flex flex-col items-center justify-center bg-indigo-600 p-12 text-white">
        <FontAwesomeIcon icon={faClock} className="w-48 h-48 mb-8 text-indigo-200" />
        <h1 className="text-4xl font-bold mb-4 text-center">{t('appName')}</h1>
        <p className="text-lg text-indigo-100 text-center max-w-sm">
          {t('loginPage.welcomeSubtitle', "Manage your work hours efficiently and stay organized.")}
        </p>
      </div>

      {/* Right Form Column */}
      <div className="flex flex-col items-center justify-center bg-slate-50 p-6 sm:p-12">
        <div className="w-full max-w-md">
            {/* Mobile Branding (Simplified) */}
            <div className="md:hidden text-center mb-8">
                <FontAwesomeIcon icon={faClock} className="w-24 h-24 mx-auto mb-4 text-indigo-600" />
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {isRegisterMode ? t('loginPage.registerTitle') : t('loginPage.title')}
                </h1>
            </div>
            {/* Desktop Title (Above form card) */}
             <div className="hidden md:block text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {isRegisterMode ? t('loginPage.registerTitle') : t('loginPage.title')}
                </h1>
            </div>

          <div className="bg-white shadow-xl rounded-xl p-8 md:p-10">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm flex items-center">
                <AlertTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-700 rounded-md text-sm">
                  {successMessage}
              </div>
            )}

            <form onSubmit={handleAuthAction} className="space-y-6">
              {isRegisterMode && (
                <InputWithIcon
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('loginPage.nameLabel')}
                  icon={<UserIcon className="h-5 w-5" />}
                  label={t('loginPage.nameLabel')}
                />
              )}
              <InputWithIcon
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('loginPage.emailLabel')}
                icon={<AtSymbolIcon className="h-5 w-5" />}
                label={t('loginPage.emailLabel')}
              />
              <InputWithIcon
                id="password"
                name="password"
                type="password"
                autoComplete={isRegisterMode ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('loginPage.passwordLabel')}
                icon={<LockClosedIcon className="h-5 w-5" />}
                label={t('loginPage.passwordLabel')}
              />
              {isRegisterMode && (
                <InputWithIcon
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('loginPage.confirmPasswordLabel')}
                  icon={<LockClosedIcon className="h-5 w-5" />}
                  label={t('loginPage.confirmPasswordLabel')}
                />
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                >
                  {isLoading 
                    ? (<svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                       </svg>) 
                    : isRegisterMode ? t('loginPage.registerButton') : t('loginPage.loginButton')}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setError(null);
                  setSuccessMessage(null);
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setName('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500"
              >
                {isRegisterMode ? t('loginPage.switchToLogin') : t('loginPage.switchToRegister')}
              </button>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-slate-500">
            {t('loginPage.copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;