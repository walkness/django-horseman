# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-02-28 03:29
from __future__ import unicode_literals

from django.db import migrations
import timezone_field.fields


class Migration(migrations.Migration):

    dependencies = [
        ('horsemanimages', '0010_auto_20170227_2227'),
    ]

    operations = [
        migrations.AlterField(
            model_name='image',
            name='captured_at_tz',
            field=timezone_field.fields.TimeZoneField(null=True),
        ),
    ]
