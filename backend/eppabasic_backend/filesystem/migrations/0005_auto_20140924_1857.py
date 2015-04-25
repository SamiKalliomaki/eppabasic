# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('filesystem', '0004_auto_20140725_1501'),
    ]

    operations = [
        migrations.AlterField(
            model_name='directory',
            name='parent',
            field=models.ForeignKey(blank=True, to='filesystem.Directory', related_name='subdirs', null=True),
        ),
        migrations.AlterField(
            model_name='directoryshare',
            name='directory',
            field=models.ForeignKey(to='filesystem.Directory', related_name='directory_shares'),
        ),
        migrations.AlterField(
            model_name='file',
            name='directory',
            field=models.ForeignKey(to='filesystem.Directory', related_name='files'),
        ),
    ]
