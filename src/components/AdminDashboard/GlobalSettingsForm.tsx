import React, { useState } from "react";
import { Settings, Save } from "lucide-react";
import Button from "../common/Button";
import {
  textInputClasses,
  checkboxClasses,
  labelClasses,
  hintClasses,
} from "../../utils/inputClasses";

const GlobalSettingsForm: React.FC = () => {
  const [settings, setSettings] = useState({
    defaultAnnualVacationDays: 20,
    minAdvanceNotice: 14,
    maxConsecutiveDays: 30,
    autoApprovalEnabled: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implementar lógica de salvamento
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da seção */}
      <div className="flex items-center gap-2 text-indigo-700 text-xl font-semibold">
        <Settings className="w-6 h-6" />
        <span>Configurações Globais</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dias de férias anuais padrão */}
          <div className="bg-slate-50 rounded-xl p-4 shadow-sm">
            <label className={labelClasses()}>
              Dias de Férias Anuais Padrão
            </label>
            <input
              type="number"
              name="defaultAnnualVacationDays"
              value={settings.defaultAnnualVacationDays}
              onChange={handleChange}
              min="0"
              max="365"
              className={textInputClasses}
            />
            <p className={hintClasses()}>
              Número padrão de dias de férias por ano para novos funcionários
            </p>
          </div>

          {/* Aviso mínimo */}
          <div className="bg-slate-50 rounded-xl p-4 shadow-sm">
            <label className={labelClasses()}>Aviso Mínimo</label>
            <input
              type="number"
              name="minAdvanceNotice"
              value={settings.minAdvanceNotice}
              onChange={handleChange}
              min="0"
              max="365"
              className={textInputClasses}
            />
            <p className={hintClasses()}>
              Dias mínimos de antecedência para solicitar férias
            </p>
          </div>

          {/* Dias consecutivos máximos */}
          <div className="bg-slate-50 rounded-xl p-4 shadow-sm">
            <label className={labelClasses()}>Dias Consecutivos Máximos</label>
            <input
              type="number"
              name="maxConsecutiveDays"
              value={settings.maxConsecutiveDays}
              onChange={handleChange}
              min="0"
              max="365"
              className={textInputClasses}
            />
            <p className={hintClasses()}>
              Número máximo de dias consecutivos de férias permitidos
            </p>
          </div>

          {/* Aprovação automática */}
          <div className="bg-slate-50 rounded-xl p-4 shadow-sm">
            <label className="flex items-center space-x-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                name="autoApprovalEnabled"
                checked={settings.autoApprovalEnabled}
                onChange={handleChange}
                className={checkboxClasses}
              />
              <span>Aprovação Automática</span>
            </label>
            <p className={hintClasses()}>
              Aprovar automaticamente solicitações que atendam aos critérios
            </p>
          </div>
        </div>

        {/* Botão de salvar */}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md">
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default GlobalSettingsForm;
