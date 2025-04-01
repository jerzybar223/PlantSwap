from django.shortcuts import redirect

def home_redirect(request):
    return redirect("http://localhost:3000")
