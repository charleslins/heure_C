import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  loadCantons, 
  loadMunicipalities, 
  createEmployee,
  updateEmployee,
  Canton, 
  Municipality, 
  CreateEmployeeData,
  Employee
} from '../utils/employeeManagement';
import { useNotificationContext } from '../contexts/NotificationContext';

interface EmployeeRegistrationFormProps {
  employee?: Employee; // Se fornecido, será modo de edição
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EmployeeRegistrationForm: React.FC<EmployeeRegistrationFormProps> = ({ 
  employee,
  onSuccess, 
  onCancel 
}) => {
  const { t } = useTranslation();
  const { addNotification } = useNotificationContext();
  
  const [cantons, setCantons] = useState<Canton[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedCantonId, setSelectedCantonId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const isEditMode = !!employee;
  
  const [formData, setFormData] = useState<CreateEmployeeData>({
    name: employee?.name || '',
    email: employee?.email || '',
    password: '', // Sempre vazia no modo edição
    role: employee?.role || 'user',
    canton_id: employee?.canton_id || 0,
    municipality_id: employee?.municipality_id || undefined,
    employee_id: employee?.employee_id || '',
    hire_date: employee?.hire_date || new Date().toISOString().split('T')[0],
    position: employee?.position || '',
    work_schedule: employee?.work_schedule || null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar cantões ao montar o componente
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingData(true);
      try {
        const cantonsData = await loadCantons();
        setCantons(cantonsData);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        addNotification('Erro ao carregar dados iniciais', 'error');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadInitialData();
  }, [addNotification]);

  // Carregar dados do funcionário quando em modo de edição
  useEffect(() => {
    if (employee && employee.canton_id) {
      setSelectedCantonId(employee.canton_id);
    }
  }, [employee]);

  // Carregar municípios quando o cantão for selecionado
  useEffect(() => {
    const loadMunicipalitiesForCanton = async () => {
      if (selectedCantonId) {
        try {
          const municipalitiesData = await loadMunicipalities(selectedCantonId);
          setMunicipalities(municipalitiesData);
        } catch (error) {
          console.error('Erro ao carregar municípios:', error);
          addNotification('Erro ao carregar municípios', 'error');
        }
      } else {
        setMunicipalities([]);
      }
    };

    loadMunicipalitiesForCanton();
  }, [selectedCantonId, addNotification]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'canton_id' || name === 'municipality_id' 
        ? (value ? parseInt(value) : undefined)
        : value
    }));

    // Limpar erro quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCantonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cantonId = parseInt(e.target.value);
    setSelectedCantonId(cantonId);
    setFormData(prev => ({
      ...prev,
      canton_id: cantonId,
      municipality_id: undefined // Resetar município quando cantão mudar
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t('employeeManagement.employeeRegistration.errors.nameRequired');
    }

    if (!formData.email.trim()) {
      newErrors.email = t('employeeManagement.employeeRegistration.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('employeeManagement.employeeRegistration.errors.emailInvalid');
    }

    // Senha é obrigatória apenas no modo de criação
    if (!isEditMode && (!formData.password || formData.password.length < 6)) {
      newErrors.password = t('employeeManagement.employeeRegistration.errors.passwordMinLength');
    }

    if (!formData.canton_id) {
      newErrors.canton_id = t('employeeManagement.employeeRegistration.errors.cantonRequired');
    }

    if (!formData.position?.trim()) {
      newErrors.position = t('employeeManagement.employeeRegistration.errors.positionRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      if (isEditMode && employee) {
        // Modo de edição
        const updateData = {
          name: formData.name,
          role: formData.role,
          canton_id: formData.canton_id,
          municipality_id: formData.municipality_id,
          employee_id: formData.employee_id,
          hire_date: formData.hire_date,
          position: formData.position,
          work_schedule: formData.work_schedule
        };
        
        const result = await updateEmployee(employee.id, updateData);
        
        if (result.success) {
          addNotification('Funcionário atualizado com sucesso!', 'success');
          if (onSuccess) {
            onSuccess();
          }
        } else {
          addNotification(result.message || 'Erro ao atualizar funcionário', 'error');
        }
      } else {
        // Modo de criação
        const result = await createEmployee(formData);
        
        if (result.success) {
          addNotification(t('employeeManagement.employeeRegistration.success'), 'success');
          if (onSuccess) {
            onSuccess();
          }
          // Resetar formulário
          setFormData({
            name: '',
            email: '',
            password: '',
            role: 'user',
            canton_id: 0,
            municipality_id: undefined,
            employee_id: '',
            hire_date: new Date().toISOString().split('T')[0],
            position: '',
            work_schedule: null
          });
          setSelectedCantonId(null);
        } else {
          addNotification(result.message || t('employeeManagement.employeeRegistration.error'), 'error');
        }
      }
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      addNotification(isEditMode ? 'Erro ao atualizar funcionário' : t('employeeManagement.employeeRegistration.error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">{t('employeeManagement.loadingData')}</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEditMode ? t('employeeManagement.employeeRegistration.editTitle') : t('employeeManagement.employeeRegistration.title')}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('employeeManagement.employeeRegistration.nameLabel')} *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder={t('employeeManagement.employeeRegistration.namePlaceholder')}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('employeeManagement.employeeRegistration.emailLabel')} *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isEditMode}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            } ${isEditMode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder={t('employeeManagement.employeeRegistration.emailPlaceholder')}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          {isEditMode && (
            <p className="text-gray-500 text-xs mt-1">
              {t('employeeManagement.employeeRegistration.emailNotEditable')}
            </p>
          )}
        </div>

        {/* Senha */}
        {!isEditMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
        )}

        {/* Cargo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cargo *
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.position ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ex: Desenvolvedor, Analista, etc."
          />
          {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
        </div>

        {/* ID do Funcionário */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID do Funcionário (Opcional)
          </label>
          <input
            type="text"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: EMP001"
          />
        </div>

        {/* Data de Contratação */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de Contratação
          </label>
          <input
            type="date"
            name="hire_date"
            value={formData.hire_date}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Cantão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cantão *
          </label>
          <select
            name="canton_id"
            value={formData.canton_id || ''}
            onChange={handleCantonChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.canton_id ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Selecione um cantão</option>
            {cantons.map(canton => (
              <option key={canton.id} value={canton.id}>
                {canton.name} ({canton.code})
              </option>
            ))}
          </select>
          {errors.canton_id && <p className="text-red-500 text-xs mt-1">{errors.canton_id}</p>}
        </div>

        {/* Município */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Município (Opcional)
          </label>
          <select
            name="municipality_id"
            value={formData.municipality_id || ''}
            onChange={handleInputChange}
            disabled={!selectedCantonId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Selecione um município</option>
            {municipalities.map(municipality => (
              <option key={municipality.id} value={municipality.id}>
                {municipality.name} {municipality.postal_code && `(${municipality.postal_code})`}
              </option>
            ))}
          </select>
        </div>

        {/* Função */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Função no Sistema
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {/* Botões */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isEditMode ? 'Salvando...' : 'Criando...'}
              </>
            ) : (
              isEditMode ? 'Salvar Alterações' : 'Criar Funcionário'
            )}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default EmployeeRegistrationForm; 