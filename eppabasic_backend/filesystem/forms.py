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
        print(f.content)
        f.save()

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
                raise ValidationError("File doesn't exist")