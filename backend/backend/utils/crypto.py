from cryptography.fernet import Fernet
from django.conf import settings

# Klucz szyfrowania powinien być w settings.py (wygeneruj go raz i zachowaj)
# Możesz wygenerować klucz w konsoli python:
# >>> from cryptography.fernet import Fernet
# >>> Fernet.generate_key()
# b'your-generated-key'

fernet = Fernet(settings.ENCRYPTION_KEY)

def encrypt_message(message: str) -> str:
    return fernet.encrypt(message.encode()).decode()

def decrypt_message(token: str) -> str:
    return fernet.decrypt(token.encode()).decode()
