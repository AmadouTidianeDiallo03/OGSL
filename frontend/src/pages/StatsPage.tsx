import React, { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchDatasetsGraphQL } from '@/features/data/dataSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PdfExportButton } from '@/components/common/PdfExportButton';
import { Loader } from '@/components/common/Loader';
import { ErrorState } from '@/components/common/ErrorState';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BarChart3 } from 'lucide-react';

/**
 * Page de statistiques avec graphiques Recharts
 */
export const StatsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { datasets, loading, error } = useAppSelector((state) => state.data);

  useEffect(() => {
    if (datasets.length === 0) {
      dispatch(fetchDatasetsGraphQL({ first: 100 }));
    }
  }, [dispatch, datasets.length]);

  // Données pour le graphique 1: Datasets par thème (Bar Chart)
  const dataByTheme = useMemo(() => {
    const themeCount: Record<string, number> = {};
    datasets.forEach(dataset => {
      const theme = dataset.theme || 'Non spécifié';
      themeCount[theme] = (themeCount[theme] || 0) + 1;
    });
    return Object.entries(themeCount)
      .map(([theme, count]) => ({ theme, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [datasets]);

  // Données pour le graphique 2: Datasets par format de ressource (Pie Chart)
  const dataByFormat = useMemo(() => {
    const formatCount: Record<string, number> = {};
    datasets.forEach(dataset => {
      dataset.resources.forEach(resource => {
        const format = resource.format || 'AUTRE';
        formatCount[format] = (formatCount[format] || 0) + 1;
      });
    });
    return Object.entries(formatCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [datasets]);

  // Données pour le graphique 3: Évolution des datasets par mois (Line Chart)
  const dataByMonth = useMemo(() => {
    const monthCount: Record<string, number> = {};
    datasets.forEach(dataset => {
      if (dataset.metadata_created) {
        const date = new Date(dataset.metadata_created);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthCount[monthKey] = (monthCount[monthKey] || 0) + 1;
      }
    });
    return Object.entries(monthCount)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);
  }, [datasets]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  if (loading && datasets.length === 0) {
    return <Loader text="Chargement des statistiques..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => dispatch(fetchDatasetsGraphQL({ first: 100 }))} />;
  }

  if (datasets.length === 0) {
    return <ErrorState message="Aucune donnée disponible pour les statistiques" />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center">
            <BarChart3 className="mr-3 h-8 w-8" />
            Statistiques & Graphiques
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualisation des données du portail
          </p>
        </div>
        <PdfExportButton 
          elementId="stats-content"
          filename="statistiques-ogsl.pdf"
          title="Statistiques & Graphiques - OGSL Data Portal"
          buttonText="Exporter en PDF"
        />
      </div>

      {/* Conteneur pour l'export PDF */}
      <div id="stats-content" className="space-y-6 bg-background p-6">
        {/* Statistiques générales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{datasets.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Ressources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {datasets.reduce((sum, d) => sum + d.resources.length, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Thèmes Uniques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Set(datasets.map(d => d.theme).filter(Boolean)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Formats Uniques</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {new Set(datasets.flatMap(d => d.resources.map(r => r.format))).size}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphique 1: Datasets par thème (Bar Chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 - Datasets par Thème</CardTitle>
            <CardDescription>
              Distribution des datasets selon leur thématique
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={dataByTheme}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="theme" angle={-45} textAnchor="end" height={120} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Nombre de datasets" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Graphique 2: Formats de ressources (Pie Chart) */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition par Format</CardTitle>
              <CardDescription>
                Distribution des ressources par type de fichier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={dataByFormat}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dataByFormat.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Graphique 3: Évolution temporelle (Line Chart) */}
          <Card>
            <CardHeader>
              <CardTitle>Évolution sur 12 mois</CardTitle>
              <CardDescription>
                Nombre de datasets créés par mois
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={dataByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Datasets créés"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};


