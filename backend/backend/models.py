from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.utils import timezone


class UzytkownikManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)


class Uzytkownik(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=100, unique=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    photo_url = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    last_activity = models.DateTimeField(default=timezone.now)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UzytkownikManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.username

    class Meta:
        db_table = 'users'

class Plant(models.Model):
    user = models.ForeignKey(Uzytkownik, on_delete=models.CASCADE, related_name='plants')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    photo_url = models.TextField(blank=True, null=True)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    last_updated = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'plants'

class Swap(models.Model):
    offered_plant = models.ForeignKey(Plant, on_delete=models.CASCADE, related_name='offered_swaps')
    requested_plant = models.ForeignKey(Plant, on_delete=models.CASCADE, related_name='requested_swaps')
    status = models.CharField(max_length=20, default='pending')  # pending / accepted / rejected
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        db_table = 'swaps'

class Message(models.Model):
    sender = models.ForeignKey('Uzytkownik', on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey('Uzytkownik', on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    sent_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.sender.username} -> {self.receiver.username}: {self.content[:30]}"

    class Meta:
        db_table = 'messages'
        ordering = ['-sent_at']
