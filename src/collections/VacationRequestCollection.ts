import { supabase } from "../utils/supabaseClient";
import { Database } from "../types/supabase";

type DbVacationRequest =
  Database["public"]["Tables"]["vacation_requests"]["Row"];
type DbVacationRequestInsert =
  Database["public"]["Tables"]["vacation_requests"]["Insert"];


export class VacationRequestCollection {
  private static TABLE_NAME = "vacation_requests";

  static async findPendingRequests(): Promise<DbVacationRequest[]> {
    try {
      const { data, error } = await supabase
        .from("pending_vacation_requests")
        .select(
          `
          id,
          user_id,
          profiles (
            name
          ),
          date,
          comment,
          created_at
        `
        )
        .order("date")
        .returns<(DbVacationRequest & { profiles: { name: string } })[]>();

      if (error) throw error;

      return (data || []).map((request: any) => ({
        ...request,
        userName: request.profiles.name,
      }));
    } catch (error) {
      console.error("Erro ao buscar solicitações pendentes:", error);
      throw error;
    }
  }

  static async findByUserId(userId: string): Promise<DbVacationRequest[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("user_id", userId)
        .order("date")
        .returns<DbVacationRequest[]>();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar solicitações do usuário:", error);
      throw error;
    }
  }

  static async create(
    request: DbVacationRequestInsert
  ): Promise<DbVacationRequest> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert(request)
        .select()
        .single()
        .returns<DbVacationRequest>();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao criar solicitação:", error);
      throw error;
    }
  }

  static async updateStatus(
    id: string,
    status: "approved" | "rejected",
    adminComment?: string
  ): Promise<DbVacationRequest> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          status,
          admin_comment: adminComment,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()
        .returns<DbVacationRequest>();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao atualizar status da solicitação:", error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao deletar solicitação:", error);
      throw error;
    }
  }
}
