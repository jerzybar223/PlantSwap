"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.http import HttpResponse
from .views import UzytkownikViewSet, RegistrationView, PlantViewSet, SwapViewSet, user_plants
from rest_framework.authtoken.views import obtain_auth_token

def home_view(request):
    return HttpResponse("""
        <p>Dostępne endpointy:</p>
        <ul>
            <li><a href="/api/users/">/api/users/</a> - Lista użytkowników</li>
            <li><a href="/admin/">/admin/</a> - Panel administracyjny</li>
        </ul>
    """)

router = DefaultRouter()
router.register(r'users', UzytkownikViewSet, basename='uzytkownik')

router.register(r'plants', PlantViewSet, basename='plants')
router.register(r'swaps', SwapViewSet, basename='swaps')
urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),

    path('api/register/', RegistrationView.as_view(), name='register'),

    path('api/login/', obtain_auth_token, name='login'),

    path('api/my-plants/', user_plants, name='user-plants'),


]

