# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-05-31 20:47
from __future__ import unicode_literals

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models
import timezone_field.fields


class Migration(migrations.Migration):

    dependencies = [
        ('horsemanimages', '0018_auto_20170509_2007'),
    ]

    operations = [
        migrations.AlterField(
            model_name='image',
            name='captured_at_tz',
            field=timezone_field.fields.TimeZoneField(null=True, verbose_name='Captured in timezone'),
        ),
        migrations.AlterField(
            model_name='image',
            name='exif_data',
            field=django.contrib.postgres.fields.jsonb.JSONField(blank=True, editable=False, null=True),
        ),
        migrations.AlterField(
            model_name='image',
            name='filesize',
            field=models.PositiveIntegerField(blank=True, editable=False, null=True),
        ),
    ]
