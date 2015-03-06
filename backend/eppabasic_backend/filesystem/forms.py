from django.forms import Form, ValidationError, CharField, RegexField, ModelChoiceField
from django.utils.translation import ugettext, ugettext_lazy as _
from filesystem.models import Directory, File

class SaveFileForm(Form):
    directory = ModelChoiceField(queryset=Directory.objects)
    filename = RegexField(
        max_length=32,
        regex=r'^[\w]+$',
        error_messages={
            'invalid': _('This value may contain only letters, numbers and _ characters.')
        }
    )
    content = CharField(required=False)

    def save(self):
        cd = self.cleaned_data

        f = File.objects.get_or_create(directory=cd['directory'], name=cd['filename'])[0]
        f.content = cd['content']
        f.save()

        return f

class FileForm(Form):
    directory = ModelChoiceField(queryset=Directory.objects)
    filename = RegexField(
        max_length=32,
        regex=r'^[\w]+$',
        error_messages={
            'invalid': _('This value may contain only letters, numbers and _ characters.')
        }
    )

    def clean(self):
        cd = self.cleaned_data
        directory = cd.get('directory')
        filename = cd.get('filename')

        if directory and filename:
            try:
                self.file_cache = File.objects.filter(directory=directory, name=filename).get()
            except File.DoesNotExist:
                raise ValidationError(_("File doesn't exist"))

class CreateDirectoryForm(Form):
    directory = ModelChoiceField(queryset=Directory.objects)
    name = RegexField(
        max_length=32,
        regex=r'^[\w]+$',
        error_messages={
            'invalid': _('This value may contain only letters, numbers and _ characters.')
        }
    )

    def clean(self):
        cd = self.cleaned_data
        directory = cd.get('directory')
        name = cd.get('name')

        if directory and name:
            if Directory.objects.filter(parent=directory, name=name).count() != 0:
                raise ValidationError(_('Directory already exists'))

    def save(self):
        cd = self.cleaned_data
        d = Directory(parent=cd['directory'], owner=cd['directory'].owner, name=cd['name'])
        d.save()

        return d

class DeleteDirectoryForm(Form):
    directory = ModelChoiceField(queryset=Directory.objects)

    def clean(self):
        cd = self.cleaned_data
        directory = cd.get('directory')

        if directory and directory.parent == None:
            raise ValidationError(_('Root directory cannot be deleted.'))

    def delete(self):
        cd = self.cleaned_data
        cd['directory'].delete()
