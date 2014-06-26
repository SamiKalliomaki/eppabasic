from django.http import HttpResponse, JsonResponse
from django.views.generic import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

class AjaxView(View):
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(AjaxView, self).dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        self.request = request

        form = self.get_form_class()(data=request.POST)

        print(request.GET)
        print(request.POST)
        print(form.is_valid())


        if form.is_valid():
            return self.form_valid(form)
        else:
            return self.form_invalid(form)

    def form_valid(self, form):
        return JsonResponse({'result': 'success'})

    def form_invalid(self, form):
        return JsonResponse({'result': 'fail', 'errors': form.errors})

    def get_form_class(self):
        return self.form_class

class LoginRequiredMixin(object):
    @method_decorator(login_required)
    def dispatch(self, request, *args, **kwargs):
        return super(LoginRequiredMixin, self).dispatch(request, *args, **kwargs)
