import random
import string
from django.db.models import Model, CharField, DateTimeField, TextField
from django.utils import timezone

paste_key_length = 6

def generate_key():
    while True:
        key = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(paste_key_length))
        if Paste.objects.filter(key=key).count() == 0:
            return key

class Paste(Model):
    key = CharField(primary_key=True, max_length=16, default=generate_key)
    code = TextField()
    date_created = DateTimeField(default=timezone.now)

    def __str__(self):
        return self.key