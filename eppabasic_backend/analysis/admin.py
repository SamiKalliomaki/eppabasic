from django.contrib import admin
from django.contrib.admin import ModelAdmin
from django.conf.urls import url
from analysis.models import Entry
from analysis.views import GraphView

class EntryAdmin(ModelAdmin):
    list_display = ('time', 'user')

    def get_urls(self):
        urls = super(EntryAdmin, self).get_urls()
        myUrls = [
            url(r'^graph/', GraphView.as_view()),
        ]
        return myUrls + urls

admin.site.register(Entry, EntryAdmin)
