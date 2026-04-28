from django.shortcuts import render
from rest_framework import viewsets
from .models import Series
from .serializers import SeriesSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
import requests
import os


# Create your views here.
# requisiçoes HTTP

class SeriesViewSet(viewsets.ModelViewSet):
    queryset = Series.objects.all()
    serializer_class = SeriesSerializer

    @action(detail=False, methods=['get'], url_path='search-tmdb')
    def search_tmdb(self, request):

        """Busca séries na TMDB API"""

        query = request.query_params.get('q', '')
        if not query or len(query) < 2:
            return Response([])
        
        TMDB_API_KEY = os.getenv('TMDB_API_KEY') 
        
        if not TMDB_API_KEY:
            return Response({'error': 'TMDB_API_KEY em backend/app/views.py não configurada'}, status=500)
        
        url = 'https://api.themoviedb.org/3/search/tv'
        
        params = {
            'api_key': TMDB_API_KEY,
            'query': query,
            'language': 'pt-BR'
        }
        
        try:
            response = requests.get(url, params=params)
            data = response.json()
            
            results = []
            for item in data.get('results', []):
                results.append({
                    'tmdb_id': item['id'],
                    'title': item['name'],
                    'description': item['overview'],
                    'poster_path': item.get('poster_path', '')
                })
            return Response(results)
        except Exception as e:
            return Response({'error': str(e)}, status=400)