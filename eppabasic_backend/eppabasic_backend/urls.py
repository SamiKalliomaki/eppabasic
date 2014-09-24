from django.conf.urls import patterns, include, url
from django.contrib import admin
from eppabasic_backend import settings

admin.autodiscover()

urlpatterns = patterns('', url(r'^%s' % settings.SUB_SITE, include([
    url(r'^user/', include('users.urls')),
    url(r'^fs/', include('filesystem.urls')),
    url(r'^paste/', include('pastebin.urls')),
    url(r'^news/', include('news.urls')),
    url(r'^admin/', include(admin.site.urls))
])))
