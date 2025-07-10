import { PendingRequestCollection } from '../collections/PendingRequestCollection';
import { DbPendingRequest, PendingRequestWithUser } from '../models/PendingRequest';

export class PendingRequestPresenter {
  static async getPendingRequests(): Promise<PendingRequestWithUser[]> {
    return PendingRequestCollection.findAll();
  }

  static async getUserRequests(userId: string): Promise<DbPendingRequest[]> {
    return PendingRequestCollection.findByUserId(userId);
  }

  static async approveRequest(id: string, adminComment?: string): Promise<DbPendingRequest> {
    return PendingRequestCollection.updateStatus(id, 'approved', adminComment);
  }

  static async rejectRequest(id: string, adminComment?: string): Promise<DbPendingRequest> {
    return PendingRequestCollection.updateStatus(id, 'rejected', adminComment);
  }

  static async approveAllForUser(userId: string): Promise<void> {
    await PendingRequestCollection.approveAllForUser(userId);
  }
} 