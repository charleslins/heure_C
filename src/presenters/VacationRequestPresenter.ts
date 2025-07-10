import { VacationRequestCollection } from '../collections/VacationRequestCollection';
import { Database } from '../types/supabase';

type DbVacationRequest = Database['public']['Tables']['vacation_requests']['Row'];

export class VacationRequestPresenter {
  static async getPendingRequests(): Promise<DbVacationRequest[]> {
    return VacationRequestCollection.findPendingRequests();
  }

  static async getUserRequests(userId: string): Promise<DbVacationRequest[]> {
    return VacationRequestCollection.findByUserId(userId);
  }

  static async approveRequest(id: string, adminComment?: string): Promise<DbVacationRequest> {
    return VacationRequestCollection.updateStatus(id, 'approved', adminComment);
  }

  static async rejectRequest(id: string, adminComment?: string): Promise<DbVacationRequest> {
    return VacationRequestCollection.updateStatus(id, 'rejected', adminComment);
  }

  static async approveAllForUser(userId: string): Promise<void> {
    const requests = await VacationRequestCollection.findByUserId(userId);
    const pendingRequests = requests.filter(req => req.status === 'pending');
    
    await Promise.all(
      pendingRequests.map(req => 
        VacationRequestCollection.updateStatus(req.id, 'approved', 'Aprovado em lote')
      )
    );
  }
} 