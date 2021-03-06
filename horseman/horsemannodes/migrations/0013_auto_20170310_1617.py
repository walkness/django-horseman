# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-10 21:17
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('horsemannodes', '0012_auto_20170310_1610'),
    ]

    operations = [
        migrations.AddField(
            model_name='node',
            name='author',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='nodes', to=settings.AUTH_USER_MODEL, null=True),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='node',
            name='created_by',
            field=models.ForeignKey(editable=False, on_delete=django.db.models.deletion.CASCADE, related_name='created_nodes', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='node',
            name='published_by',
            field=models.ForeignKey(blank=True, editable=False, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='published_nodes', to=settings.AUTH_USER_MODEL),
        ),
    ]
