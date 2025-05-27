from django.shortcuts import redirect

#def home_redirect(request):
#    return redirect("http://localhost:3000")

from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Uzytkownik, Plant, Swap
from django.utils import timezone
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer, UzytkownikSerializer, PlantSerializer, SwapSerializer
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import cloudinary.uploader
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Message
from django.utils.dateparse import parse_datetime
from .serializers import MessageSerializer
from django.conf import settings
import cloudinary
import cloudinary.uploader
class UzytkownikViewSet(viewsets.ModelViewSet):
    queryset = Uzytkownik.objects.all()
    serializer_class = UzytkownikSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        instance.last_activity = timezone.now()
        instance.save()

        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def current_user(self, request):
        if request.user.is_authenticated:
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        return Response({'detail': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

    @action(detail=False, methods=['put'], url_path='update')
    def update_user(self, request):
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(last_activity=timezone.now())
        return Response(serializer.data)


class RegistrationView(generics.CreateAPIView):
    queryset = Uzytkownik.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'user': UzytkownikSerializer(user, context=self.get_serializer_context()).data,
            'token': token.key,
        }, status=status.HTTP_201_CREATED)



class PlantViewSet(viewsets.ModelViewSet):
    queryset = Plant.objects.filter(is_available=True)
    serializer_class = PlantSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        image = self.request.FILES.get('image')
        if image:
            photo_url = upload_image_to_cloudinary(image)
            serializer.save(user=self.request.user, photo_url=photo_url, is_available=True)
        else:
            serializer.save(user=self.request.user, is_available=True)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    @action(detail=False, methods=['get'], permission_classes=[permissions.AllowAny])
    def recent(self, request):
        recent_plants = Plant.objects.filter(is_available=True).order_by('-created_at')[:10]
        serializer = self.get_serializer(recent_plants, many=True)
        return Response(serializer.data)


class SwapViewSet(viewsets.ModelViewSet):
    serializer_class = SwapSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Swap.objects.all()

    def get_queryset(self):
        user = self.request.user
        return Swap.objects.filter(
            offered_plant__user=user
        ) | Swap.objects.filter(requested_plant__user=user)

    def perform_create(self, serializer):
        offered_plant = serializer.validated_data['offered_plant']
        requested_plant = serializer.validated_data['requested_plant']
        if not offered_plant.is_available:
            return Response({"error": "Roślina nie jest dostępna do wymiany."}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        if serializer.validated_data.get('status') == 'accepted':
            plant1 = instance.offered_plant
            plant2 = instance.requested_plant

            plant1.is_available = False
            plant1.save()
            plant2.is_available = False
            plant2.save()

            Swap.objects.filter(
                status='pending',
                offered_plant__in=[plant1, plant2]
            ).exclude(id=instance.id).update(status='rejected')

            Swap.objects.filter(
                status='pending',
                requested_plant__in=[plant1, plant2]
            ).exclude(id=instance.id).update(status='rejected')

        self.perform_update(serializer)

        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_plants(request):
    plants = request.user.plants.filter(is_available=True)
    serializer = PlantSerializer(plants, many=True)
    return Response(serializer.data)

def upload_image_to_cloudinary(image_file):
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
        api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
        api_secret=settings.CLOUDINARY_STORAGE['API_SECRET']
    )
    result = cloudinary.uploader.upload(image_file)
    return result['secure_url']


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    def get_queryset(self):
        user = self.request.user
        queryset = Message.objects.filter(
            sender=user
        ) | Message.objects.filter(
            receiver=user
        )

        # Filtrowanie po czasie wysłania
        sent_after = self.request.query_params.get('sent_after')
        sent_before = self.request.query_params.get('sent_before')

        if sent_after:
            parsed_after = parse_datetime(sent_after)
            if parsed_after:
                queryset = queryset.filter(sent_at__gte=parsed_after)

        if sent_before:
            parsed_before = parse_datetime(sent_before)
            if parsed_before:
                queryset = queryset.filter(sent_at__lte=parsed_before)

        return queryset.order_by('-sent_at')

    @action(detail=False, methods=['get'], url_path='with/(?P<user_id>[^/.]+)')
    def messages_with_user(self, request, user_id=None):
        user = request.user
        queryset = Message.objects.filter(
            sender=user, receiver_id=user_id
        ) | Message.objects.filter(
            sender_id=user_id, receiver=user
        )

        # Filtrowanie w rozmowie 1:1
        sent_after = self.request.query_params.get('sent_after')
        sent_before = self.request.query_params.get('sent_before')

        if sent_after:
            parsed_after = parse_datetime(sent_after)
            if parsed_after:
                queryset = queryset.filter(sent_at__gte=parsed_after)

        if sent_before:
            parsed_before = parse_datetime(sent_before)
            if parsed_before:
                queryset = queryset.filter(sent_at__lte=parsed_before)

        queryset = queryset.order_by('sent_at')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)