# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-22 21:04
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('horsemancomments', '0006_auto_20170310_1218'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='akismet_spam',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='comment',
            name='spam',
            field=models.BooleanField(default=False),
        ),
    ]
