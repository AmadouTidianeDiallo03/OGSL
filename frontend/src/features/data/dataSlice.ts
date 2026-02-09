import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { dataApi } from '@/api/dataApi';
import { executeGraphQLQuery, graphqlQueries } from '@/api/graphqlClient';
import { DataState, Dataset, Organization, Source, DatasetFilters } from './types';

/**
 * State initial pour les données
 */
const initialState: DataState = {
  datasets: [],
  currentDataset: null,
  organizations: [],
  sources: [],
  loading: false,
  error: null,
  filters: {},
  totalCount: 0,
  pagination: {
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

/**
 * Thunks asynchrones pour les opérations sur les données
 */

// REST API
export const fetchDatasets = createAsyncThunk(
  'data/fetchDatasets',
  async (filters: DatasetFilters | undefined, { rejectWithValue }) => {
    try {
      const datasets = await dataApi.getDatasets(filters);
      return datasets;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de récupération des datasets');
    }
  }
);

export const fetchDatasetById = createAsyncThunk(
  'data/fetchDatasetById',
  async (id: number, { rejectWithValue }) => {
    try {
      const dataset = await dataApi.getDatasetById(id);
      return dataset;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de récupération du dataset');
    }
  }
);

// GraphQL
export const fetchDatasetsGraphQL = createAsyncThunk(
  'data/fetchDatasetsGraphQL',
  async (variables: Record<string, any> | undefined, { rejectWithValue }) => {
    try {
      const response = await executeGraphQLQuery<{ datasets: Dataset[] }>(
        graphqlQueries.GET_DATASETS,
        variables
      );
      return response.datasets;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur GraphQL de récupération des datasets');
    }
  }
);

export const fetchDatasetByIdGraphQL = createAsyncThunk(
  'data/fetchDatasetByIdGraphQL',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await executeGraphQLQuery<{ dataset: Dataset }>(
        graphqlQueries.GET_DATASET,
        { id }
      );
      return response.dataset;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur GraphQL de récupération du dataset');
    }
  }
);

export const fetchOrganizations = createAsyncThunk(
  'data/fetchOrganizations',
  async (_, { rejectWithValue }) => {
    try {
      const organizations = await dataApi.getOrganizations();
      return organizations;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de récupération des organizations');
    }
  }
);

export const fetchSources = createAsyncThunk(
  'data/fetchSources',
  async (_, { rejectWithValue }) => {
    try {
      const sources = await dataApi.getSources();
      return sources;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur de récupération des sources');
    }
  }
);

export const fetchSourcesGraphQL = createAsyncThunk(
  'data/fetchSourcesGraphQL',
  async (_, { rejectWithValue }) => {
    try {
      const response = await executeGraphQLQuery<{ sources: Source[] }>(
        graphqlQueries.GET_SOURCES
      );
      return response.sources;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Erreur GraphQL de récupération des sources');
    }
  }
);

/**
 * Slice Redux pour les données
 */
const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<DatasetFilters>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearCurrentDataset: (state) => {
      state.currentDataset = null;
    },
    setPagination: (state, action: PayloadAction<{ page: number; pageSize: number }>) => {
      state.pagination.page = action.payload.page;
      state.pagination.pageSize = action.payload.pageSize;
    },
  },
  extraReducers: (builder) => {
    // Fetch datasets (REST)
    builder.addCase(fetchDatasets.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDatasets.fulfilled, (state, action) => {
      state.loading = false;
      state.datasets = action.payload;
      state.totalCount = action.payload.length;
      state.error = null;
    });
    builder.addCase(fetchDatasets.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch dataset by ID (REST)
    builder.addCase(fetchDatasetById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDatasetById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentDataset = action.payload;
      state.error = null;
    });
    builder.addCase(fetchDatasetById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch datasets (GraphQL)
    builder.addCase(fetchDatasetsGraphQL.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDatasetsGraphQL.fulfilled, (state, action) => {
      state.loading = false;
      state.datasets = action.payload;
      state.totalCount = action.payload.length;
      state.error = null;
    });
    builder.addCase(fetchDatasetsGraphQL.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch dataset by ID (GraphQL)
    builder.addCase(fetchDatasetByIdGraphQL.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDatasetByIdGraphQL.fulfilled, (state, action) => {
      state.loading = false;
      state.currentDataset = action.payload;
      state.error = null;
    });
    builder.addCase(fetchDatasetByIdGraphQL.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch organizations
    builder.addCase(fetchOrganizations.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchOrganizations.fulfilled, (state, action) => {
      state.loading = false;
      state.organizations = action.payload;
      state.error = null;
    });
    builder.addCase(fetchOrganizations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch sources
    builder.addCase(fetchSources.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSources.fulfilled, (state, action) => {
      state.loading = false;
      state.sources = action.payload;
      state.error = null;
    });
    builder.addCase(fetchSources.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch sources (GraphQL)
    builder.addCase(fetchSourcesGraphQL.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSourcesGraphQL.fulfilled, (state, action) => {
      state.loading = false;
      state.sources = action.payload;
      state.error = null;
    });
    builder.addCase(fetchSourcesGraphQL.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError, setFilters, clearFilters, clearCurrentDataset, setPagination } = dataSlice.actions;
export default dataSlice.reducer;

