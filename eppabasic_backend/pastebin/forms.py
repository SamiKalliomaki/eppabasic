from django.forms import Form, CharField
from pastebin.models import Paste

class MakePasteForm(Form):
    code = CharField()

    def save(self):
        cd = self.cleaned_data
        paste = Paste(code=cd['code'])
        paste.save()

        return paste