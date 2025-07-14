import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  VacationSelection,
  VacationStatus,
  UserGlobalSettings,
  Holiday,
  VacationDay,
} from "@/types";
import {
  INITIAL_USER_GLOBAL_SETTINGS,
  VACATION_STATUS_STYLES,
} from "@/utils/constants";
import { formatDateToYYYYMMDD } from "@/utils/timeUtils";
import TimeInput from "@/components/common/TimeInput";
import SectionCard from "@/components/common/SectionCard";
import {
  Settings2,
  CalendarDays,
  Trash2,
  CheckCircle,
  XCircle,
  Save,
  ClipboardList,
  Settings,
  Clock,
  Users,
} from "lucide-react";
import Button from "../components/common/Button";
import {
  updateUserProfileRole,
  loadAllUsersFromSupabase,
  loadTypedUserMonthDataFromSupabase,
} from "@/utils/supabaseCrud"; // Assuming loadAllUsers is here
import { useAuthContext } from "@/contexts/AuthContext";
import { useGlobalDataContext } from "@/contexts/GlobalDataContext";
import { useCurrentUserDataContext } from "@/contexts/CurrentUserDataContext";
import { useNotificationContext } from "@/contexts/NotificationContext";
import PendingRequestsList from "@/components/AdminDashboard/PendingRequestsList";

interface AdminDashboardPageProps {
  currentUser: User;
}

interface PendingRequest extends VacationDay {
  userId: string;
  userName: string;
  month: number;
  year: number;
  comment: string;
}

interface UserVacationSummary {
  userId: string;
  userName: string;
  vacationDays: { date: string; status: VacationStatus }[];
}

const lightInputBaseClasses =
  "w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm";
const lightInputClasses = `${lightInputBaseClasses} bg-white text-slate-700 placeholder-slate-400`;
const lightSelectClasses = `${lightInputBaseClasses} bg-white text-slate-700 appearance-none`;
const lightTextareaClasses =
  "w-full p-1.5 border border-slate-300 rounded-md shadow-sm sm:text-sm text-xs bg-white text-slate-700 placeholder-slate-400";

const MONTH_CHIP_COLORS = [
  { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" }, // Jan
  { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" }, // Feb
  { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" }, // Mar
  { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" }, // Apr
  { bg: "bg-lime-100", text: "text-lime-700", border: "border-lime-300" }, // May
  { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" }, // Jun
  {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-300",
  }, // Jul
  { bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-300" }, // Aug
  { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300" }, // Sep
  { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-300" }, // Oct
  { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" }, // Nov
  {
    bg: "bg-fuchsia-100",
    text: "text-fuchsia-700",
    border: "border-fuchsia-300",
  }, // Dec
];

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  currentUser,
}) => {
  const { t, i18n } = useTranslation();
  const { addNotification } = useNotificationContext();

  const {
    globalUserSettings,
    saveGlobalUserSettings,
    allUsers,
    fetchAllUsers,
  } = useGlobalDataContext();
  const { updateSpecificUserVacations } = useCurrentUserDataContext();

  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [editableGlobalSettings, setEditableGlobalSettings] =
    useState<UserGlobalSettings>(INITIAL_USER_GLOBAL_SETTINGS);
  const [userVacationSummaries, setUserVacationSummaries] = useState<
    UserVacationSummary[]
  >([]);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState<boolean>(true);
  const [localAllUsers, setLocalAllUsers] = useState<User[]>(allUsers);
  const [isSavingGlobalSettings, setIsSavingGlobalSettings] = useState(false);

  useEffect(() => {
    setLocalAllUsers(allUsers);
  }, [allUsers]);

  useEffect(() => {
    const loadedSettings = { ...globalUserSettings };
    if (
      loadedSettings.workTimeDefaults &&
      ("morningStart" in loadedSettings.workTimeDefaults ||
        "morningEnd" in loadedSettings.workTimeDefaults)
    ) {
      loadedSettings.workTimeDefaults = {
        overallStartTime: undefined,
        overallEndTime: undefined,
      };
    } else if (!loadedSettings.workTimeDefaults) {
      loadedSettings.workTimeDefaults = {
        overallStartTime: undefined,
        overallEndTime: undefined,
      };
    }
    setEditableGlobalSettings(loadedSettings);
  }, [globalUserSettings]);

  const fetchPendingRequests = useCallback(async () => {
    if (!localAllUsers || localAllUsers.length === 0) {
      setPendingRequests([]);
      return;
    }
    const allPending: PendingRequest[] = [];
    const currentYear = new Date().getFullYear();
    const yearsToScan = [currentYear - 1, currentYear, currentYear + 1];

    for (const user of localAllUsers) {
      if (user.id === currentUser.id && user.role === "admin") continue;
      for (const year of yearsToScan) {
        for (let month = 0; month < 12; month++) {
          const userVacationsData =
            await loadTypedUserMonthDataFromSupabase<VacationSelection>(
              user.id,
              "vacations",
              year,
              month,
              []
            );
          const userVacations = Array.isArray(userVacationsData)
            ? userVacationsData
            : [];
          userVacations.forEach((vacation) => {
            if (vacation.status === VacationStatus.PENDING_APPROVAL) {
              allPending.push({
                ...vacation,
                userId: user.id,
                userName: user.name,
                month: month,
                year: year,
                comment: vacation.adminComment || "",
              });
            }
          });
        }
      }
    }
    setPendingRequests(
      allPending.sort(
        (a, b) =>
          new Date(a.date + "T00:00:00").getTime() -
          new Date(b.date + "T00:00:00").getTime()
      )
    );
  }, [localAllUsers, currentUser]);

  useEffect(() => {
    fetchPendingRequests();
  }, [fetchPendingRequests]);

  useEffect(() => {
    const fetchUserSummaries = async () => {
      if (!localAllUsers || localAllUsers.length === 0) {
        setUserVacationSummaries([]);
        setIsLoadingSummaries(false);
        return;
      }
      setIsLoadingSummaries(true);
      const currentYear = new Date().getFullYear();
      const summariesPromises = localAllUsers
        .filter(
          (user) => !(user.id === currentUser.id && user.role === "admin")
        )
        .map(async (user) => {
          const userVacDays: { date: string; status: VacationStatus }[] = [];
          for (let m = 0; m < 12; m++) {
            const monthVacationsData =
              await loadTypedUserMonthDataFromSupabase<VacationSelection>(
                user.id,
                "vacations",
                currentYear,
                m,
                []
              );
            const monthVacations = Array.isArray(monthVacationsData)
              ? monthVacationsData
              : [];
            monthVacations.forEach((v) => {
              if (
                v.status === VacationStatus.APPROVED ||
                v.status === VacationStatus.PENDING_APPROVAL
              ) {
                userVacDays.push({ date: v.date, status: v.status });
              }
            });
          }
          userVacDays.sort(
            (a, b) =>
              new Date(a.date + "T00:00:00").getTime() -
              new Date(b.date + "T00:00:00").getTime()
          );
          return {
            userId: user.id,
            userName: user.name,
            vacationDays: userVacDays,
          };
        });

      try {
        const resolvedSummaries = await Promise.all(summariesPromises);
        setUserVacationSummaries(resolvedSummaries);
      } catch (error) {
        console.error("Error fetching user vacation summaries:", error);
        setUserVacationSummaries([]);
      } finally {
        setIsLoadingSummaries(false);
      }
    };

    fetchUserSummaries();
  }, [localAllUsers, i18n.language, currentUser]);

  const handleApprovalAction = async (
    request: PendingRequest,
    newStatus: VacationStatus.APPROVED | VacationStatus.REJECTED
  ) => {
    try {
      const userVacationsData =
        await loadTypedUserMonthDataFromSupabase<VacationSelection>(
          request.userId,
          "vacations",
          request.year,
          request.month,
          []
        );
      const userVacations = Array.isArray(userVacationsData)
        ? userVacationsData
        : [];
      const updatedVacations = userVacations.map((v) =>
        v.date === request.date
          ? {
              ...v,
              status: newStatus,
              adminComment: request.comment || undefined,
            }
          : v
      );
      await updateSpecificUserVacations(
        request.userId,
        request.year,
        request.month,
        updatedVacations
      );
      addNotification(
        t("adminDashboard.requestProcessedAlert", {
          userName: request.userName,
          date: formatDateToYYYYMMDD(new Date(request.date + "T00:00:00")),
          status: t(`vacationStatuses.${newStatus}`),
          commentText: request.comment || t("adminDashboard.noComment"),
        }),
        "success"
      );
      fetchPendingRequests();
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error("Error processing request:", error);
      addNotification(err.message || "Error processing request.", "error");
    }
  };

  const handleApproveAllForUser = async (userId: string, userName: string) => {
    const userPendingRequests = pendingRequests.filter(
      (req) => req.userId === userId
    );
    if (userPendingRequests.length === 0) return;

    let allSucceeded = true;
    for (const req of userPendingRequests) {
      try {
        await handleApprovalAction(
          {
            ...req,
            comment: req.comment || t("adminDashboard.batchApprovedComment"),
          },
          VacationStatus.APPROVED
        );
      } catch (error) {
        allSucceeded = false;
        // Individual error notification is handled by handleApprovalAction
      }
    }
    if (allSucceeded) {
      addNotification(
        t("adminDashboard.allRequestsApprovedForUser", {
          count: userPendingRequests.length,
          userName: userName,
        }),
        "success"
      );
    } else {
      addNotification(t("adminDashboard.batchApprovalError"), "warning");
    }
  };

  const handleCommentChange = (
    requestDate: string,
    userId: string,
    comment: string
  ) => {
    setPendingRequests((prev) =>
      prev.map((req) =>
        req.date === requestDate && req.userId === userId
          ? { ...req, comment }
          : req
      )
    );
  };

  const handleGlobalSettingChange = (
    field: keyof UserGlobalSettings | "overallStartTime" | "overallEndTime",
    value: string
  ) => {
    setEditableGlobalSettings((prev) => {
      const newSettings = { ...prev };
      if (field === "overallStartTime" || field === "overallEndTime") {
        newSettings.workTimeDefaults = {
          ...(newSettings.workTimeDefaults || {
            overallStartTime: undefined,
            overallEndTime: undefined,
          }),
          [field]: value === "" ? undefined : value,
        };
      } else if (field === "tauxPercent" || field === "annualVacationDays") {
        const numValue = parseFloat(value);
        const initialDefaultValue = INITIAL_USER_GLOBAL_SETTINGS[field] ?? 0;
        newSettings[field] = isNaN(numValue) ? initialDefaultValue : numValue;
      }
      return newSettings;
    });
  };

  const handleSaveGlobalSettings = async () => {
    setIsSavingGlobalSettings(true);
    const settingsToSave = { ...editableGlobalSettings };
    if (settingsToSave.workTimeDefaults) {
      const { overallStartTime, overallEndTime } =
        settingsToSave.workTimeDefaults;
      if (
        (overallStartTime === undefined || overallStartTime === "") &&
        (overallEndTime === undefined || overallEndTime === "")
      ) {
        settingsToSave.workTimeDefaults = undefined;
      }
    }
    const result = await saveGlobalUserSettings(settingsToSave);
    if (result.success) {
      addNotification(t("adminDashboard.globalSettingsSavedAlert"), "success");
    } else {
      addNotification(
        t("adminDashboard.globalSettingsSaveErrorAlert") +
          (result.message ? `: ${result.message}` : ""),
        "error"
      );
    }
    setIsSavingGlobalSettings(false);
  };

  const handleRoleChange = async (
    targetUserId: string,
    newRole: "user" | "admin"
  ) => {
    const result = await updateUserProfileRole(targetUserId, newRole);
    if (result.success) {
      addNotification(
        t("adminDashboard.userRoleUpdatedSuccess", {
          userName:
            localAllUsers.find((u) => u.id === targetUserId)?.name ||
            targetUserId,
          role: t(`roles.${newRole}`),
        }),
        "success"
      );
      fetchAllUsers();
    } else {
      addNotification(
        t("adminDashboard.userRoleUpdatedError") +
          (result.message ? `: ${result.message}` : ""),
        "error"
      );
    }
  };

  const iconSharedClass = "w-5 h-5";

  const pendingRequestsByUser = pendingRequests.reduce((acc, req) => {
    if (!acc[req.userId]) {
      acc[req.userId] = { userName: req.userName, requests: [] };
    }
    acc[req.userId].requests.push(req);
    return acc;
  }, {} as Record<string, { userName: string; requests: PendingRequest[] }>);

  return (
    <div className="space-y-8 print:space-y-4 pb-8">
      <SectionCard
        title={t("adminDashboard.title")}
        titleIcon={Settings2}
        titleIconProps={{
          className: "w-6 h-6 mr-3 text-indigo-600 print:text-2xl print:mr-2",
        }}
        cardClassName="print:shadow-none print:p-0"
        headerAreaClassName="px-6 py-4 mb-0 print:p-0 print:mb-2 border-none"
        contentAreaClassName="px-6 py-4 print:p-0 print:text-sm"
        titleTextClassName="text-2xl font-semibold text-slate-800 print:text-xl"
      >
        <p className="text-slate-600 print:text-sm">
          {t("adminDashboard.welcomeMessage", { name: currentUser.name })}
        </p>
      </SectionCard>

      <SectionCard
        title={t("adminDashboard.globalConfigTitle")}
        titleIcon={Settings}
        titleIconProps={{
          className: `${iconSharedClass} mr-2 text-purple-600 print:text-xl print:mr-1`,
        }}
        cardClassName="print:shadow-none print:p-0 print:mt-4"
        headerAreaClassName="px-6 py-4 print:p-0 print:mb-2"
        contentAreaClassName="px-6 py-4 print:p-0 print:space-y-3"
        titleTextClassName="text-xl font-semibold text-slate-700 print:text-lg"
      >
        <div className="space-y-6 print:space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 shadow-sm print:p-2 print:border-slate-300">
              <h4 className="font-medium text-slate-700 mb-3">
                {t("adminDashboard.defaultParamsCardTitle")}
              </h4>
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="global-taux"
                    className="block text-xs font-medium text-slate-600 mb-1 print:text-xxs"
                  >
                    {t("adminDashboard.workRateLabel")}
                  </label>
                  <input
                    type="number"
                    id="global-taux"
                    value={editableGlobalSettings.tauxPercent ?? ""}
                    onChange={(e) =>
                      handleGlobalSettingChange("tauxPercent", e.target.value)
                    }
                    className={lightInputClasses}
                    placeholder={t("adminDashboard.workRatePlaceholder")}
                    min="0"
                    max="100"
                    step="1"
                  />
                </div>
                <div>
                  <label
                    htmlFor="global-vacdays"
                    className="block text-xs font-medium text-slate-600 mb-1 print:text-xxs"
                  >
                    {t("adminDashboard.annualVacationDaysLabel")}
                  </label>
                  <input
                    type="number"
                    id="global-vacdays"
                    value={editableGlobalSettings.annualVacationDays ?? ""}
                    onChange={(e) =>
                      handleGlobalSettingChange(
                        "annualVacationDays",
                        e.target.value
                      )
                    }
                    className={lightInputClasses}
                    placeholder={t(
                      "adminDashboard.annualVacationDaysPlaceholder"
                    )}
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 shadow-sm print:p-2 print:border-slate-300">
              <h4 className="font-medium text-slate-700 mb-3 flex items-center">
                <Clock className="w-4 h-4 mr-1.5 text-slate-500" />
                {t("adminDashboard.globalDefaultTimesCardTitle")}
              </h4>
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="global-overallStart"
                    className="block text-xxs font-medium text-slate-500 mb-0.5"
                  >
                    {t("adminDashboard.overallStartTimeLabel")}
                  </label>
                  <TimeInput
                    id="global-overallStart"
                    value={
                      editableGlobalSettings.workTimeDefaults
                        ?.overallStartTime || ""
                    }
                    onChange={(v) =>
                      handleGlobalSettingChange("overallStartTime", v)
                    }
                  />
                </div>
                <div>
                  <label
                    htmlFor="global-overallEnd"
                    className="block text-xxs font-medium text-slate-500 mb-0.5"
                  >
                    {t("adminDashboard.overallEndTimeLabel")}
                  </label>
                  <TimeInput
                    id="global-overallEnd"
                    value={
                      editableGlobalSettings.workTimeDefaults?.overallEndTime ||
                      ""
                    }
                    onChange={(v) =>
                      handleGlobalSettingChange("overallEndTime", v)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              onClick={handleSaveGlobalSettings}
              disabled={isSavingGlobalSettings}
              variant="success"
              size="md"
              className="print:hidden"
            >
              <Save className="w-5 h-5" />
              <span>
                {isSavingGlobalSettings
                  ? t("adminDashboard.savingGlobalSettingsButton")
                  : t("adminDashboard.saveGlobalSettingsButton")}
              </span>
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title={t("adminDashboard.userRoleManagementTitle")}
        titleIcon={Users}
        titleIconProps={{ className: `${iconSharedClass} mr-2 text-teal-600` }}
        titleTextClassName="text-xl font-semibold text-slate-700"
      >
        {localAllUsers.filter((user) => user.id !== currentUser.id).length ===
        0 ? (
          <p className="text-slate-500">
            {t("adminDashboard.noOtherUsersToManageRoles")}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                    {t("adminDashboard.userNameColumn")}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                    {t("adminDashboard.userEmailColumn")}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                    {t("adminDashboard.userCurrentRoleColumn")}
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">
                    {t("adminDashboard.userNewRoleColumn")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {localAllUsers
                  .filter((user) => user.id !== currentUser.id)
                  .map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                        {user.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">
                        {user.email}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-700">
                        <span
                          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            user.role === "admin"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {t(`roles.${user.role}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(
                              user.id,
                              e.target.value as "user" | "admin"
                            )
                          }
                          className={`${lightSelectClasses} text-xs py-1 w-auto`}
                          aria-label={t(
                            "adminDashboard.changeRoleForUserAria",
                            { name: user.name }
                          )}
                        >
                          <option value="user">{t("roles.user")}</option>
                          <option value="admin">{t("roles.admin")}</option>
                        </select>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title={t("adminDashboard.userVacationSummaryTitle")}
        titleIcon={ClipboardList}
        titleIconProps={{
          className: `${iconSharedClass} mr-2 text-cyan-600 print:text-xl print:mr-1`,
        }}
        cardClassName="print:shadow-none print:p-0 print:mt-4"
        headerAreaClassName="px-6 py-4 print:p-0 print:mb-2"
        contentAreaClassName="px-6 py-4 print:p-0"
        titleTextClassName="text-xl font-semibold text-slate-700 print:text-lg"
      >
        {isLoadingSummaries ? (
          <div className="text-center py-4">
            <svg
              className="mx-auto h-8 w-8 text-indigo-500 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-sm text-slate-500 mt-2">
              {t("common.loadingData")}
            </p>
          </div>
        ) : userVacationSummaries.length === 0 ? (
          <p className="text-slate-500 print:text-sm">
            {t("adminDashboard.noOtherUsersSummary")}
          </p>
        ) : (
          <div className="space-y-4">
            {userVacationSummaries.map((summary) => (
              <div
                key={summary.userId}
                className="p-3 border border-slate-200 rounded-md bg-slate-50/30"
              >
                <p className="text-sm font-semibold text-slate-700 mb-1.5">
                  {summary.userName}
                </p>
                {summary.vacationDays.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {summary.vacationDays.map((vac) => {
                      const dateObj = new Date(vac.date + "T00:00:00");
                      const monthIndex = dateObj.getMonth();
                      const chipColor =
                        MONTH_CHIP_COLORS[monthIndex] || MONTH_CHIP_COLORS[0];

                      let finalBg = chipColor.bg;
                      let finalText = chipColor.text;
                      let finalBorder = chipColor.border;

                      if (vac.status === VacationStatus.PENDING_APPROVAL) {
                        finalBg = `${chipColor.bg} opacity-70`;
                        finalText = `${chipColor.text} opacity-80`;
                        finalBorder = `${chipColor.border} opacity-70`;
                      }
                      return (
                        <span
                          key={vac.date}
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${finalBg} ${finalText} border ${
                            finalBorder || "border-transparent"
                          }`}
                          title={t(`vacationStatuses.${vac.status}`)}
                        >
                          {dateObj.toLocaleDateString(i18n.language, {
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    {t("adminDashboard.noVacationsForUser")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title={t("adminDashboard.pendingRequestsTitle")}
        titleIcon={CalendarDays}
        titleIconProps={{
          className: `${iconSharedClass} mr-2 text-green-600 print:text-xl print:mr-1`,
        }}
        cardClassName="print:shadow-none print:p-0 print:mt-4"
        headerAreaClassName="px-6 py-4 print:p-0 print:mb-2"
        contentAreaClassName="px-6 py-4 print:p-0"
        titleTextClassName="text-xl font-semibold text-slate-700 print:text-lg"
      >
        {Object.keys(pendingRequestsByUser).length === 0 ? (
          <p className="text-slate-500 print:text-sm">
            {t("adminDashboard.noPendingRequests")}
          </p>
        ) : (
          <PendingRequestsList
            pendingRequests={pendingRequests}
            onApprove={handleApprovalAction}
            onApproveAll={handleApproveAllForUser}
            isLoading={false}
          />
        )}
      </SectionCard>
    </div>
  );
};

export default AdminDashboardPage;
