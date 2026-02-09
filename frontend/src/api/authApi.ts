import axiosClient from './axiosClient';
import { LoginCredentials, RegisterData, AuthResponse, User } from '@/features/auth/types';

/**
 * API d'authentification
 * Note: Ces endpoints devront être implémentés dans le backend Django
 */

export const authApi = {
  /**
   * Connexion utilisateur
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/login/', credentials);
    return response.data;
  },

  /**
   * Inscription utilisateur
   */
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axiosClient.post<AuthResponse>('/auth/register/', data);
    return response.data;
  },

  /**
   * Récupération du profil utilisateur
   */
  getProfile: async (): Promise<User> => {
    const response = await axiosClient.get<User>('/auth/profile/');
    return response.data;
  },

  /**
   * Déconnexion utilisateur
   */
  logout: async (): Promise<void> => {
    await axiosClient.post('/auth/logout/');
  },

  /**
   * Mise à jour du profil utilisateur
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await axiosClient.patch<User>('/auth/profile/', data);
    return response.data;
  },
};

