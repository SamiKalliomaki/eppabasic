from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import password_reset_confirm, password_reset_complete
from users.views import LoginView, LogoutView, RegistrationView, GetUserView, PasswordResetView

urlpatterns = patterns('',
    url(r'^login/', LoginView.as_view()),
    url(r'^logout/', LogoutView.as_view()),
    url(r'^register/', RegistrationView.as_view()),
    url(r'^get/', GetUserView.as_view()),
    url(r'^password_reset/', PasswordResetView.as_view()),
    url(r'^confirm_reset/(?P<uidb64>[\d\w\-_]+)/(?P<token>[\d\w-]+)/', password_reset_confirm, name='password_reset_confirm'),
    url(r'^complete_reset/', password_reset_complete, name='password_reset_complete'),
)
