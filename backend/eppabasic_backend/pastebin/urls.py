from django.conf.urls import patterns, include, url
from pastebin.views import MakePasteView, GetPasteView

urlpatterns = patterns('',
    url(r'^make/', MakePasteView.as_view()),
    url(r'^get/(?P<paste_key>[\w]+)/', GetPasteView.as_view()),
)
