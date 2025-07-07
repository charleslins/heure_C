import React from 'react';
import { VacationStatus, PendingRequest } from '../../types';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';

interface PendingRequestsListProps {
  pendingRequests?: PendingRequest[];
  onApprove?: (request: PendingRequest, status: VacationStatus) => void;
  onApproveAll?: (userId: string, userName: string) => void;
  isLoading?: boolean;
}

const PendingRequestsList: React.FC<PendingRequestsListProps> = ({ 
  pendingRequests = [], 
  onApprove = () => {}, 
  onApproveAll = () => {}, 
  isLoading = false 
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-slate-600">{t('common.loadingData')}</span>
      </div>
    );
  }

  if (!pendingRequests.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-600">
        <Clock className="w-12 h-12 text-slate-400 mb-2" />
        <p className="text-lg font-medium">{t('adminDashboard.noPendingRequests')}</p>
      </div>
    );
  }

  // Agrupar por usuário
  const requestsByUser = pendingRequests.reduce<Record<string, { userName: string; requests: PendingRequest[] }>>((acc, req) => {
    if (!acc[req.userId]) acc[req.userId] = { userName: req.userName, requests: [] };
    acc[req.userId].requests.push(req);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(requestsByUser).map(([userId, userData]) => (
        <div key={userId} className="bg-slate-50 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-semibold text-indigo-700">{userData.userName}</h4>
            {userData.requests.length > 0 && (
              <button
                onClick={() => onApproveAll(userId, userData.userName)}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                {t('adminDashboard.approveAllFor')} {userData.userName}
              </button>
            )}
          </div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t('common.date')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t('common.comment')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {userData.requests.map(req => (
                  <tr key={`${req.userId}-${req.date}`} className="hover:bg-slate-50 transition-colors"> 
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                      {new Date(req.date + 'T00:00:00').toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm w-1/3">
                      <div className="max-h-20 overflow-y-auto">
                        <p className="text-slate-700 whitespace-pre-wrap">{req.comment || '-'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() => onApprove(req, VacationStatus.APPROVED)}
                        className="px-3 py-1.5 bg-green-100 text-green-700 text-xs rounded-lg hover:bg-green-200 transition-colors inline-flex items-center"
                      >
                        {t('adminDashboard.approve')}
                      </button>
                      <button
                        onClick={() => onApprove(req, VacationStatus.REJECTED)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition-colors inline-flex items-center"
                      >
                        {t('adminDashboard.reject')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PendingRequestsList; 