# Generated by Django 5.1.7 on 2025-04-18 09:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0002_plant_swap'),
    ]

    operations = [
        migrations.AlterModelTable(
            name='plant',
            table='plants',
        ),
        migrations.AlterModelTable(
            name='swap',
            table='swaps',
        ),
    ]
