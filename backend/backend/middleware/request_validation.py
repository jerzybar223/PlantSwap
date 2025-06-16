import json
from django.http import JsonResponse

class ValidateJSONMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # Ścieżki bez Authorization
        self.exempt_paths = ['/api/register/', '/api/login/']

    def __call__(self, request):
        if request.path.startswith('/api/'):
            user_agent = request.headers.get('User-Agent')
            if not user_agent:
                return JsonResponse({'error': 'Missing User-Agent header.'}, status=400)

            # Sprawdzamy Authorization tylko dla ścieżek, które nie są wykluczone
            if (request.path not in self.exempt_paths and
                request.method in ['POST', 'PUT', 'PATCH', 'DELETE']):
                auth_header = request.headers.get('Authorization')
                if not auth_header:
                    return JsonResponse({'error': 'Missing Authorization header.'}, status=401)

            # Sprawdzamy JSON tylko dla metod, które mogą zawierać body
            if request.method in ['POST', 'PUT', 'PATCH']:
                content_type = request.headers.get('Content-Type', '')
                if 'application/json' in content_type:
                    try:
                        body = request.body.decode('utf-8')
                        if len(body) > 5 * 1024:  # limit 5 KB
                            return JsonResponse({'error': 'JSON payload too large (limit: 5 KB).'}, status=413)
                        json.loads(body)
                    except json.JSONDecodeError:
                        return JsonResponse({'error': 'Invalid JSON format.'}, status=400)

        return self.get_response(request)
