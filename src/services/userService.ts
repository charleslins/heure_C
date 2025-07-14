import { supabase } from "../supabase/client";
import { DbUser, DbUserInsert, DbUserUpdate } from "../types/supabase";

export class UserService {
  static async getUser(userId: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()
      .returns<DbUser>();

    if (error) throw error;
    return data;
  }

  static async createUser(user: DbUserInsert): Promise<DbUser> {
    const { data, error } = await supabase
      .from("users")
      .insert(user)
      .select()
      .single()
      .returns<DbUser>();

    if (error) throw error;
    return data;
  }

  static async updateUser(
    userId: string,
    updates: DbUserUpdate,
  ): Promise<DbUser> {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", userId)
      .select()
      .single()
      .returns<DbUser>();

    if (error) throw error;
    return data;
  }

  static async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) throw error;
  }
}
