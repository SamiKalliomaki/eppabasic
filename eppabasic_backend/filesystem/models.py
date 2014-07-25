from django.db.models import Model, BooleanField, CharField, DateTimeField, ForeignKey, TextField
from django.db.models.signals import post_delete

class Directory(Model):
	owner = ForeignKey('users.CustomUser')

	parent = ForeignKey('Directory', null=True, blank=True, related_name='subdirs')
	name = CharField(max_length=32)

	is_public = BooleanField(default=False)

	class Meta:
		verbose_name_plural = 'Directories'

	def __str__(self):
		return self.owner.username + ', ' + self.name

class File(Model):
	directory = ForeignKey(Directory, related_name='files')
	name = CharField(max_length=32, db_index=True)
	content = TextField()

	last_edit = DateTimeField(auto_now=True)

class DirectoryShare(Model):
	directory = ForeignKey(Directory, related_name='directory_shares')
	shared_with = ForeignKey('users.CustomUser')
	can_edit = BooleanField(default=None)

def delete_files(sender, instance, **kwargs):
	File.objects.filter(directory=instance).delete()

def delete_shares(sender, instance, **kwargs):
	DirectoryShare.objects.filter(directory=instance).delete()

def delete_subdirs(sender, instance, **kwargs):
	Directory.objects.filter(parent=instance).delete()

post_delete.connect(delete_files, sender=Directory)
post_delete.connect(delete_shares, sender=Directory)
post_delete.connect(delete_subdirs, sender=Directory)