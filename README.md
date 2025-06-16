# 🌱 PlantSwap

Platforma do wymiany roślin – projekt Django + React.

## 📁 Struktura projektu

- `backend/` – Django REST API
- `frontend/` – React frontend

---

## 🚀 Jak uruchomić projekt lokalnie

### 1. Backend (Django)

#### ✅ Wymagania:
### Backend:
- Python 3.10 lub nowszy
- `virtualenv` (opcjonalnie)
- pip

### Frontend:
- Node.js (zalecana wersja 18+)
- npm lub yarn

---

## 🚀 Uruchamianie projektu lokalnie

### 1. Uruchomienie backendu (Django)

#### 🔧 Krok 1: Wejdź do folderu backend
```bash
cd backend
```
🔧 Krok 2: Utwórz i aktywuj środowisko wirtualne
```bash
python -m venv .venv
```
##### Aktywacja:
##### Na Windows:
```bash
.venv\Scripts\activate
```
##### Na macOS/Linux:
```bash
source .venv/bin/activate
```
🔧 Krok 3: Zainstaluj zależności
```bash
pip install -r requirements.txt
```
🔧 Krok 4: Wykonaj migracje i uruchom serwer
```bash
python manage.py migrate
python manage.py runserver
```
Backend będzie dostępny pod: http://127.0.0.1:8000/

### 2. Uruchomienie frontend (React)

#### 🔧 Krok 1: Przejdź do folderu `frontend`
```bash
cd frontend
```
🔧 Krok 2: Zainstaluj zależności
```bash
npm install
```
🔧 Krok 3: Uruchom aplikację
```bash
npm start
```
Frontend będzie dostępny pod adresem:
👉 http://localhost:3000/