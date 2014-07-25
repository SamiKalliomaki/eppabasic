from django.http import JsonResponse
from django.shortcuts import render
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import View
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.forms import AuthenticationForm
from eppabasic_backend.views import AjaxView
from users.forms import RegistrationForm

class LoginView(AjaxView):
    form_class = AuthenticationForm

    def form_valid(self, form):
        user = form.user_cache
        login(self.request, user)

        return JsonResponse({'result': 'success', 'username': user.username})

class LogoutView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(LogoutView, self).dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        logout(request)

        return JsonResponse({'result': 'success'})

class RegistrationView(AjaxView):
    form_class = RegistrationForm

    def form_valid(self, form):
        user = form.save()
        user.backend = 'django.contrib.auth.backends.ModelBackend'
        login(self.request, user)

        return JsonResponse({'result': 'success', 'username': user.username})

class GetUserView(View):
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated():
            return JsonResponse({'authenticated': True, 'username': request.user.username})
        else:
            return JsonResponse({'authenticated': False})