from django.contrib import admin
from django.contrib.admin import ModelAdmin
from pastebin.models import Paste

class PasteAdmin(ModelAdmin):
    list_display = ('key', 'date_created')
    search_fields = ('key',)

admin.site.register(Paste, PasteAdmin)