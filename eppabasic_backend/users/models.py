from django.db.models import BooleanField, CharField, DateTimeField, EmailField
from django.utils import timezone
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, UserManager
from django.contrib import admin

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