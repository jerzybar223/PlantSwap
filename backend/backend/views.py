from django.shortcuts import redirect

#def home_redirect(request):
#    return redirect("http://localhost:3000")

from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Uzytkownik
from django.utils import timezone
from rest_framework.authtoken.models import Token
from .serializers import RegisterSerializer, UzytkownikSerializer
from rest_framework.permissions import AllowAny
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