import { useState, useEffect, useMemo } from "react";
import { RegionCollection } from "../collections/RegionCollection";
import { RegionPresenter } from "../presenters/RegionPresenter";
import { useNotificationContext } from "../contexts/NotificationContext";
import { useTranslation } from "react-i18next";
import { Region, RegionMetadata } from "../models/Region";

export function useRegionPresenter() {
  const { t } = useTranslation();
  const { addNotification } = useNotificationContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Criar instâncias das classes MCP
  const collection = useMemo(() => new RegionCollection(), []);
  const presenter = useMemo(
    () => new RegionPresenter(collection),
    [collection],
  );

  // Estado para armazenar os dados processados
  const [viewModel, setViewModel] =
    useState<ReturnType<typeof presenter.getRegionsViewModel>>();

  // Carregar dados iniciais
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setError(null);
        await presenter.initialize();
        setViewModel(presenter.getRegionsViewModel());
      } catch (err) {
        setError(t("regions.loadingError"));
        addNotification(t("regions.loadingError"), "error");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [presenter, t, addNotification]);

  const handleCreateCanton = async (data: {
    name: string;
    code: string;
    metadata?: RegionMetadata;
  }) => {
    const result = await presenter.createCanton(data);
    if (result.success) {
      addNotification(t("regions.cantonCreateSuccess"), "success");
      setViewModel(presenter.getRegionsViewModel());
    } else {
      addNotification(
        result.message || t("regions.cantonCreateError"),
        "error",
      );
    }
    return result;
  };

  const handleCreateMunicipality = async (data: {
    name: string;
    cantonId: number;
    metadata?: RegionMetadata;
  }) => {
    const result = await presenter.createMunicipality(data);
    if (result.success) {
      addNotification(t("regions.municipalityCreateSuccess"), "success");
      setViewModel(presenter.getRegionsViewModel());
    } else {
      addNotification(
        result.message || t("regions.municipalityCreateError"),
        "error",
      );
    }
    return result;
  };

  const handleUpdateRegion = async (
    regionId: number,
    data: Partial<Region>,
  ) => {
    const result = await presenter.updateRegion(regionId, data);
    if (result.success) {
      addNotification(t("regions.updateSuccess"), "success");
      setViewModel(presenter.getRegionsViewModel());
    } else {
      addNotification(result.message || t("regions.updateError"), "error");
    }
    return result;
  };

  const handleRemoveRegion = async (regionId: number) => {
    const result = await presenter.removeRegion(regionId);
    if (result.success) {
      addNotification(t("regions.removeSuccess"), "success");
      setViewModel(presenter.getRegionsViewModel());
    } else {
      addNotification(result.message || t("regions.removeError"), "error");
    }
    return result;
  };

  const handleUpdateMetadata = async (
    regionId: number,
    metadata: RegionMetadata,
  ) => {
    const result = await presenter.updateMetadata(regionId, metadata);
    if (result.success) {
      addNotification(t("regions.metadataUpdateSuccess"), "success");
      setViewModel(presenter.getRegionsViewModel());
    } else {
      addNotification(
        result.message || t("regions.metadataUpdateError"),
        "error",
      );
    }
    return result;
  };

  const handleToggleStatus = async (regionId: number) => {
    const result = await presenter.toggleRegionStatus(regionId);
    if (result.success) {
      addNotification(t("regions.statusUpdateSuccess"), "success");
      setViewModel(presenter.getRegionsViewModel());
    } else {
      addNotification(
        result.message || t("regions.statusUpdateError"),
        "error",
      );
    }
    return result;
  };

  const loadMunicipalitiesForCanton = async (cantonId: number) => {
    try {
      setIsLoading(true);
      await presenter.loadMunicipalitiesForCanton(cantonId);
      setViewModel(presenter.getRegionsViewModel());
    } catch (err) {
      addNotification(t("regions.loadMunicipalitiesError"), "error");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    data: viewModel,
    createCanton: handleCreateCanton,
    createMunicipality: handleCreateMunicipality,
    updateRegion: handleUpdateRegion,
    removeRegion: handleRemoveRegion,
    updateMetadata: handleUpdateMetadata,
    toggleStatus: handleToggleStatus,
    loadMunicipalitiesForCanton,
    searchRegions: (query: string) => presenter.searchRegions(query),
    getActiveRegions: () => presenter.getActiveRegions(),
    getRegionHierarchy: (regionId: number) =>
      presenter.getRegionHierarchy(regionId),
    getCantonsViewModel: () => presenter.getCantonsViewModel(),
    getMunicipalitiesViewModel: (cantonId: number) =>
      presenter.getMunicipalitiesViewModel(cantonId),
  };
}
