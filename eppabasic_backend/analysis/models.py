from django.db.models import Model, DateTimeField, ForeignKey
from django.utils import timezone
from users.models import CustomUser

# Create your models here.
class Entry(Model):
    time = DateTimeField(default=timezone.now)
    user = ForeignKey(CustomUser, null=True)
