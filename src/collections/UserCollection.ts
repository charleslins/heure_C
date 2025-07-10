import { supabase } from '../../utils/supabaseClient';
import { Database } from '../types/supabase';

type DbProfile = Database['public']['Tables']['profiles']['Row'];
type DbProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type DbProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export class UserCollection {
  private static TABLE_NAME = 'profiles';

  static async findAll(): Promise<DbProfile[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order('name')
        .returns<DbProfile[]>();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  static async findById(id: string): Promise<DbProfile | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('id', id)
        .single()
        .returns<DbProfile>();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  static async findByEmail(email: string): Promise<DbProfile | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('email', email)
        .single()
        .returns<DbProfile>();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  static async create(data: DbProfileInsert): Promise<DbProfile> {
    try {
      const { data: newUser, error } = await supabase
        .from(this.TABLE_NAME)
        .insert({
          ...data,
          active: true
        })
        .select()
        .single()
        .returns<DbProfile>();

      if (error) throw error;
      return newUser;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  static async update(id: string, data: DbProfileUpdate): Promise<DbProfile> {
    try {
      const { data: updatedUser, error } = await supabase
        .from(this.TABLE_NAME)
        .update(data)
        .eq('id', id)
        .select()
        .single()
        .returns<DbProfile>();

      if (error) throw error;
      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }
} 