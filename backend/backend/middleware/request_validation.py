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
            auth_header = request.headers.get('Authorization')
            if (request.path not in self.exempt_paths and
                request.method in ['POST', 'PUT', 'PATCH', 'DELETE'] and
                not auth_header):
                return JsonResponse({'error': 'Missing Authorization header.'}, status=401)

            if request.content_type == 'application/json' and request.method in ['POST', 'PUT', 'PATCH']:
                try:
                    body = request.body.decode('utf-8')

                    if len(body) > 5 * 1024:  # limit 5 KB
                        return JsonResponse({'error': 'JSON payload too large (limit: 5 KB).'}, status=413)

                    json.loads(body)
                except json.JSONDecodeError:
                    return JsonResponse({'error': 'Invalid JSON format.'}, status=400)

        return self.get_response(request)
