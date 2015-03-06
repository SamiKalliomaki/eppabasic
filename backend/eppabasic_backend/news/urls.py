from django.conf.urls import patterns, url
from news.views import GetNewsView

urlpatterns = patterns('',
    url(r'^get/(?P<lang>[\w-]+)/', GetNewsView.as_view()),
)
