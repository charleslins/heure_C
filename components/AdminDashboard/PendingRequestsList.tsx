import React from 'react';
import { VacationStatus } from '../../types';

interface PendingRequest {
  userId: string;
  userName: string;
  date: string;
  month: number;
  year: number;
  comment: string;
}

interface PendingRequestsListProps {
  pendingRequests: PendingRequest[];
  onApprove: (request: PendingRequest, status: VacationStatus) => void;
  onApproveAll: (userId: string, userName: string) => void;
  isLoading: boolean;
}

const PendingRequestsList: React.FC<PendingRequestsListProps> = ({ pendingRequests, onApprove, onApproveAll, isLoading }) => {
  if (isLoading) return <div>Carregando solicitações...</div>;
  if (!pendingRequests.length) return <div>Nenhuma solicitação pendente.</div>;

  // Agrupar por usuário
  const requestsByUser = pendingRequests.reduce<Record<string, { userName: string; requests: PendingRequest[] }>>((acc, req) => {
    if (!acc[req.userId]) acc[req.userId] = { userName: req.userName, requests: [] };
    acc[req.userId].requests.push(req);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(requestsByUser).map(([userId, userData]) => (
        <div key={userId} className="p-4 border border-slate-200 rounded-lg bg-slate-50/30 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-slate-800">{userData.userName}</h4>
            {userData.requests.length > 0 && (
              <button
                onClick={() => onApproveAll(userId, userData.userName)}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors flex items-center space-x-1.5"
              >
                Aprovar todas para {userData.userName}
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Comentário</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {userData.requests.map(req => (
                  <tr key={`${req.userId}-${req.date}`}> 
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700 align-top">
                      {new Date(req.date + 'T00:00:00').toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit', year:'numeric'})}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm align-top w-1/3">
                      <textarea
                        value={req.comment}
                        readOnly
                        rows={2}
                        className="w-full p-1.5 border border-slate-300 rounded-md shadow-sm sm:text-sm text-xs bg-white text-slate-700 placeholder-slate-400"
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm space-y-1 md:space-y-0 md:space-x-2 align-top flex flex-col md:flex-row">
                      <button
                        onClick={() => onApprove(req, VacationStatus.APPROVED)}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors flex items-center justify-center space-x-1"
                        title="Aprovar"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => onApprove(req, VacationStatus.REJECTED)}
                        className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors flex items-center justify-center space-x-1"
                        title="Rejeitar"
                      >
                        Rejeitar
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