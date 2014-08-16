from django.contrib import admin
from django.contrib.admin import ModelAdmin
from filesystem.models import Directory, File, DirectoryShare

class DirectoryAdmin(ModelAdmin):
    list_display = ('id', 'owner', 'name', 'parent', 'is_public')
    search_fields = ('id', 'name')
    list_filter = ('is_public',)

class FileAdmin(ModelAdmin):
    list_display = ('id', 'directory', 'name', 'last_edit')
    search_fields = ('id', 'name')
    list_filter = ('last_edit',)

class DirectoryShareAdmin(ModelAdmin):
    list_display = ('id', 'directory', 'shared_with', 'can_edit')
    search_fields = ('id', 'name')
    list_filter = ('can_edit',)

admin.site.register(Directory, DirectoryAdmin)
admin.site.register(File, FileAdmin)
admin.site.register(DirectoryShare, DirectoryShareAdmin)