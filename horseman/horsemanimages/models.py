import os.path
import uuid
import hashlib
from unidecode import unidecode
from django.db import models
from django.utils import timezone
from django.conf import settings as django_settings
# import swapper

from versatileimagefield.fields import VersatileImageField

from horseman import settings


def get_upload_to(instance, filename):
    return instance.get_upload_to(filename)


class AbstractImage(models.Model):
    if settings.USE_UUID_KEYS:
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    title = models.CharField(max_length=255)

    file = VersatileImageField(
        'file', upload_to=get_upload_to, width_field='width', height_field='height')
    width = models.PositiveIntegerField(editable=False)
    height = models.PositiveIntegerField(editable=False)

    created_at = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(django_settings.AUTH_USER_MODEL)

    class Meta:
        abstract = True

    def get_file_hash(self):
        return hashlib.md5(self.file._file.file.getvalue()).hexdigest()

    def get_upload_to(self, filename):
        file_hash = self.get_file_hash()
        folder_name = 'original_images/{}'.format(file_hash)
        filename = self.file.field.storage.get_valid_name(filename)

        # do a unidecode in the filename and then
        # replace non-ascii characters in filename with _ , to sidestep issues with filesystem encoding
        filename = "".join((i if ord(i) < 128 else '_') for i in unidecode(filename))

        # Truncate filename so it fits in the 100 character limit
        # https://code.djangoproject.com/ticket/9893
        full_path = os.path.join(folder_name, filename)
        if len(full_path) >= 95:
            chars_to_trim = len(full_path) - 94
            prefix, extension = os.path.splitext(filename)
            filename = prefix[:-chars_to_trim] + extension
            full_path = os.path.join(folder_name, filename)

        return full_path


class Image(AbstractImage):
    pass
