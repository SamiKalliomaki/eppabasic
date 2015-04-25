from django.http import JsonResponse
from django.views.generic import View
from django.shortcuts import render
from django.utils.translation import ugettext as _
from eppabasic_backend.views import AjaxView
from pastebin.forms import MakePasteForm
from pastebin.models import Paste

class MakePasteView(AjaxView):
    form_class = MakePasteForm

    def form_valid(self, form):
        key = form.save().key
        return JsonResponse({ 'result': 'success', 'key': key })

class GetPasteView(View):
    def get(self, request, paste_key):
        try:
            paste = Paste.objects.get(key=paste_key)
        except Paste.DoesNotExist:
            return JsonResponse({
                'result': 'fail',
                'errors': {
                    '__all__': [ _('Paste with this ID does not exist') ]
                }
            })

        return JsonResponse({ 'result': 'success', 'code': paste.code })