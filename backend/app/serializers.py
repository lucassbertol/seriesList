from rest_framework import serializers
from .models import Series

# para converter os JSONs em objetos Python e vice-versa, para facilitar a comunicação entre o frontend e o backend. 
# O serializer é responsável por definir como os dados do modelo Series serão convertidos para JSON e como os dados JSON serão 
# convertidos de volta para objetos Python

class SeriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Series
        fields = '__all__'