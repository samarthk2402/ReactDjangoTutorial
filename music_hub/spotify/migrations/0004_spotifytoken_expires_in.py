# Generated by Django 5.0.7 on 2024-07-24 16:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('spotify', '0003_remove_spotifytoken_expires_in'),
    ]

    operations = [
        migrations.AddField(
            model_name='spotifytoken',
            name='expires_in',
            field=models.DateTimeField(null=True),
        ),
    ]
