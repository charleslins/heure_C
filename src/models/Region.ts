export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RegionMetadata {
  population?: number;
  language?: string;
  timezone?: string;
  postalCodes?: string[];
}

export class Region {
  id: number;
  name: string;
  code: string;
  type: 'CANTON' | 'MUNICIPALITY';
  parentId?: number; // ID do cantão para municípios
  coordinates?: Coordinates;
  metadata?: RegionMetadata;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(data: Partial<Region>) {
    this.id = data.id || 0;
    this.name = data.name || '';
    this.code = data.code || '';
    this.type = data.type || 'CANTON';
    this.parentId = data.parentId;
    this.coordinates = data.coordinates;
    this.metadata = data.metadata;
    this.isActive = data.isActive ?? true;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      type: this.type,
      parentId: this.parentId,
      coordinates: this.coordinates,
      metadata: this.metadata,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  getDisplayName(): string {
    if (this.type === 'CANTON') {
      return `${this.name} (${this.code})`;
    }
    return this.name;
  }

  isCanton(): boolean {
    return this.type === 'CANTON';
  }

  isMunicipality(): boolean {
    return this.type === 'MUNICIPALITY';
  }

  hasCoordinates(): boolean {
    return !!(this.coordinates?.latitude && this.coordinates?.longitude);
  }

  getMainLanguage(): string | undefined {
    return this.metadata?.language;
  }

  getPostalCodes(): string[] {
    return this.metadata?.postalCodes || [];
  }

  update(data: Partial<Region>): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.code !== undefined) this.code = data.code;
    if (data.coordinates !== undefined) this.coordinates = data.coordinates;
    if (data.metadata !== undefined) {
      this.metadata = {
        ...this.metadata,
        ...data.metadata
      };
    }
    if (data.isActive !== undefined) this.isActive = data.isActive;
    this.updatedAt = new Date().toISOString();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date().toISOString();
  }

  activate(): void {
    this.isActive = true;
    this.updatedAt = new Date().toISOString();
  }

  static createCanton(name: string, code: string, metadata?: RegionMetadata): Region {
    return new Region({
      name,
      code,
      type: 'CANTON',
      metadata
    });
  }

  static createMunicipality(name: string, cantonId: number, metadata?: RegionMetadata): Region {
    return new Region({
      name,
      code: '', // Código será gerado pelo backend
      type: 'MUNICIPALITY',
      parentId: cantonId,
      metadata
    });
  }
} 