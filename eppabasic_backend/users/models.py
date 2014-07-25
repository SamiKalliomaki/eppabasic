from django.db.models import BooleanField, CharField, DateTimeField, EmailField
from django.db.models.signals import post_save
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager
from django.contrib import admin
from filesystem.models import Directory

# Create your models here.
class CustomUser(AbstractBaseUser, PermissionsMixin):
	REQUIRED_FIELDS = ['email']
	USERNAME_FIELD = 'username'

	username = CharField(max_length=16, unique=True)
	email = EmailField()
	is_staff = BooleanField(default=False)
	is_active   = BooleanField(default=True)
	date_joined = DateTimeField(default=timezone.now)

	objects = UserManager()

	def get_short_name(self):
		return self.get_username()

	def get_full_name(self):
		return self.get_username()

def create_root_directory(sender, instance, created, **kwargs):
	if created:
		directory = Directory()
		directory.owner = instance
		directory.name = 'root'
		directory.save()

post_save.connect(create_root_directory, sender=CustomUser)