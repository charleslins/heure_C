import { supabase } from "@/utils/supabaseClient";
import {
  DbPendingRequest,
  DbPendingRequestInsert,
  DbPendingRequestUpdate,
  PendingRequestWithUser,
} from "../models/PendingRequest";

export class PendingRequestCollection {
  private static TABLE_NAME = "pending_requests";
  private static VIEW_NAME = "pending_vacation_requests";

  static async findAll(): Promise<PendingRequestWithUser[]> {
    try {
      const { data, error } = await supabase
        .from(this.VIEW_NAME)
        .select(
          `
          id,
          user_id,
          user_name,
          request_type,
          start_date,
          end_date,
          comment,
          admin_comment,
          status,
          created_at,
          updated_at
        `,
        )
        .eq("status", "pending")
        .order("start_date", { ascending: true })
        .returns<PendingRequestWithUser[]>();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar solicitações pendentes:", error);
      throw error;
    }
  }

  static async findByUserId(userId: string): Promise<DbPendingRequest[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .returns<DbPendingRequest[]>();

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar solicitações do usuário:", error);
      throw error;
    }
  }

  static async create(
    request: DbPendingRequestInsert,
  ): Promise<DbPendingRequest> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .insert(request)
        .select()
        .single()
        .returns<DbPendingRequest>();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao criar solicitação:", error);
      throw error;
    }
  }

  static async update(
    id: string,
    request: DbPendingRequestUpdate,
  ): Promise<DbPendingRequest> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .update(request)
        .eq("id", id)
        .select()
        .single()
        .returns<DbPendingRequest>();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao atualizar solicitação:", error);
      throw error;
    }
  }

  static async updateStatus(
    id: string,
    status: "approved" | "rejected",
    adminComment?: string,
  ): Promise<DbPendingRequest> {
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
        .returns<DbPendingRequest>();

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

  static async approveAllForUser(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .update({
          status: "approved",
          admin_comment: "Aprovado em lote",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("status", "pending");

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao aprovar solicitações em lote:", error);
      throw error;
    }
  }
}
