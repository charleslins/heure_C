import { User } from '../types';

/**
 * Generates initials from a full name.
 * E.g., "Usuário Padrão" -> "UP"
 * "SingleName" -> "S"
 */
export const getUserInitials = (fullName: string): string => {
  if (!fullName || typeof fullName !== 'string') {
    return '?';
  }
  const names = fullName.trim().split(/\s+/);
  if (names.length === 1 && names[0].length > 0) {
    return names[0][0].toUpperCase();
  }
  if (names.length > 1) {
    const firstInitial = names[0][0];
    const lastInitial = names[names.length - 1][0];
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }
  return fullName.length > 0 ? fullName[0].toUpperCase() : '?';
};
