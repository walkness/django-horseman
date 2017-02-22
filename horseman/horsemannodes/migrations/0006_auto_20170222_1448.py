# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-22 19:48
from __future__ import unicode_literals

from django.conf import settings
import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('horsemannodes', '0005_node_url_path'),
    ]

    operations = [
        migrations.AddField(
            model_name='noderevision',
            name='content',
            field=django.contrib.postgres.fields.jsonb.JSONField(default=''),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='noderevision',
            name='created_at',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
        migrations.AddField(
            model_name='noderevision',
            name='user',
            field=models.ForeignKey(default='9dd35bde-a035-486a-b296-69c8649ea5e5', on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
