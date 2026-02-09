import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchDatasets, fetchSources } from '@/features/data/dataSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, BarChart3, Building2, ArrowRight } from 'lucide-react';
import { Loader } from '@/components/common/Loader';
import { ErrorState } from '@/components/common/ErrorState';

/**
 * Page d'accueil
 */
export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { datasets, sources, loading, error } = useAppSelector((state) => state.data);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchDatasets());
      dispatch(fetchSources());
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl mb-4">Bienvenue sur OGSL Data Portal</CardTitle>
            <CardDescription className="text-lg">
              Plateforme de gestion et visualisation des données ouvertes du gouvernement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Connectez-vous pour accéder aux datasets, visualiser des statistiques et exporter des rapports.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/login">
                <Button size="lg">Connexion</Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline">Inscription</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <Loader text="Chargement des données..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => dispatch(fetchDatasets())} />;
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          Bonjour {user?.first_name || user?.username} ! 👋
        </h1>
        <p className="text-lg text-muted-foreground">
          Bienvenue sur votre portail de données ouvertes
        </p>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{datasets.length}</div>
            <p className="text-xs text-muted-foreground">
              Jeux de données disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sources</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sources.length}</div>
            <p className="text-xs text-muted-foreground">
              Sources de données
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ressources</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {datasets.reduce((sum, d) => sum + d.resources.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Fichiers de données
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Explorer les Datasets
            </CardTitle>
            <CardDescription>
              Parcourez et filtrez tous les jeux de données disponibles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/datasets">
              <Button className="w-full">
                Voir les datasets
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Statistiques & Graphiques
            </CardTitle>
            <CardDescription>
              Visualisez les données avec des graphiques interactifs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/stats">
              <Button className="w-full">
                Voir les statistiques
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Datasets récents */}
      <Card>
        <CardHeader>
          <CardTitle>Datasets Récents</CardTitle>
          <CardDescription>
            Les 5 derniers datasets modifiés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {datasets.length > 0 ? (
            <div className="space-y-4">
              {datasets.slice(0, 5).map((dataset) => (
                <Link 
                  key={dataset.id} 
                  to={`/datasets/${dataset.id}`}
                  className="block p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <h3 className="font-medium">{dataset.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {dataset.organization?.title || 'Organisation inconnue'}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Aucun dataset disponible
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


