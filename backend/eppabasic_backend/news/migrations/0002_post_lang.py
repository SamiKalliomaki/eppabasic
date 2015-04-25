# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('news', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='lang',
            field=models.CharField(default='en', db_index=True, max_length=8),
            preserve_default=True,
        ),
    ]
