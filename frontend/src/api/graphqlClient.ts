import axios, { AxiosInstance } from 'axios';

/**
 * Client GraphQL pour interroger l'API Django GraphQL
 */

const graphqlClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8000/graphql/',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fonction générique pour exécuter une query GraphQL
 */
export const executeGraphQLQuery = async <T = any>(
  query: string,
  variables?: Record<string, any>
): Promise<T> => {
  try {
    const response = await graphqlClient.post('', {
      query,
      variables,
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data as T;
  } catch (error) {
    console.error('GraphQL query error:', error);
    throw error;
  }
};

/**
 * Queries GraphQL prédéfinies
 */
export const graphqlQueries = {
  // Récupérer tous les datasets avec filtres
  GET_DATASETS: `
    query GetDatasets($search: String, $theme: String, $format: String, $first: Int, $skip: Int, $orderBy: String) {
      datasets(search: $search, theme: $theme, format: $format, first: $first, skip: $skip, orderBy: $orderBy) {
        id
        ckanId
        name
        title
        notes
        theme
        metadataCreated
        metadataModified
        organization {
          id
          title
          name
        }
        source {
          id
          slug
          title
        }
        resources {
          id
          ckanId
          name
          format
          url
        }
      }
    }
  `,

  // Récupérer un dataset par ID
  GET_DATASET: `
    query GetDataset($id: Int!) {
      dataset(id: $id) {
        id
        ckanId
        name
        title
        notes
        theme
        metadataCreated
        metadataModified
        organization {
          id
          title
          name
        }
        source {
          id
          slug
          title
        }
        resources {
          id
          ckanId
          name
          format
          url
        }
      }
    }
  `,

  // Récupérer toutes les sources
  GET_SOURCES: `
    query GetSources {
      sources {
        id
        slug
        title
      }
    }
  `,

  // Récupérer toutes les organizations
  GET_ORGANIZATIONS: `
    query GetOrganizations($search: String) {
      organizations(search: $search) {
        id
        ckanId
        name
        title
        source {
          id
          slug
          title
        }
      }
    }
  `,
};

export default graphqlClient;


