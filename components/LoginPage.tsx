import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SupabaseClient } from '@supabase/supabase-js';
import { Mail, Lock, User, AlertTriangle } from 'lucide-react';
import InputWithIcon from './common/InputWithIcon';
import { Clock } from 'lucide-react';

interface LoginPageProps {
  supabaseClient: SupabaseClient;
  isModal: boolean;
  isAdmin: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ supabaseClient, isModal, isAdmin }) => {
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
            role: 'user',
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
    } else {
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

  if (isModal) {
    return (
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isAdmin ? t('loginPage.adminTitle') : t('loginPage.title')}
          </h1>
          {isAdmin && (
            <p className="text-orange-600 font-semibold mt-2">{t('loginPage.adminAccess')}</p>
          )}
        </div>
        <div className="bg-white shadow-xl rounded-xl p-6 md:p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
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
                icon={<User className="h-5 w-5" />}
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
              icon={<Mail className="h-5 w-5" />}
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
              icon={<Lock className="h-5 w-5" />}
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
                icon={<Lock className="h-5 w-5" />}
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
                  ? t('loginPage.loading')
                  : isRegisterMode ? t('loginPage.registerButton') : isAdmin ? t('loginPage.adminLoginButton') : t('loginPage.loginButton')}
              </button>
            </div>
          </form>
          {!isAdmin && (
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
          )}
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          {t('loginPage.copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="hidden md:flex flex-col items-center justify-center bg-indigo-600 p-12 text-white">
        <Clock className="w-48 h-48 mb-8 text-indigo-200" strokeWidth={0.5} />
        <h1 className="text-4xl font-bold mb-4 text-center">{t('appName')}</h1>
        <p className="text-lg text-indigo-100 text-center max-w-sm">
          {t('loginPage.welcomeSubtitle', "Manage your work hours efficiently and stay organized.")}
        </p>
      </div>

      <div className="flex flex-col items-center justify-center bg-slate-50 p-6 sm:p-12">
        <div className="w-full max-w-md">
            <div className="md:hidden text-center mb-8">
                <Clock className="w-24 h-24 mx-auto mb-4 text-indigo-600" strokeWidth={1} />
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {isRegisterMode ? t('loginPage.registerTitle') : t('loginPage.title')}
                </h1>
            </div>
             <div className="hidden md:block text-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                {isRegisterMode ? t('loginPage.registerTitle') : t('loginPage.title')}
                </h1>
            </div>

          <div className="bg-white shadow-xl rounded-xl p-8 md:p-10">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md text-sm flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
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
                  icon={<User className="h-5 w-5" />}
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
                icon={<Mail className="h-5 w-5" />}
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
                icon={<Lock className="h-5 w-5" />}
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
                  icon={<Lock className="h-5 w-5" />}
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
                    ? t('loginPage.loading')
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
