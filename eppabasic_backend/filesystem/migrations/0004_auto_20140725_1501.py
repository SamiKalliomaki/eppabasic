# encoding: utf8
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        ('filesystem', '0003_auto_20140626_1833'),
    ]

    operations = [
        migrations.AlterField(
            model_name='directoryshare',
            name='can_edit',
            field=models.BooleanField(default=None),
        ),
        migrations.AlterField(
            model_name='directoryshare',
            name='shared_with',
            field=models.ForeignKey(to_field='id', null=True, blank=True, to=settings.AUTH_USER_MODEL),
        ),
    ]
