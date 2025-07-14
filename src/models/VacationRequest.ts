export interface VacationRequest {
  id: string;
  userId: string;
  userName?: string;
  date: string;
  status?: "pending" | "approved" | "rejected";
  comment?: string;
  adminComment?: string;
  createdAt: Date;
}
