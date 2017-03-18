# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-17 17:52
from __future__ import unicode_literals

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('horsemannodes', '0018_remove_node_modified_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='node',
            name='modified_at',
            field=models.DateTimeField(default=django.utils.timezone.now, editable=False),
        ),
    ]