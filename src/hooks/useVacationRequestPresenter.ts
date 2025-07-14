import { useState, useCallback } from "react";
import { VacationRequestPresenter } from "../presenters/VacationRequestPresenter";
import { Database } from "../types/supabase";

type DbVacationRequest =
  Database["public"]["Tables"]["vacation_requests"]["Row"];

export function useVacationRequestPresenter() {
  const [pendingRequests, setPendingRequests] = useState<DbVacationRequest[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPendingRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const requests = await VacationRequestPresenter.getPendingRequests();
      setPendingRequests(requests);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar solicitações",
      );
      console.error("Erro ao carregar solicitações:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveRequest = useCallback(
    async (id: string, adminComment?: string) => {
      try {
        setError(null);
        await VacationRequestPresenter.approveRequest(id, adminComment);
        await loadPendingRequests(); // Recarregar a lista
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao aprovar solicitação",
        );
        console.error("Erro ao aprovar solicitação:", err);
      }
    },
    [loadPendingRequests],
  );

  const rejectRequest = useCallback(
    async (id: string, adminComment?: string) => {
      try {
        setError(null);
        await VacationRequestPresenter.rejectRequest(id, adminComment);
        await loadPendingRequests(); // Recarregar a lista
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao rejeitar solicitação",
        );
        console.error("Erro ao rejeitar solicitação:", err);
      }
    },
    [loadPendingRequests],
  );

  const approveAllForUser = useCallback(
    async (userId: string) => {
      try {
        setError(null);
        await VacationRequestPresenter.approveAllForUser(userId);
        await loadPendingRequests(); // Recarregar a lista
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Erro ao aprovar solicitações em lote",
        );
        console.error("Erro ao aprovar solicitações em lote:", err);
      }
    },
    [loadPendingRequests],
  );

  return {
    pendingRequests,
    loading,
    error,
    loadPendingRequests,
    approveRequest,
    rejectRequest,
    approveAllForUser,
  };
}
