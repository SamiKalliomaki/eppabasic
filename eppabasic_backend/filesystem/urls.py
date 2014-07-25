from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required
from filesystem.views import GetDirectoryView, OpenFileView, SaveFileView, CreateDirectoryView, DeleteDirectoryView

urlpatterns = patterns('',
    url(r'^directory/root/', login_required(GetDirectoryView.as_view())), # Get the root directory
    url(r'^directory/(?P<directory_id>[0-9]+)/', login_required(GetDirectoryView.as_view())),
    url(r'^open/', login_required(OpenFileView.as_view())),
    url(r'^save/', login_required(SaveFileView.as_view())),
    url(r'^create_directory/', login_required(CreateDirectoryView.as_view())),
    url(r'^delete_directory/', login_required(DeleteDirectoryView.as_view())),
)
