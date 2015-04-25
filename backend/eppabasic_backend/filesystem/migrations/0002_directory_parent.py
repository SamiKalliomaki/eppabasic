# encoding: utf8
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('filesystem', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='directory',
            name='parent',
            field=models.ForeignKey(to_field='id', null=True, to='filesystem.Directory', blank=True),
            preserve_default=True,
        ),
    ]
