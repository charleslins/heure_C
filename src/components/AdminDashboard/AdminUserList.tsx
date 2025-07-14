import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserPresenter } from "@hooks/useUserPresenter";
import { Database } from "@/types/supabase";
import SectionCard from "../common/SectionCard";
import { User, Pencil, Trash2, CheckCircle, XCircle, Plus } from "lucide-react";
import UserForm from "./UserForm";

type DbProfile = Database["public"]["Tables"]["profiles"]["Row"];

const AdminUserList: React.FC = () => {
  const { t } = useTranslation();
  const {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
  } = useUserPresenter();

  const [selectedUser, setSelectedUser] = useState<DbProfile | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleDelete = async (userId: string) => {
    if (window.confirm(t("adminDashboard.users.confirmDelete"))) {
      try {
        await deleteUser(userId);
        await loadUsers();
      } catch (err) {
        console.error("Erro ao deletar usuário:", err);
      }
    }
  };

  const handleToggleStatus = async (userId: string, isActive: boolean) => {
    try {
      if (isActive) {
        await deactivateUser(userId);
      } else {
        await activateUser(userId);
      }
      await loadUsers();
    } catch (err) {
      console.error("Erro ao alterar status do usuário:", err);
    }
  };

  const handleEdit = (user: DbProfile) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (
    data:
      | Database["public"]["Tables"]["profiles"]["Insert"]
      | Database["public"]["Tables"]["profiles"]["Update"]
  ) => {
    try {
      if (selectedUser) {
        await updateUser(
          selectedUser.id,
          data as Database["public"]["Tables"]["profiles"]["Update"]
        );
      } else {
        await createUser(
          data as Database["public"]["Tables"]["profiles"]["Insert"]
        );
      }
      setIsFormOpen(false);
      await loadUsers();
    } catch (err) {
      throw err;
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">{t("common.loading")}</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>;
  }

  if (isFormOpen) {
    return (
      <SectionCard
        title={
          selectedUser
            ? t("adminDashboard.users.editUser")
            : t("adminDashboard.users.createUser")
        }
        titleIcon={User}
        titleIconProps={{ className: "w-6 h-6 text-indigo-600" }}
      >
        <UserForm
          user={selectedUser}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={t("adminDashboard.users.title")}
      titleIcon={User}
      titleIconProps={{ className: "w-6 h-6 text-indigo-600" }}
      headerActions={
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="w-5 h-5 mr-2" />
          {t("adminDashboard.users.createUser")}
        </button>
      }
    >
      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t("common.noData")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t("adminDashboard.users.createUser")}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("common.name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("common.email")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("common.role")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("common.status")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {t(`roles.${user.role.toLowerCase()}`)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.active ? t("common.active") : t("common.inactive")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggleStatus(user.id, user.active)}
                      className="text-indigo-600 hover:text-indigo-900 mx-2"
                      title={
                        user.active
                          ? t("common.deactivate")
                          : t("common.activate")
                      }
                    >
                      {user.active ? (
                        <XCircle className="w-5 h-5" />
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-blue-600 hover:text-blue-900 mx-2"
                      title={t("common.edit")}
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900 mx-2"
                      title={t("common.delete")}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
};

export default AdminUserList;
