import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import InputWithIcon from "../common/InputWithIcon";
import Button from "../common/Button";
import { User, Mail, Languages } from "lucide-react";
import { Database } from "../../types/supabase";

type DbProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

interface UserFormProps {
  user?: DbProfileInsert;
  onSubmit: (data: DbProfileInsert) => Promise<void>;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<DbProfileInsert>({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "user",
    language: user?.language || "pt",
    active: user?.active ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles = [
    { id: "admin", name: "admin" },
    { id: "user", name: "user" },
    { id: "manager", name: "manager" },
    { id: "supervisor", name: "supervisor" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar usuário");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev: DbProfileInsert) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
      )}

      <InputWithIcon
        id="name"
        icon={<User className="h-5 w-5" />}
        label={t("common.name")}
        name="name"
        type="text"
        value={formData.name}
        onChange={handleChange}
        required
        placeholder={t("common.name")}
      />

      <InputWithIcon
        id="email"
        icon={<Mail className="h-5 w-5" />}
        label={t("common.email")}
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder={t("common.email")}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("common.role")}
          </label>
          <select
            name="role"
            value={formData.role || ""}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            required
          >
            <option value="">{t("common.selectRole")}</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {t(`roles.${role.name.toLowerCase()}`)}
              </option>
            ))}
          </select>
        </div>

        <InputWithIcon
          id="language"
          icon={<Languages className="h-5 w-5" />}
          label={t("common.language")}
          name="language"
          type="text"
          value={formData.language}
          onChange={handleChange}
          required
          placeholder={t("common.language")}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" size="md" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button type="submit" variant="primary" size="md" disabled={loading}>
          {loading ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
