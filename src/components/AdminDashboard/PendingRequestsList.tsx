import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Clock } from "lucide-react";
import SectionCard from "../common/SectionCard";
import { usePendingRequestPresenter } from "@hooks/usePendingRequestPresenter";

const PendingRequestsList: React.FC = () => {
  const { t } = useTranslation();
  const {
    pendingRequests,
    loading,
    error,
    loadPendingRequests,
    approveRequest,
    rejectRequest,
    approveAllForUser,
  } = usePendingRequestPresenter();

  useEffect(() => {
    loadPendingRequests();
  }, [loadPendingRequests]);

  if (loading) {
    return (
      <SectionCard>
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="mt-4 text-slate-600">
            {t("adminDashboard.loadingRequests")}
          </span>
        </div>
      </SectionCard>
    );
  }

  if (error) {
    return (
      <SectionCard>
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
      </SectionCard>
    );
  }

  if (!pendingRequests.length) {
    return (
      <SectionCard>
        <div className="flex flex-col items-center justify-center p-8 text-slate-600">
          <Clock className="w-12 h-12 text-slate-400 mb-4" />
          <p className="text-lg font-medium text-center">
            {t("adminDashboard.noPendingRequests")}
          </p>
          <p className="text-sm text-slate-500 mt-2 text-center">
            {t("adminDashboard.checkBackLater")}
          </p>
        </div>
      </SectionCard>
    );
  }

  // Agrupar por usuário
  const requestsByUser = pendingRequests.reduce<
    Record<string, { userName: string; requests: typeof pendingRequests }>
  >((acc, req) => {
    if (!acc[req.user_id]) {
      acc[req.user_id] = { userName: req.user_name, requests: [] };
    }
    acc[req.user_id].requests.push(req);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(requestsByUser).map(([userId, userData]) => (
        <SectionCard key={userId}>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-indigo-700">
              {userData.userName}
            </h4>
            {userData.requests.length > 0 && (
              <button
                onClick={() => approveAllForUser(userId)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                {t("adminDashboard.approveAllFor")} {userData.userName}
              </button>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t("common.type")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t("common.date")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t("common.comment")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {userData.requests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                      {t(`requestTypes.${req.request_type}`)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                      {new Date(req.start_date).toLocaleDateString("pt-BR")}
                      {req.start_date !== req.end_date && (
                        <>
                          {" "}
                          - {new Date(req.end_date).toLocaleDateString("pt-BR")}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm w-1/3">
                      <div className="max-h-20 overflow-y-auto">
                        <p className="text-slate-700 whitespace-pre-wrap">
                          {req.comment || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() => approveRequest(req.id)}
                        className="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200 transition-colors inline-flex items-center"
                      >
                        {t("adminDashboard.approve")}
                      </button>
                      <button
                        onClick={() => rejectRequest(req.id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors inline-flex items-center"
                      >
                        {t("adminDashboard.reject")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      ))}
    </div>
  );
};

export default PendingRequestsList;
