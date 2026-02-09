import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, CheckCircle, XCircle, Database } from 'lucide-react';
import axiosClient from '@/api/axiosClient';

/**
 * Page de moissonnage de données depuis les sources CKAN
 */
export const HarvestPage: React.FC = () => {
  const [count, setCount] = useState<number>(20);
  const [keywords, setKeywords] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleHarvest = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await axiosClient.post('/harvest/', {
        // Note TP: la source est verrouillée côté backend à OpenGouv
        source: 'opengouv',
        count: count,
        keywords: keywords,
      });

      setResult({
        success: true,
        message: response.data.message || 'Moissonnage terminé avec succès'
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.message || 'Erreur lors du moissonnage'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center justify-center">
          <Download className="mr-3 h-8 w-8" />
          Moissonnage de Données
        </h1>
        <p className="text-muted-foreground">
          Importez des datasets depuis les catalogues CKAN
        </p>
      </div>

      {/* Résultat */}
      {result && (
        <Card className={result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              {result.success ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <p className={result.success ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                {result.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuration du moissonnage */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration du moissonnage</CardTitle>
          <CardDescription>
            Importez des datasets depuis OpenGouv Canada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Source fixe */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Source de données</label>
            <Card className="border-primary border-2 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <span className="text-3xl">🇨🇦</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">OpenGouv Canada</h3>
                    <p className="text-xs text-muted-foreground">
                      Données ouvertes du gouvernement du Canada (CKAN)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nombre de datasets */}
          <div className="space-y-2">
            <label htmlFor="count" className="text-sm font-medium">
              Nombre de datasets à moissonner
            </label>
            <Input
              id="count"
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 20)}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground">
              Recommandé: 20-50 datasets par moissonnage
            </p>
          </div>

          {/* Mots-clés (optionnel) */}
          <div className="space-y-2">
            <label htmlFor="keywords" className="text-sm font-medium">
              Mots-clés (optionnel)
            </label>
            <Input
              id="keywords"
              type="text"
              placeholder="Ex: eau, environnement, climat"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Séparez les mots-clés par des virgules pour filtrer les résultats
            </p>
          </div>

          {/* Exemples de mots-clés */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Exemples de thématiques</label>
            <div className="flex flex-wrap gap-2">
              {['eau', 'environnement', 'santé', 'économie', 'éducation', 'transport', 'climat'].map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => setKeywords(keyword)}
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>

          {/* Bouton de moissonnage */}
          <Button
            onClick={handleHarvest}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Moissonnage en cours...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Lancer le moissonnage
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Informations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Informations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm space-y-2">
            <p>
              <strong>Source CKAN supportée:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
              <li>OpenGouv: Données ouvertes du gouvernement du Canada</li>
            </ul>
            <p className="pt-3">
              <strong>Note:</strong> Le moissonnage peut prendre plusieurs minutes selon le nombre de datasets sélectionnés.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

