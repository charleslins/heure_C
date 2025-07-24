import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Download, FileText, Mail, Calendar, Settings } from "lucide-react";
import SectionCard from "../common/SectionCard";

interface ExportReportsCardProps {
  timeRange: string;
  currentUser: any;
}

interface ExportOption {
  id: string;
  name: string;
  description: string;
  format: 'PDF' | 'Excel' | 'CSV';
  icon: React.ReactNode;
  color: string;
}

const ExportReportsCard: React.FC<ExportReportsCardProps> = ({ 
  timeRange, 
  currentUser 
}) => {
  const { t } = useTranslation();
  const [selectedExports, setSelectedExports] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [emailReports, setEmailReports] = useState(false);

  const exportOptions: ExportOption[] = [
    {
      id: 'timesheet',
      name: t('reports.export.timesheet.name'),
      description: t('reports.export.timesheet.description'),
      format: 'PDF',
      icon: <Calendar className="w-5 h-5" />,
      color: 'blue'
    },
    {
      id: 'vacation',
      name: t('reports.export.vacation.name'),
      description: t('reports.export.vacation.description'),
      format: 'Excel',
      icon: <Calendar className="w-5 h-5" />,
      color: 'green'
    },
    {
      id: 'productivity',
      name: t('reports.export.productivity.name'),
      description: t('reports.export.productivity.description'),
      format: 'PDF',
      icon: <FileText className="w-5 h-5" />,
      color: 'purple'
    },
    {
      id: 'summary',
      name: t('reports.export.summary.name'),
      description: t('reports.export.summary.description'),
      format: 'PDF',
      icon: <FileText className="w-5 h-5" />,
      color: 'amber'
    },
    {
      id: 'detailed',
      name: t('reports.export.detailed.name'),
      description: t('reports.export.detailed.description'),
      format: 'Excel',
      icon: <Settings className="w-5 h-5" />,
      color: 'slate'
    }
  ];

  const handleExportToggle = (exportId: string) => {
    setSelectedExports(prev => 
      prev.includes(exportId) 
        ? prev.filter(id => id !== exportId)
        : [...prev, exportId]
    );
  };

  const handleExport = async () => {
    if (selectedExports.length === 0) return;
    
    setIsExporting(true);
    
    try {
      // Simular processo de exportação
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aqui seria implementada a lógica real de exportação
      console.log('Exporting reports:', selectedExports);
      console.log('Email reports:', emailReports);
      console.log('Time range:', timeRange);
      
      // Simular download
      selectedExports.forEach(exportId => {
        const option = exportOptions.find(opt => opt.id === exportId);
        if (option) {
          // Criar um link de download simulado
          const link = document.createElement('a');
          link.href = '#';
          link.download = `${option.name}_${timeRange}.${option.format.toLowerCase()}`;
          link.click();
        }
      });
      
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        icon: 'text-blue-600',
        selected: 'bg-blue-100 border-blue-300'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        icon: 'text-green-600',
        selected: 'bg-green-100 border-green-300'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        icon: 'text-purple-600',
        selected: 'bg-purple-100 border-purple-300'
      },
      amber: {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        icon: 'text-amber-600',
        selected: 'bg-amber-100 border-amber-300'
      },
      slate: {
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        text: 'text-slate-700',
        icon: 'text-slate-600',
        selected: 'bg-slate-100 border-slate-300'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <SectionCard
      title={t('reports.export.title')}
      titleIcon={Download}
      titleIconProps={{ className: "w-5 h-5 text-indigo-600" }}
      cardClassName="bg-white rounded-xl shadow-lg"
    >
      <div className="space-y-6">
        {/* Opções de exportação */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-700">
            {t('reports.export.selectReports')}
          </h4>
          
          <div className="space-y-2">
            {exportOptions.map((option) => {
              const isSelected = selectedExports.includes(option.id);
              const colors = getColorClasses(option.color);
              
              return (
                <div
                  key={option.id}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? `${colors.selected} ${colors.border}` 
                      : `${colors.bg} ${colors.border} hover:${colors.selected}`
                  }`}
                  onClick={() => handleExportToggle(option.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${colors.icon}`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className={`text-sm font-medium ${colors.text}`}>
                          {option.name}
                        </h5>
                        <span className={`text-xs px-2 py-1 rounded-full bg-white ${colors.text} border`}>
                          {option.format}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {option.description}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      isSelected 
                        ? `${colors.border} bg-white` 
                        : 'border-slate-300'
                    }`}>
                      {isSelected && (
                        <div className={`w-2 h-2 rounded-full bg-current ${colors.text}`}></div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Opções adicionais */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-700">
            {t('reports.export.additionalOptions')}
          </h4>
          
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <input
              type="checkbox"
              id="emailReports"
              checked={emailReports}
              onChange={(e) => setEmailReports(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
            />
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-600" />
              <label htmlFor="emailReports" className="text-sm text-slate-700 cursor-pointer">
                {t('reports.export.emailReports')}
              </label>
            </div>
          </div>
        </div>

        {/* Botão de exportação */}
        <div className="pt-4 border-t border-slate-200">
          <button
            onClick={handleExport}
            disabled={selectedExports.length === 0 || isExporting}
            className={`w-full py-3 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              selectedExports.length === 0 || isExporting
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800'
            }`}
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('reports.export.exporting')}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {t('reports.export.exportSelected')} ({selectedExports.length})
              </>
            )}
          </button>
          
          {selectedExports.length === 0 && (
            <p className="text-xs text-slate-500 text-center mt-2">
              {t('reports.export.selectAtLeastOne')}
            </p>
          )}
        </div>
      </div>
    </SectionCard>
  );
};

export default ExportReportsCard;