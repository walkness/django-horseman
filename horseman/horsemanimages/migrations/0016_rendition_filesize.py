# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-04-04 21:23
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('horsemanimages', '0015_image_filesize'),
    ]

    operations = [
        migrations.AddField(
            model_name='rendition',
            name='filesize',
            field=models.PositiveIntegerField(blank=True, null=True),
        ),
    ]
