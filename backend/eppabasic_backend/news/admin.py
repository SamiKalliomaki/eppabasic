from django.contrib import admin
from django.contrib.admin import ModelAdmin
from news.models import Post

class PostAdmin(ModelAdmin):
    list_display = ('title', 'date_created')
    search_fields = ('id', 'title',)
    list_filter = ('date_created',)

admin.site.register(Post, PostAdmin)