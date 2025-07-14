import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  loadEmployees,
  loadCantons,
  loadMunicipalities,
  Employee,
  Canton,
  Municipality,
} from "../utils/employeeManagement";
import { useNotificationContext } from "../contexts/NotificationContext";
import EmployeeRegistrationForm from "../components/EmployeeRegistrationForm";

const EmployeeManagementPage: React.FC = () => {
  const { t } = useTranslation();
  const { addNotification } = useNotificationContext();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCanton, setSelectedCanton] = useState<number | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [employeesData, cantonsData, municipalitiesData] =
          await Promise.all([
            loadEmployees(),
            loadCantons(),
            loadMunicipalities(),
          ]);

        setEmployees(employeesData);
        setCantons(cantonsData);
        setMunicipalities(municipalitiesData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        addNotification("Erro ao carregar dados", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [addNotification]);

  // Filtrar funcionários
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCanton =
      !selectedCanton || employee.canton_id === selectedCanton;

    return matchesSearch && matchesCanton;
  });

  const handleEmployeeCreated = async () => {
    setShowRegistrationForm(false);
    setEditingEmployee(null);
    // Recarregar lista de funcionários
    try {
      const updatedEmployees = await loadEmployees();
      setEmployees(updatedEmployees);
    } catch (error) {
      console.error("Erro ao recarregar funcionários:", error);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowRegistrationForm(true);
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
    setShowRegistrationForm(false);
  };

  const getCantonName = (cantonId?: number) => {
    const canton = cantons.find((c) => c.id === cantonId);
    return canton ? `${canton.name} (${canton.code})` : "N/A";
  };

  const getMunicipalityName = (municipalityId?: number) => {
    const municipality = municipalities.find((m) => m.id === municipalityId);
    return municipality ? municipality.name : "N/A";
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">
          {t("employeeManagement.loadingEmployees")}
        </span>
      </div>
    );
  }

  if (showRegistrationForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <button
            onClick={handleCancelEdit}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← {t("employeeManagement.backToList")}
          </button>
        </div>
        <EmployeeRegistrationForm
          employee={editingEmployee || undefined}
          onSuccess={handleEmployeeCreated}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {t("employeeManagement.title")}
        </h1>
        <p className="text-gray-600">{t("employeeManagement.subtitle")}</p>
      </div>

      {/* Barra de ações */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* Pesquisa */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Pesquisar por nome, email ou cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filtro por cantão */}
            <div className="min-w-48">
              <select
                value={selectedCanton || ""}
                onChange={(e) =>
                  setSelectedCanton(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os cantões</option>
                {cantons.map((canton) => (
                  <option key={canton.id} value={canton.id}>
                    {canton.name} ({canton.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botão de novo funcionário */}
          <button
            onClick={() => {
              setEditingEmployee(null);
              setShowRegistrationForm(true);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Novo Funcionário
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total de Funcionários
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Usuários Ativos
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.filter((e) => e.role === "user").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Administradores
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.filter((e) => e.role === "admin").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de funcionários */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Funcionários ({filteredEmployees.length})
          </h2>
        </div>

        {filteredEmployees.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <p className="text-gray-500 text-lg">
              Nenhum funcionário encontrado
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {searchTerm || selectedCanton
                ? "Tente ajustar os filtros de pesquisa"
                : "Comece cadastrando um novo funcionário"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Funcionário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cargo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Região
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contratação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium">
                              {employee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employee.email}
                          </div>
                          {employee.employee_id && (
                            <div className="text-xs text-gray-400">
                              ID: {employee.employee_id}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {employee.position || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getCantonName(employee.canton_id)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getMunicipalityName(employee.municipality_id)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(employee.hire_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          employee.role === "admin"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {employee.role === "admin"
                          ? "Administrador"
                          : "Usuário"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditEmployee(employee)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Editar
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagementPage;
