from django.http import HttpResponse, JsonResponse
from django.db.models import Q
from django.views.generic import View
from django.shortcuts import get_object_or_404
from eppabasic_backend.views import AjaxView
from filesystem.models import Directory, DirectoryShare
from filesystem.forms import FileForm, SaveFileForm, CreateDirectoryForm, DeleteDirectoryForm

max_dir_depth = 10

def has_rights_dir(user, directory, edit=True):
    if directory.owner == user:
        return True

    p = directory

    while p != None:
        shares = p.directory_shares.filter(Q(shared_with=user.pk) | Q(shared_with=None))
        if edit:
            shares = shares.filter(can_edit=True)

        if shares.count() != 0:
            return True

        p = p.parent

    return False

class GetDirectoryView(View):
    def get(self, request, directory_id=None, *args, **kwargs):
        if directory_id == None:
            directory = Directory.objects.get(owner=request.user, parent=None)
        else:
            directory = get_object_or_404(Directory.objects, pk=int(directory_id))

        if not has_rights_dir(request.user, directory):
            return HttpResponse('Unauthorized', status=401)

        subdirs = [{ 'id': child.pk, 'name': child.name } for child in directory.subdirs.order_by('name').all()]
        files = [f.name for f in directory.files.order_by('name').all()]

        response = {
            'result': 'success',
            'id': directory.pk,
            'name': directory.name,
            'deletable': directory.parent != None and has_rights_dir(request.user, directory, edit=True),

            'content': {
                'subdirs': subdirs,
                'files': files,
            }
        }

        if directory.parent == None and directory.owner == request.user:
            shared_directories = [ share.directory for share in DirectoryShare.objects.filter(Q(shared_with=request.user) | Q(shared_with=None)).order_by('directory__name').all() ]

            response['shared'] = {
                'subdirs': [{ 'id': directory.pk, 'name': directory.name } for directory in shared_directories ],
                'files': []
            }

        return JsonResponse(response)

class SaveFileView(AjaxView):
    form_class = SaveFileForm

    def form_valid(self, form):
        if not has_rights_dir(self.request.user, form.cleaned_data['directory'], edit=True):
            return HttpResponse('Unauthorized', status=401)

        form.save()

        return super(SaveFileView, self).form_valid(form)

class OpenFileView(AjaxView):
    form_class = FileForm

    def form_valid(self, form):
        if not has_rights_dir(self.request.user, form.cleaned_data['directory']):
            return HttpResponse('Unauthorized', status=401)

        return JsonResponse({'result': 'success', 'content': form.file_cache.content})

class CreateDirectoryView(AjaxView):
    form_class = CreateDirectoryForm

    def form_valid(self, form):
        if not has_rights_dir(self.request.user, form.cleaned_data['directory'], edit=True):
            return HttpResponse('Unauthorized', status=401)

        form.save()
        return JsonResponse({'result': 'success'})

class DeleteDirectoryView(AjaxView):
    form_class = DeleteDirectoryForm

    def form_valid(self, form):
        if not has_rights_dir(self.request.user, form.cleaned_data['directory'], edit=True):
            return HttpResponse('Unauthorized', status=401)

        form.delete()
        return JsonResponse({ 'result': 'success' })