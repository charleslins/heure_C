import { useState, useCallback } from 'react';
import { PendingRequestPresenter } from '../presenters/PendingRequestPresenter';
import { PendingRequestWithUser } from '../models/PendingRequest';

export function usePendingRequestPresenter() {
  const [pendingRequests, setPendingRequests] = useState<PendingRequestWithUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const requests = await PendingRequestPresenter.getPendingRequests();
      setPendingRequests(requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar solicitações');
      console.error('Erro ao carregar solicitações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveRequest = useCallback(async (id: string, adminComment?: string) => {
    try {
      setError(null);
      await PendingRequestPresenter.approveRequest(id, adminComment);
      await loadPendingRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aprovar solicitação');
      console.error('Erro ao aprovar solicitação:', err);
    }
  }, [loadPendingRequests]);

  const rejectRequest = useCallback(async (id: string, adminComment?: string) => {
    try {
      setError(null);
      await PendingRequestPresenter.rejectRequest(id, adminComment);
      await loadPendingRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao rejeitar solicitação');
      console.error('Erro ao rejeitar solicitação:', err);
    }
  }, [loadPendingRequests]);

  const approveAllForUser = useCallback(async (userId: string) => {
    try {
      setError(null);
      await PendingRequestPresenter.approveAllForUser(userId);
      await loadPendingRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aprovar solicitações em lote');
      console.error('Erro ao aprovar solicitações em lote:', err);
    }
  }, [loadPendingRequests]);

  return {
    pendingRequests,
    loading,
    error,
    loadPendingRequests,
    approveRequest,
    rejectRequest,
    approveAllForUser
  };
} 