# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-22 20:42
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('horsemannodes', '0007_auto_20170222_1541'),
    ]

    operations = [
        migrations.AlterField(
            model_name='node',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now, editable=False),
        ),
        migrations.AlterField(
            model_name='node',
            name='modified_at',
            field=models.DateTimeField(default=django.utils.timezone.now, editable=False),
        ),
        migrations.AlterField(
            model_name='node',
            name='published_at',
            field=models.DateTimeField(editable=False, null=True),
        ),
    ]
