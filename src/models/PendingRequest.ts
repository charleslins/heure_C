import { Database } from "../types/supabase";

export type DbPendingRequest =
  Database["public"]["Tables"]["pending_requests"]["Row"];
export type DbPendingRequestInsert =
  Database["public"]["Tables"]["pending_requests"]["Insert"];
export type DbPendingRequestUpdate =
  Database["public"]["Tables"]["pending_requests"]["Update"];

export interface PendingRequestWithUser extends DbPendingRequest {
  user_name: string;
  request_type: "vacation" | "leave" | "other";
  start_date: string;
  end_date: string;
  comment?: string;
  admin_comment?: string;
  status: "pending" | "approved" | "rejected";
}
