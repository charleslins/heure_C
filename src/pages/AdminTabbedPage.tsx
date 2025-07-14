import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Users, User, Calendar, Settings } from "lucide-react";
import { useAuthContext } from "../contexts/AuthContext";
import { VacationStatus } from "../types/types";
import { PendingRequest } from "@/types";
import { supabase } from "@/utils/supabaseClient";
import PendingRequestsList from "../components/AdminDashboard/PendingRequestsList";
import GlobalSettingsForm from "../components/AdminDashboard/GlobalSettingsForm";
import UserVacationSummaryTable from "../components/AdminDashboard/UserVacationSummaryTable";
import HolidayManagementPage from "./HolidayManagementPage";
import AdminUserList from "../components/AdminDashboard/AdminUserList";

const AdminTabbedPage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuthContext();
  const [activeTab, setActiveTab] = useState("users");
  const [isLoadingPendingRequests, setIsLoadingPendingRequests] =
    useState(false);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);

  const loadPendingRequests = useCallback(async () => {
    if (activeTab !== "pending") return;

    setIsLoadingPendingRequests(true);
    try {
      const { data, error } = await supabase
        .from("user_vacations")
        .select(
          `
          user_id,
          vacation_date:date,
          comment:admin_comment,
          users!user_id (
            first_name,
            last_name
          )
        `,
        )
        .eq("status", "Pendente");

      if (error) throw error;

      const formattedRequests = data.map((req) => ({
        userId: req.user_id,
        userName: `${req.users.first_name} ${req.users.last_name || ""}`.trim(),
        date: req.vacation_date,
        comment: req.comment,
      }));

      setPendingRequests(formattedRequests);
    } catch (error) {
      console.error("Error loading pending requests:", error);
    } finally {
      setIsLoadingPendingRequests(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadPendingRequests();
  }, [loadPendingRequests]);

  const handleApproveRequest = useCallback(
    async (request: PendingRequest, status: VacationStatus) => {
      try {
        const { error } = await supabase
          .from("user_vacations")
          .update({
            status:
              status === VacationStatus.APPROVED ? "Aprovado" : "Rejeitado",
            admin_comment:
              status === VacationStatus.APPROVED ? "Aprovado" : "Rejeitado",
          })
          .eq("user_id", request.userId)
          .eq("date", request.date);

        if (error) throw error;

        setPendingRequests((prev) =>
          prev.filter(
            (r) => !(r.userId === request.userId && r.date === request.date),
          ),
        );
      } catch (error) {
        console.error("Error updating vacation request:", error);
      }
    },
    [],
  );

  const handleApproveAll = useCallback(
    async (userId: string, userName: string) => {
      try {
        const { error } = await supabase
          .from("user_vacations")
          .update({
            status: "Aprovado",
            admin_comment: "Aprovado em lote",
          })
          .eq("user_id", userId)
          .eq("status", "Pendente");

        if (error) throw error;

        setPendingRequests((prev) => prev.filter((r) => r.userId !== userId));
      } catch (error) {
        console.error("Error approving all requests:", error);
      }
    },
    [],
  );

  const tabs = [
    {
      id: "users",
      name: t("adminDashboard.tabs.users"),
      icon: User,
      component: AdminUserList,
    },
    {
      id: "pending",
      name: t("adminDashboard.tabs.pending"),
      icon: Users,
      component: () => (
        <PendingRequestsList
          pendingRequests={pendingRequests}
          onApprove={handleApproveRequest}
          onApproveAll={handleApproveAll}
          isLoading={isLoadingPendingRequests}
        />
      ),
    },
    {
      id: "holidays",
      name: t("adminDashboard.tabs.holidays"),
      icon: Calendar,
      component: HolidayManagementPage,
    },
    {
      id: "vacations",
      name: t("adminDashboard.tabs.vacations"),
      icon: Calendar,
      component: UserVacationSummaryTable,
    },
    {
      id: "settings",
      name: t("adminDashboard.tabs.settings"),
      icon: Settings,
      component: GlobalSettingsForm,
    },
  ];

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || tabs[0].component;

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-2">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Título principal */}
        <div className="flex items-center gap-2 text-indigo-700 text-2xl font-bold mb-2">
          <Users className="w-7 h-7" />
          <span>Painel Admin</span>
        </div>

        {/* Navegação por abas */}
        <div className="bg-white rounded-2xl shadow p-4">
          <nav className="flex space-x-4" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === "pending") {
                      loadPendingRequests();
                    }
                  }}
                  className={`
                    group inline-flex items-center py-2 px-4 rounded-lg font-medium text-sm transition-colors
                    ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-slate-600 hover:text-indigo-600 hover:bg-slate-50"
                    }
                  `}
                  aria-current={isActive ? "page" : undefined}
                >
                  <tab.icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${isActive ? "text-indigo-500" : "text-slate-400 group-hover:text-indigo-500"}
                    `}
                    aria-hidden="true"
                  />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Conteúdo da aba ativa */}
        <div className="bg-white rounded-2xl shadow p-6">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default AdminTabbedPage;
