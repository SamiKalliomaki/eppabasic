from django.contrib import admin
from django.contrib.admin import ModelAdmin
from analysis.models import Entry

class EntryAdmin(ModelAdmin):
    list_display = ('time', 'user')

admin.site.register(Entry, EntryAdmin)
