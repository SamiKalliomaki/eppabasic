# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import pastebin.models


class Migration(migrations.Migration):

    dependencies = [
        ('pastebin', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='paste',
            name='key',
            field=models.CharField(default=pastebin.models.generate_key, max_length=16, primary_key=True, serialize=False),
        ),
    ]
