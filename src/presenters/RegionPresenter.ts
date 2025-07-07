import { Region, RegionMetadata } from '../models/Region';
import { RegionCollection } from '../collections/RegionCollection';
import { useTranslation } from 'react-i18next';

export class RegionPresenter {
  private collection: RegionCollection;
  private t: (key: string) => string;

  constructor(collection: RegionCollection) {
    this.collection = collection;
    const { t } = useTranslation();
    this.t = t;
  }

  async initialize(): Promise<void> {
    await this.collection.loadAll();
  }

  async loadCantons(): Promise<void> {
    await this.collection.loadCantons();
  }

  async loadMunicipalitiesForCanton(cantonId: number): Promise<void> {
    await this.collection.loadMunicipalitiesForCanton(cantonId);
  }

  getRegionsViewModel() {
    const regions = this.collection.getAll();
    const cantons = this.collection.getCantons();
    const municipalities = this.collection.getMunicipalities();

    return {
      regions: regions.map(r => this.mapRegionToViewModel(r)),
      cantons: cantons.map(c => this.mapRegionToViewModel(c)),
      municipalities: municipalities.map(m => this.mapRegionToViewModel(m)),
      statistics: {
        totalRegions: regions.length,
        totalCantons: cantons.length,
        totalMunicipalities: municipalities.length,
        activeRegions: this.collection.getActiveRegions().length
      }
    };
  }

  getCantonsViewModel() {
    return this.collection.getCantons().map(canton => ({
      ...this.mapRegionToViewModel(canton),
      municipalitiesCount: this.collection.getMunicipalities(canton.id).length
    }));
  }

  getMunicipalitiesViewModel(cantonId: number) {
    const canton = this.collection.getById(cantonId);
    if (!canton) return { canton: undefined, municipalities: [] };

    return {
      canton: this.mapRegionToViewModel(canton),
      municipalities: this.collection.getMunicipalities(cantonId)
        .map(m => this.mapRegionToViewModel(m))
    };
  }

  private mapRegionToViewModel(region: Region) {
    const hierarchy = this.collection.getRegionHierarchy(region.id);

    return {
      id: region.id,
      name: region.name,
      code: region.code,
      displayName: region.getDisplayName(),
      type: region.type,
      parentId: region.parentId,
      parentName: hierarchy.canton?.name,
      isActive: region.isActive,
      metadata: {
        population: region.metadata?.population,
        language: region.metadata?.language 
          ? this.t(`languages.${region.metadata.language}`)
          : undefined,
        timezone: region.metadata?.timezone,
        postalCodes: region.metadata?.postalCodes
      },
      hasCoordinates: region.hasCoordinates(),
      coordinates: region.coordinates,
      isCanton: region.isCanton(),
      isMunicipality: region.isMunicipality()
    };
  }

  async createCanton(data: {
    name: string;
    code: string;
    metadata?: RegionMetadata;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const canton = Region.createCanton(data.name, data.code, data.metadata);
      await this.collection.add(canton);
      return { success: true };
    } catch (error) {
      console.error('Erro ao criar cantão:', error);
      return {
        success: false,
        message: this.t('regions.cantonCreateError')
      };
    }
  }

  async createMunicipality(data: {
    name: string;
    cantonId: number;
    metadata?: RegionMetadata;
  }): Promise<{ success: boolean; message?: string }> {
    try {
      const municipality = Region.createMunicipality(data.name, data.cantonId, data.metadata);
      await this.collection.add(municipality);
      return { success: true };
    } catch (error) {
      console.error('Erro ao criar município:', error);
      return {
        success: false,
        message: this.t('regions.municipalityCreateError')
      };
    }
  }

  async updateRegion(regionId: number, data: Partial<Region>): Promise<{ success: boolean; message?: string }> {
    try {
      const region = this.collection.getById(regionId);
      if (!region) {
        return {
          success: false,
          message: this.t('regions.regionNotFound')
        };
      }

      region.update(data);
      await this.collection.update(region);
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar região:', error);
      return {
        success: false,
        message: this.t('regions.updateError')
      };
    }
  }

  async removeRegion(regionId: number): Promise<{ success: boolean; message?: string }> {
    try {
      await this.collection.remove(regionId);
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover região:', error);
      return {
        success: false,
        message: this.t('regions.removeError')
      };
    }
  }

  async updateMetadata(regionId: number, metadata: RegionMetadata): Promise<{ success: boolean; message?: string }> {
    try {
      await this.collection.updateMetadata(regionId, metadata);
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar metadados:', error);
      return {
        success: false,
        message: this.t('regions.metadataUpdateError')
      };
    }
  }

  async toggleRegionStatus(regionId: number): Promise<{ success: boolean; message?: string }> {
    try {
      const region = this.collection.getById(regionId);
      if (!region) {
        return {
          success: false,
          message: this.t('regions.regionNotFound')
        };
      }

      if (region.isActive) {
        region.deactivate();
      } else {
        region.activate();
      }

      await this.collection.update(region);
      return { success: true };
    } catch (error) {
      console.error('Erro ao alterar status da região:', error);
      return {
        success: false,
        message: this.t('regions.statusUpdateError')
      };
    }
  }

  searchRegions(query: string) {
    return this.collection.searchByName(query).map(r => this.mapRegionToViewModel(r));
  }

  getActiveRegions() {
    return this.collection.getActiveRegions().map(r => this.mapRegionToViewModel(r));
  }

  getRegionHierarchy(regionId: number) {
    const hierarchy = this.collection.getRegionHierarchy(regionId);
    return {
      canton: hierarchy.canton ? this.mapRegionToViewModel(hierarchy.canton) : undefined,
      municipality: hierarchy.municipality ? this.mapRegionToViewModel(hierarchy.municipality) : undefined
    };
  }
} 