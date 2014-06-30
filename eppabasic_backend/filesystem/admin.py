from django.contrib import admin
from filesystem.models import Directory, File, DirectoryShare

admin.site.register(Directory)
admin.site.register(File)
admin.site.register(DirectoryShare)