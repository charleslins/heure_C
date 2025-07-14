import { Region, RegionMetadata } from "../models/Region";
import { supabase } from "../utils/supabaseClient";

export class RegionCollection {
  private regions: Region[] = [];
  private cantons: Region[] = [];
  private municipalities: Map<number, Region[]> = new Map(); // Map<CantonId, Municipality[]>

  constructor(initialRegions: Region[] = []) {
    this.setRegions(initialRegions);
  }

  private setRegions(regions: Region[]) {
    this.regions = regions;
    this.cantons = regions.filter((r) => r.isCanton());

    // Agrupar municípios por cantão
    this.municipalities.clear();
    regions
      .filter((r) => r.isMunicipality())
      .forEach((municipality) => {
        if (!municipality.parentId) return;

        const municipalities =
          this.municipalities.get(municipality.parentId) || [];
        municipalities.push(municipality);
        this.municipalities.set(municipality.parentId, municipalities);
      });
  }

  async loadAll(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .order("type", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;

      this.setRegions((data || []).map((r) => new Region(r)));
    } catch (error) {
      console.error("Erro ao carregar regiões:", error);
      throw error;
    }
  }

  async loadCantons(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .eq("type", "CANTON")
        .order("name");

      if (error) throw error;

      this.cantons = (data || []).map((r) => new Region(r));
      this.regions = [...this.cantons, ...this.getMunicipalities()];
    } catch (error) {
      console.error("Erro ao carregar cantões:", error);
      throw error;
    }
  }

  async loadMunicipalitiesForCanton(cantonId: number): Promise<void> {
    try {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .eq("type", "MUNICIPALITY")
        .eq("parentId", cantonId)
        .order("name");

      if (error) throw error;

      const municipalities = (data || []).map((r) => new Region(r));
      this.municipalities.set(cantonId, municipalities);
      this.regions = [...this.cantons, ...this.getMunicipalities()];
    } catch (error) {
      console.error("Erro ao carregar municípios:", error);
      throw error;
    }
  }

  getAll(): Region[] {
    return this.regions;
  }

  getCantons(): Region[] {
    return this.cantons;
  }

  getMunicipalities(cantonId?: number): Region[] {
    if (cantonId) {
      return this.municipalities.get(cantonId) || [];
    }
    return Array.from(this.municipalities.values()).flat();
  }

  getById(id: number): Region | undefined {
    return this.regions.find((r) => r.id === id);
  }

  getByCode(code: string): Region | undefined {
    return this.regions.find((r) => r.code === code);
  }

  async add(region: Region): Promise<void> {
    try {
      const { data, error } = await supabase
        .from("regions")
        .insert(region.toJSON())
        .select()
        .single();

      if (error) throw error;

      const newRegion = new Region(data);
      if (newRegion.isCanton()) {
        this.cantons.push(newRegion);
      } else if (newRegion.parentId) {
        const municipalities =
          this.municipalities.get(newRegion.parentId) || [];
        municipalities.push(newRegion);
        this.municipalities.set(newRegion.parentId, municipalities);
      }
      this.regions.push(newRegion);
    } catch (error) {
      console.error("Erro ao adicionar região:", error);
      throw error;
    }
  }

  async update(region: Region): Promise<void> {
    try {
      const { error } = await supabase
        .from("regions")
        .update(region.toJSON())
        .eq("id", region.id);

      if (error) throw error;

      const index = this.regions.findIndex((r) => r.id === region.id);
      if (index !== -1) {
        this.regions[index] = region;

        if (region.isCanton()) {
          const cantonIndex = this.cantons.findIndex((c) => c.id === region.id);
          if (cantonIndex !== -1) {
            this.cantons[cantonIndex] = region;
          }
        } else if (region.parentId) {
          const municipalities = this.municipalities.get(region.parentId) || [];
          const municipalityIndex = municipalities.findIndex(
            (m) => m.id === region.id,
          );
          if (municipalityIndex !== -1) {
            municipalities[municipalityIndex] = region;
            this.municipalities.set(region.parentId, municipalities);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar região:", error);
      throw error;
    }
  }

  async remove(regionId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from("regions")
        .delete()
        .eq("id", regionId);

      if (error) throw error;

      const region = this.regions.find((r) => r.id === regionId);
      if (!region) return;

      this.regions = this.regions.filter((r) => r.id !== regionId);

      if (region.isCanton()) {
        this.cantons = this.cantons.filter((c) => c.id !== regionId);
        this.municipalities.delete(regionId);
      } else if (region.parentId) {
        const municipalities = this.municipalities.get(region.parentId) || [];
        this.municipalities.set(
          region.parentId,
          municipalities.filter((m) => m.id !== regionId),
        );
      }
    } catch (error) {
      console.error("Erro ao remover região:", error);
      throw error;
    }
  }

  async updateMetadata(
    regionId: number,
    metadata: RegionMetadata,
  ): Promise<void> {
    const region = this.getById(regionId);
    if (!region) throw new Error("Região não encontrada");

    region.update({ metadata });
    await this.update(region);
  }

  getActiveRegions(): Region[] {
    return this.regions.filter((r) => r.isActive);
  }

  getActiveCantons(): Region[] {
    return this.cantons.filter((r) => r.isActive);
  }

  getActiveMunicipalities(cantonId?: number): Region[] {
    return this.getMunicipalities(cantonId).filter((r) => r.isActive);
  }

  searchByName(query: string): Region[] {
    const normalizedQuery = query.toLowerCase();
    return this.regions.filter(
      (r) =>
        r.name.toLowerCase().includes(normalizedQuery) ||
        r.code.toLowerCase().includes(normalizedQuery),
    );
  }

  getRegionHierarchy(regionId: number): {
    canton?: Region;
    municipality?: Region;
  } {
    const region = this.getById(regionId);
    if (!region) return {};

    if (region.isCanton()) {
      return { canton: region };
    }

    if (region.isMunicipality() && region.parentId) {
      const canton = this.getById(region.parentId);
      return { canton, municipality: region };
    }

    return {};
  }
}
