# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-07 23:54
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('horsemannodes', '0009_node_published'),
    ]

    operations = [
        migrations.AddField(
            model_name='node',
            name='created_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='created_nodes', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='node',
            name='published_by',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='published_nodes', to=settings.AUTH_USER_MODEL),
        ),
    ]