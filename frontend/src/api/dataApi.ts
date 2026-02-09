import axiosClient from './axiosClient';
import { Dataset, Organization, Source, DatasetFilters } from '@/features/data/types';

/**
 * API REST pour les données (datasets, organizations, sources)
 */

export const dataApi = {
  /**
   * Récupération de tous les datasets avec filtres optionnels
   */
  getDatasets: async (filters?: DatasetFilters): Promise<Dataset[]> => {
    const params = new URLSearchParams();
    
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.ordering) {
      params.append('ordering', filters.ordering);
    }
    
    const response = await axiosClient.get<Dataset[]>('/datasets/', {
      params,
    });
    return response.data;
  },

  /**
   * Récupération d'un dataset par ID
   */
  getDatasetById: async (id: number): Promise<Dataset> => {
    const response = await axiosClient.get<Dataset>(`/datasets/${id}/`);
    return response.data;
  },

  /**
   * Récupération de toutes les organizations
   */
  getOrganizations: async (): Promise<Organization[]> => {
    const response = await axiosClient.get<Organization[]>('/organizations/');
    return response.data;
  },

  /**
   * Récupération d'une organization par ID
   */
  getOrganizationById: async (id: number): Promise<Organization> => {
    const response = await axiosClient.get<Organization>(`/organizations/${id}/`);
    return response.data;
  },

  /**
   * Récupération de toutes les sources
   */
  getSources: async (): Promise<Source[]> => {
    const response = await axiosClient.get<Source[]>('/sources/');
    return response.data;
  },

  /**
   * Récupération d'une source par ID
   */
  getSourceById: async (id: number): Promise<Source> => {
    const response = await axiosClient.get<Source>(`/sources/${id}/`);
    return response.data;
  },
};


