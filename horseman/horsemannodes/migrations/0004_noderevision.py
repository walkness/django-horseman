# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-22 19:08
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('horsemannodes', '0003_auto_20170222_1408'),
    ]

    operations = [
        migrations.CreateModel(
            name='NodeRevision',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('node', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='horsemannodes.Node')),
            ],
        ),
    ]
