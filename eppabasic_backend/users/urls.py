from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required
from users.views import LoginView, LogoutView, RegistrationView, GetUserView

urlpatterns = patterns('',
    url(r'^login/', LoginView.as_view()),
    url(r'^logout/', LogoutView.as_view()),
    url(r'^register/', RegistrationView.as_view()),
    url(r'^get/', GetUserView.as_view()),
)
