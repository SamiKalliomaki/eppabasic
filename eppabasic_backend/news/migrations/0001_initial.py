# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Post',
            fields=[
                ('id', models.AutoField(primary_key=True, verbose_name='ID', auto_created=True, serialize=False)),
                ('title', models.CharField(max_length=256)),
                ('content', models.TextField()),
                ('date_created', models.DateTimeField(default=django.utils.timezone.now, db_index=True)),
                ('is_published', models.BooleanField(db_index=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
