from django.http import HttpResponse, JsonResponse
from django.views.generic import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

class AjaxView(View):
    form_class = None
    form_params = {}

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        return super(AjaxView, self).dispatch(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        self.request = request

        form = self.get_form_class()(data=request.POST, **self.get_form_params())

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

    def get_form_params(self):
        return self.form_params