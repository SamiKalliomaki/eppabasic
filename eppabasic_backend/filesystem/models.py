from django.db.models import Model, BooleanField, CharField, DateTimeField, ForeignKey, TextField

class Directory(Model):
	owner = ForeignKey('users.CustomUser')

	parent = ForeignKey('Directory', null=True, blank=True, related_name='subdirs')
	name = CharField(max_length=32)

	is_public = BooleanField(default=False)

	class Meta:
		verbose_name_plural = 'Directories'

	def __str__(self):
		return self.owner.username + ', ' + self.name + ' (' + str(self.pk) + ')'

class File(Model):
	directory = ForeignKey(Directory, related_name='files')
	name = CharField(max_length=32, db_index=True)
	content = TextField()

	last_edit = DateTimeField(auto_now=True)

	def __str__(self):
		return str(self.directory) + ': ' + self.name

class DirectoryShare(Model):
	directory = ForeignKey(Directory, related_name='directory_shares')
	shared_with = ForeignKey('users.CustomUser', null=True, blank=True)
	can_edit = BooleanField(default=None)

	def __str__(self):
		to = str(self.shared_with) if self.shared_with != None else 'EVERYONE'
		mode = 'edit' if self.can_edit else 'read'

		return str(self.directory) + ' -> ' + to + ' (' + mode + ')'