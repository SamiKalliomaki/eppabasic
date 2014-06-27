from django.http import HttpResponse, JsonResponse
from django.views.generic import View
from django.shortcuts import get_object_or_404
from eppabasic_backend.views import AjaxView
from filesystem.models import Directory
from filesystem.forms import FileForm, SaveFileForm

def has_rights(user, directory, edit=True):
	if directory.owner == user:
		return True

	shares = directory.directory_shares.filter(shared_with=user.pk)
	if edit:
		shares = shares.filter(can_edit=True)

	if shares.count() != 0:
		return True

class GetDirectoryView(View):
	def get(self, request, directory_id=None, *args, **kwargs):
		if directory_id == None:
			directory = Directory.objects.get(owner=request.user, parent=None)
		else:
			directory = get_object_or_404(Directory.objects, pk=int(directory_id))

		if not has_rights(request.user, directory):
			return HttpResponse('Unauthorized', status=401)

		subdirs = [{ 'id': child.pk, 'name': child.name } for child in directory.subdirs.all()]
		files = [f.name for f in directory.files.all()]

		parent = directory
		parents = []

		while parent != None:
			parents.append({ 'id': parent.pk, 'name': parent.name })
			parent = parent.parent
		parents.reverse()

		return JsonResponse({'result': 'success', 'id': directory.pk, 'subdirs': subdirs, 'files': files, 'parents': parents})

class SaveFileView(AjaxView):
	form_class = SaveFileForm

	def form_valid(self, form):
		if not has_rights(self.request.user, form.cleaned_data['directory'], edit=True):
			return HttpResponse('Unauthorized', status=401)

		form.save()

		return super(SaveFileView, self).form_valid(form)

class OpenFileView(AjaxView):
	form_class = FileForm

	def form_valid(self, form):
		if not has_rights(self.request.user, form.cleaned_data['directory']):
			return HttpResponse('Unauthorized', status=401)

		return JsonResponse({'result': 'success', 'content': form.file_cache.content})