# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-22 19:40
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('horsemannodes', '0004_noderevision'),
    ]

    operations = [
        migrations.AddField(
            model_name='node',
            name='url_path',
            field=models.TextField(default='', editable=False),
            preserve_default=False,
        ),
    ]
