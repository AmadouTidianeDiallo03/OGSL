from rest_framework import viewsets, filters, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authtoken.models import Token
from catalogue.models import Dataset, Organization, Source
from .serializers import (
    DatasetSerializer, OrganizationSerializer, SourceSerializer,
    RegisterSerializer, LoginSerializer, UserSerializer
)

class DatasetViewSet(viewsets.ReadOnlyModelViewSet):
    """
    read-only: liste + détail des jeux moissonnés (OpenGouv).
    Filtres texte sur title/name/notes, triables.
    """
    queryset = Dataset.objects.select_related("organization", "source").prefetch_related("resources")
    serializer_class = DatasetSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "name", "notes", "theme"]
    ordering_fields = ["metadata_modified", "title"]
    ordering = ["-metadata_modified", "title"]

class OrganizationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Organization.objects.all().order_by("title")
    serializer_class = OrganizationSerializer

class SourceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Source.objects.all().order_by("title")
    serializer_class = SourceSerializer

# Vues d'authentification

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Inscription d'un nouvel utilisateur
    """
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(user).data
        return Response({
            'token': token.key,
            'user': user_data,
            'message': 'Inscription réussie'
        }, status=status.HTTP_201_CREATED)
    return Response({
        "message": "Erreur de validation",
        "errors": serializer.errors,
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Connexion d'un utilisateur existant
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        user_data = UserSerializer(user).data
        return Response({
            'token': token.key,
            'user': user_data,
            'message': 'Connexion réussie'
        }, status=status.HTTP_200_OK)
    return Response({
        "message": "Identifiants invalides",
        "errors": serializer.errors,
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """
    Récupérer ou mettre à jour le profil de l'utilisateur connecté
    """
    user = request.user
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method == 'PATCH':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Déconnexion (suppression du token)
    """
    try:
        request.user.auth_token.delete()
        return Response({'message': 'Déconnexion réussie'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def harvest_view(request):
    """
    Lancer le moissonnage de datasets depuis OpenGouv (CKAN).

    Note TP: dans ce projet, les jeux de données sont collectés uniquement depuis OpenGouv.
    """
    from django.core.management import call_command
    
    source = request.data.get("source", "opengouv")
    count = request.data.get("count", 20)
    keywords = (request.data.get("keywords", "") or "").strip()
    query = (request.data.get("query", "") or "").strip()
    
    # Valider la source
    if source not in ["opengouv", "", None]:
        return Response({
            "message": "Source invalide. Dans ce TP, seule la source 'opengouv' est supportée."
        }, status=status.HTTP_400_BAD_REQUEST)

    # Si aucun query explicite, utiliser les keywords comme query
    if not query and keywords:
        # harvest_auto accepte un seul terme de recherche, on concatène de façon lisible
        query = " OR ".join([k.strip() for k in keywords.split(",") if k.strip()])
    
    try:
        # Appeler la commande OpenGouv (recherche + package_show)
        # harvest_auto: moissonne N datasets (rows=N) depuis package_search, puis package_show pour les détails.
        call_command("harvest_auto", count=count, query=query)
        
        return Response({
            "message": "Moissonnage terminé pour OpenGouv Canada",
            "source": "opengouv",
            "count": count,
            "query": query,
            "success": True,
        }, status=status.HTTP_200_OK)
            
    except Exception as e:
        return Response({
            "message": f"Erreur lors du moissonnage: {str(e)}",
            "success": False,
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
