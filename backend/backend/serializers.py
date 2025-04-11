from rest_framework import serializers
from .models import Uzytkownik

class UzytkownikSerializer(serializers.ModelSerializer):
    class Meta:
        model = Uzytkownik
        fields = ['id', 'username', 'email', 'location', 'photo_url', 'created_at', 'last_activity']
        read_only_fields = ['id', 'created_at', 'last_activity']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['created_at'] = instance.created_at.strftime('%Y-%m-%d %H:%M:%S')
        representation['last_activity'] = instance.last_activity.strftime('%Y-%m-%d %H:%M:%S')
        return representation
