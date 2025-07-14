// 1. React e bibliotecas externas
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart3,
  Users,
  Bell,
  Calendar,
  Briefcase,
  XCircle,
} from "lucide-react";

// 2. Tipos e interfaces
import {
  User,
  VacationSelection,
  VacationStatus,
  UserGlobalSettings,
  Holiday,
  VacationDay,
} from "@/types";

// 3. Components
import SectionCard from "./common/SectionCard";

// 4. Services e Presenters
import { supabase } from "@/utils/supabaseClient";
import {
  updateUserProfileRole,
  loadAllUsersFromSupabase,
  loadTypedUserMonthDataFromSupabase,
} from "@/utils/supabaseCrud";
import { useAuthContext } from "../contexts/AuthContext";
import { useGlobalDataContext } from "../contexts/GlobalDataContext";
import { useCurrentUserDataContext } from "../contexts/CurrentUserDataContext";
import { useNotificationContext } from "../contexts/NotificationContext";
import PendingRequestsList from "./AdminDashboard/PendingRequestsList";

// 5. Utils e constantes
import {
  INITIAL_USER_GLOBAL_SETTINGS,
  VACATION_STATUS_STYLES,
} from "@/utils/constants";
import { formatDateToYYYYMMDD } from "@/utils/timeUtils";
import { getUserInitials, getUserColor } from "@/utils/stringUtils";

interface AdminOverviewDashboardProps {
  currentUser: User;
}

interface UserVacationData {
  userId: string;
  userName: string;
  startDate: string;
  endDate: string;
  status: string;
}

interface VacationOverlapData {
  date: string;
  users: {
    id: string;
    name: string;
    color: string;
  }[];
}

interface DepartmentStats {
  name: string;
  totalEmployees: number;
  onVacation: number;
}

const AdminOverviewDashboard: React.FC<AdminOverviewDashboardProps> = ({
  currentUser,
}) => {
  const { t } = useTranslation();
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [vacationData, setVacationData] = useState<UserVacationData[]>([]);
  const [overlapData, setOverlapData] = useState<VacationOverlapData[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [upcomingVacations, setUpcomingVacations] = useState<
    UserVacationData[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Buscar contagem de solicitações pendentes
        const { count: pendingCount } = await supabase
          .from("user_vacations")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending_approval");

        setPendingRequestsCount(pendingCount || 0);

        // Buscar total de usuários
        const { count: usersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        setTotalUsers(usersCount || 0);

        // Buscar dados de férias
        const { data: vacations } = await supabase
          .from("user_vacations")
          .select(
            `
            id,
            start_date,
            end_date,
            status,
            profiles (
              id,
              full_name
            )
          `,
          )
          .gte("start_date", new Date().toISOString().split("T")[0])
          .order("start_date");

        if (vacations) {
          const formattedVacations = vacations.map((v) => ({
            userId: v.profiles.id,
            userName: v.profiles.full_name,
            startDate: v.start_date,
            endDate: v.end_date,
            status: v.status,
          }));

          setVacationData(formattedVacations);

          // Processar dados de sobreposição
          const overlaps: VacationOverlapData[] = [];
          const today = new Date();
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 3);

          for (let d = today; d <= endDate; d.setDate(d.getDate() + 1)) {
            const currentDate = formatDateToYYYYMMDD(d);
            const usersOnVacation = formattedVacations.filter(
              (v) => v.startDate <= currentDate && v.endDate >= currentDate,
            );

            if (usersOnVacation.length > 0) {
              overlaps.push({
                date: currentDate,
                users: usersOnVacation.map((u) => ({
                  id: u.userId,
                  name: u.userName,
                  color: getUserColor(u.userName),
                })),
              });
            }
          }

          setOverlapData(overlaps);

          // Configurar próximas férias
          setUpcomingVacations(
            formattedVacations
              .filter((v) => v.status === "approved")
              .slice(0, 5),
          );
        }

        // Buscar estatísticas por departamento (exemplo)
        const mockDepartmentStats = [
          { name: "TI", totalEmployees: 10, onVacation: 2 },
          { name: "RH", totalEmployees: 5, onVacation: 1 },
          { name: "Financeiro", totalEmployees: 8, onVacation: 0 },
        ];
        setDepartmentStats(mockDepartmentStats);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderVacationTimeline = () => {
    if (overlapData.length === 0) {
      return (
        <div className="text-center py-8 text-slate-500">
          {t("adminDashboardPage.noVacationData")}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {overlapData.map((day) => (
          <div key={day.date} className="flex items-center space-x-4">
            <span className="w-24 text-sm text-slate-600">
              {new Date(day.date).toLocaleDateString()}
            </span>
            <div className="flex-1 flex items-center space-x-2">
              {day.users.map((user) => (
                <div
                  key={user.id}
                  className="px-3 py-1 rounded-full text-xs text-white"
                  style={{ backgroundColor: user.color }}
                  title={user.name}
                >
                  {getUserInitials(user.name)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho de Boas-vindas */}
      <SectionCard
        title={t("dashboardPage.adminOverviewTitle")}
        titleTextClassName="text-xl md:text-2xl font-semibold text-slate-800"
        headerAreaClassName="p-6 border-b-0"
        contentAreaClassName="p-6 pt-0"
      >
        <p className="text-slate-600 mt-1">
          {t("dashboardPage.adminWelcome", { name: currentUser.name })}
        </p>
      </SectionCard>

      {/* Cards de KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-white rounded-xl shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Users className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">
              {t("adminDashboardPage.totalUsers")}
            </p>
            <p className="text-3xl font-bold text-slate-800">{totalUsers}</p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Bell className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">
              {t("adminDashboardPage.pendingRequests")}
            </p>
            <p className="text-3xl font-bold text-slate-800">
              {pendingRequestsCount}
            </p>
          </div>
        </div>

        <div className="p-5 bg-white rounded-xl shadow-lg flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-full">
            <Calendar className="w-8 h-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">
              {t("adminDashboardPage.onVacation")}
            </p>
            <p className="text-3xl font-bold text-slate-800">
              {overlapData.length > 0 ? overlapData[0].users.length : 0}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline de Férias */}
      <SectionCard
        title={t("adminDashboardPage.vacationTimeline")}
        titleIcon={Calendar}
        titleIconProps={{ className: "w-6 h-6 text-indigo-600" }}
      >
        <div className="overflow-x-auto">{renderVacationTimeline()}</div>
      </SectionCard>

      {/* Estatísticas por Departamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard
          title={t("adminDashboardPage.departmentStats")}
          titleIcon={Briefcase}
          titleIconProps={{ className: "w-6 h-6 text-indigo-600" }}
        >
          <div className="space-y-4">
            {departmentStats.map((dept) => (
              <div
                key={dept.name}
                className="flex items-center justify-between"
              >
                <span className="text-slate-700">{dept.name}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-500">
                    {t("adminDashboardPage.totalEmployees")}:{" "}
                    {dept.totalEmployees}
                  </span>
                  <span className="text-sm text-green-600">
                    {t("adminDashboardPage.onVacation")}: {dept.onVacation}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Próximas Férias */}
        <SectionCard
          title={t("adminDashboardPage.upcomingVacations")}
          titleIcon={Calendar}
          titleIconProps={{ className: "w-6 h-6 text-indigo-600" }}
        >
          <div className="space-y-3">
            {upcomingVacations.map((vacation) => (
              <div
                key={`${vacation.userId}-${vacation.startDate}`}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: getUserColor(vacation.userName) }}
                  >
                    {getUserInitials(vacation.userName)}
                  </div>
                  <span className="text-slate-700">{vacation.userName}</span>
                </div>
                <div className="text-sm text-slate-500">
                  {new Date(vacation.startDate).toLocaleDateString()} -{" "}
                  {new Date(vacation.endDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

export default AdminOverviewDashboard;
