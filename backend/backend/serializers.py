from rest_framework import serializers
from .models import Uzytkownik, Plant, Swap, Message
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .utils.crypto import encrypt_message, decrypt_message

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

    def validate_email(self, value):
        try:
            validate_email(value)
        except ValidationError:
            raise serializers.ValidationError("Nieprawidłowy adres e-mail.")
        return value

    def validate_username(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Nazwa użytkownika musi mieć co najmniej 3 znaki.")
        if not value.isalnum():
            raise serializers.ValidationError("Nazwa użytkownika może zawierać tylko litery i cyfry.")
        return value

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


class PlantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plant
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'last_updated', 'user']

    def get_is_owned_by_user(self, obj):
        request = self.context.get('request')
        return request.user.is_authenticated and obj.user == request.user

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Nazwa rośliny nie może być pusta.")
        return value

    def validate_description(self, value):
        if value and len(value) > 1000:
            raise serializers.ValidationError("Opis jest za długi (maks. 1000 znaków).")
        return value

class SwapSerializer(serializers.ModelSerializer):
    offered_plant_name = serializers.SerializerMethodField()
    requested_plant_name = serializers.SerializerMethodField()
    requested_plant_owner_id = serializers.IntegerField(source='requested_plant.user.id', read_only=True)

    class Meta:
        model = Swap
        fields = '__all__'

    def get_offered_plant_name(self, obj):
        return obj.offered_plant.name if obj.offered_plant else None

    def get_requested_plant_name(self, obj):
        return obj.requested_plant.name if obj.requested_plant else None

    def validate_status(self, value):
        if value not in ['pending', 'accepted', 'rejected']:
            raise serializers.ValidationError("Niepoprawny status. Dozwolone wartości: pending, accepted, rejected.")
        return value

class MessageSerializer(serializers.ModelSerializer):
    content = serializers.CharField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'sent_at']
        read_only_fields = ['sender', 'sent_at']

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # odszyfrowujemy content przy odczycie
        ret['content'] = decrypt_message(ret['content'])
        return ret

    def validate_content(self, value):
        if len(value) > 5000:
            raise serializers.ValidationError("Content too long.")
        return value

    def create(self, validated_data):
        # szyfrujemy content przed zapisem
        raw_content = validated_data.pop('content')
        validated_data['content'] = encrypt_message(raw_content)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        if 'content' in validated_data:
            raw_content = validated_data.pop('content')
            validated_data['content'] = encrypt_message(raw_content)
        return super().update(instance, validated_data)