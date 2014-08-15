from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required
from filesystem.views import GetDirectoryView, OpenFileView, SaveFileView, CreateDirectoryView, DeleteDirectoryView

urlpatterns = patterns('',
    url(r'^directory/root/', GetDirectoryView.as_view()), # Get the root directory
    url(r'^directory/(?P<directory_id>[0-9]+)/', GetDirectoryView.as_view()),
    url(r'^open/', OpenFileView.as_view()),
    url(r'^save/', login_required(SaveFileView.as_view())),
    url(r'^create_directory/', CreateDirectoryView.as_view()),
    url(r'^delete_directory/', DeleteDirectoryView.as_view()),
)
