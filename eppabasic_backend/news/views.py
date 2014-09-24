from django.http import JsonResponse
from django.conf import settings
from django.views.generic import View
from news.models import Post

class GetNewsView(View):
	def get(self, request, lang):
		posts = Post.objects.filter(lang=lang, is_published=True).order_by('-date_created')[:settings.FRONTPAGE_NEWS_COUNT]

		return JsonResponse({
			'result': 'success',
			'posts': [
				{
					'title': post.title,
					'content': post.content,
					'date': post.date_created
				} for post in posts
			]
		})