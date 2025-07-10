import { UserCollection } from '../collections/UserCollection';
import { Database } from '../types/supabase';

type DbProfile = Database['public']['Tables']['profiles']['Row'];
type DbProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type DbProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export class UserPresenter {
  static async getAllUsers(): Promise<DbProfile[]> {
    return UserCollection.findAll();
  }

  static async getUserById(id: string): Promise<DbProfile | null> {
    return UserCollection.findById(id);
  }

  static async getUserByEmail(email: string): Promise<DbProfile | null> {
    return UserCollection.findByEmail(email);
  }

  static async createUser(data: DbProfileInsert): Promise<DbProfile> {
    // Validar se o email já existe
    const existingUser = await UserCollection.findByEmail(data.email || '');
    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    return UserCollection.create(data);
  }

  static async updateUser(id: string, data: DbProfileUpdate): Promise<DbProfile> {
    const user = await UserCollection.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return UserCollection.update(id, data);
  }

  static async deleteUser(id: string): Promise<void> {
    const user = await UserCollection.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return UserCollection.delete(id);
  }

  static async activateUser(id: string): Promise<DbProfile> {
    const user = await UserCollection.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return UserCollection.update(id, { active: true });
  }

  static async deactivateUser(id: string): Promise<DbProfile> {
    const user = await UserCollection.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return UserCollection.update(id, { active: false });
  }
} 