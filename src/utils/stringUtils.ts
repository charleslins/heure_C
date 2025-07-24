/**
 * Funções utilitárias para manipulação de strings
 */

/**
 * Gera iniciais a partir de um nome completo.
 * Ex: "Usuário Padrão" -> "UP"
 * "SingleName" -> "S"
 */
export const getUserInitials = (fullName: string): string => {
  if (!fullName || typeof fullName !== "string") {
    return "?";
  }
  const trimmed = fullName.trim();
  if (trimmed.length === 0) {
    return "?";
  }
  const names = trimmed.split(/\s+/);
  if (names.length === 1 && names[0].length > 0) {
    return names[0][0].toUpperCase();
  }
  if (names.length > 1) {
    const firstInitial = names[0][0];
    const lastInitial = names[names.length - 1][0];
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }
  return "?";
};

/**
 * Gera uma cor consistente baseada no nome do usuário.
 * O mesmo nome sempre gerará a mesma cor.
 */
export const getUserColor = (name: string): string => {
  const colors = [
    "#4F46E5", // indigo-600
    "#0891B2", // cyan-600
    "#059669", // emerald-600
    "#D97706", // amber-600
    "#DC2626", // red-600
    "#7C3AED", // violet-600
    "#2563EB", // blue-600
    "#EA580C", // orange-600
    "#16A34A", // green-600
    "#9333EA", // purple-600
  ];

  // Gera um índice consistente baseado no nome
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Usa o hash para selecionar uma cor do array
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
