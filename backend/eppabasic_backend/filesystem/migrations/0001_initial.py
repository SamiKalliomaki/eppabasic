# encoding: utf8
from __future__ import unicode_literals

from django.db import models, migrations
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Directory',
            fields=[
                ('id', models.AutoField(serialize=False, auto_created=True, primary_key=True, verbose_name='ID')),
                ('owner', models.ForeignKey(to_field='id', to=settings.AUTH_USER_MODEL)),
                ('name', models.CharField(max_length=32)),
                ('is_public', models.BooleanField(default=False)),
            ],
            options={
                'verbose_name_plural': 'Directories',
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='DirectoryShare',
            fields=[
                ('id', models.AutoField(serialize=False, auto_created=True, primary_key=True, verbose_name='ID')),
                ('directory', models.ForeignKey(to_field='id', to='filesystem.Directory')),
                ('shared_with', models.ForeignKey(to_field='id', to=settings.AUTH_USER_MODEL)),
                ('can_edit', models.BooleanField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='File',
            fields=[
                ('id', models.AutoField(serialize=False, auto_created=True, primary_key=True, verbose_name='ID')),
                ('directory', models.ForeignKey(to_field='id', to='filesystem.Directory')),
                ('name', models.CharField(max_length=32)),
                ('content', models.TextField()),
                ('last_edit', models.DateTimeField(auto_now=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
