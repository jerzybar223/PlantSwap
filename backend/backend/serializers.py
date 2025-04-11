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


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = Uzytkownik
        fields = ['username', 'email', 'password', 'password2', 'location', 'photo_url']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password": "Hasła nie są takie same."})
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        return Uzytkownik.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            location=validated_data.get('location', ''),
            photo_url=validated_data.get('photo_url', '')
        )
