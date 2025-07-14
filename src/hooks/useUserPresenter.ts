import { useState, useCallback } from "react";
import { UserPresenter } from "../presenters/UserPresenter";
import { User } from "@/types";

export function useUserPresenter() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const loadedUsers = await UserPresenter.getAllUsers();
      setUsers(loadedUsers);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar usuários"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (id: string) => {
    try {
      setError(null);
      return await UserPresenter.getUserById(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar usuário");
      return null;
    }
  }, []);

  const createUser = useCallback(async (dto: Partial<User>) => {
    try {
      setError(null);
      const newUser = await UserPresenter.createUser(dto);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar usuário");
      return null;
    }
  }, []);

  const updateUser = useCallback(async (id: string, dto: Partial<User>) => {
    try {
      setError(null);
      const updatedUser = await UserPresenter.updateUser(id, dto);
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user))
      );
      return updatedUser;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao atualizar usuário"
      );
      return null;
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    try {
      setError(null);
      await UserPresenter.deleteUser(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir usuário");
      return false;
    }
  }, []);

  return {
    users,
    loading,
    error,
    loadUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
  };
}
