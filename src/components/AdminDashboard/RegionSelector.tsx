import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";

interface Region {
  id: number;
  name: string;
  code?: string;
}

interface RegionSelectorProps {
  selectedCantonId?: number;
  selectedMunicipalityId?: number;
  onCantonChange: (cantonId: number | null) => void;
  onMunicipalityChange: (municipalityId: number | null) => void;
  className?: string;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedCantonId,
  selectedMunicipalityId,
  onCantonChange,
  onMunicipalityChange,
  className = "",
}) => {
  const [cantons, setCantons] = useState<Region[]>([]);
  const [municipalities, setMunicipalities] = useState<Region[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCantons = async () => {
      try {
        const { data, error } = await supabase
          .from("cantons")
          .select("*")
          .order("name");

        if (error) throw error;
        setCantons(data || []);
      } catch (error) {
        console.error("Erro ao carregar cantões:", error);
      }
    };

    loadCantons();
  }, []);

  useEffect(() => {
    const loadMunicipalities = async () => {
      if (!selectedCantonId) {
        setMunicipalities([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("municipalities")
          .select("*")
          .eq("canton_id", selectedCantonId)
          .order("name");

        if (error) throw error;
        setMunicipalities(data || []);
      } catch (error) {
        console.error("Erro ao carregar municípios:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMunicipalities();
  }, [selectedCantonId]);

  const handleCantonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    onCantonChange(value);
    onMunicipalityChange(null); // Reset município quando cantão muda
  };

  const handleMunicipalityChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    onMunicipalityChange(value);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Cantão
        </label>
        <select
          value={selectedCantonId || ""}
          onChange={handleCantonChange}
          className="w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-slate-700"
        >
          <option value="">Selecione um cantão</option>
          {cantons.map((canton) => (
            <option key={canton.id} value={canton.id}>
              {canton.name} ({canton.code})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Município
        </label>
        <select
          value={selectedMunicipalityId || ""}
          onChange={handleMunicipalityChange}
          disabled={!selectedCantonId || isLoading}
          className="w-full p-2 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white text-slate-700 disabled:bg-slate-50 disabled:text-slate-500"
        >
          <option value="">
            {isLoading ? "Carregando..." : "Selecione um município"}
          </option>
          {municipalities.map((municipality) => (
            <option key={municipality.id} value={municipality.id}>
              {municipality.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default RegionSelector;
