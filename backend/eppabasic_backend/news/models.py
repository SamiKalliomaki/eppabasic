from django.db.models import Model, BooleanField, CharField, DateTimeField, TextField
from django.utils import timezone

class Post(Model):
    title = CharField(max_length=256)
    lang = CharField(max_length=8, default='en', db_index=True)
    content = TextField()
    date_created = DateTimeField(default=timezone.now, db_index=True)
    is_published = BooleanField(default=True, db_index=True)

    def __str__(self):
    	return self.title