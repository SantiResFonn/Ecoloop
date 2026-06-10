import { WasteStation } from "../entities";

export interface CreateStationInput {
  name: string;
  location: string;
  description?: string | null;
  createDefaultBins?: boolean;
}

export interface IStationsRepository {
  listStations(): Promise<WasteStation[]>;
  getStationById(id: string): Promise<WasteStation | null>;
  createStation(data: CreateStationInput): Promise<WasteStation>;
  updateStation(id: string, data: any): Promise<WasteStation>;
  deleteStation(id: string): Promise<WasteStation>;
}
