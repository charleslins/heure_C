import { Database } from "../types/supabase";

// Tipos do MCP
export type McpDatabase = Database;
export type McpSchema = McpDatabase["public"];
export type McpTables = McpSchema["Tables"];
export type McpViews = McpSchema["Views"];

// Tipos de Tabelas
export type McpPendingRequest = McpTables["pending_requests"]["Row"];
export type McpPendingRequestInsert = McpTables["pending_requests"]["Insert"];
export type McpPendingRequestUpdate = McpTables["pending_requests"]["Update"];

// Tipos de Views
export type McpPendingRequestView = McpViews["pending_requests_view"]["Row"];

// Tipos de Enums
export type McpRequestType = "vacation" | "sick_leave" | "other";
export type McpRequestStatus = "pending" | "approved" | "rejected";

// Tipos de Domínio
export interface McpPendingRequestWithUser extends McpPendingRequest {
  user_name: string;
}
