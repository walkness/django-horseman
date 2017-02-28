import os.path
import uuid
import hashlib
from io import BytesIO
from contextlib import contextmanager
from datetime import datetime
from unidecode import unidecode
from django.db import models
from django.utils import timezone
from django.conf import settings as django_settings
from django.contrib.postgres.fields import JSONField

import pytz
from timezone_field import TimeZoneField

from willow.image import Image as WillowImage

from horseman import settings
from .exif import EXIF


def get_upload_to(instance, filename):
    return instance.get_upload_to(filename)

def get_rendition_upload_to(instance, filename):
    return instance.get_upload_to(filename)


class AbstractImage(models.Model):
    if settings.USE_UUID_KEYS:
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    title = models.CharField(max_length=255)

    file = models.ImageField(
        'file', upload_to=get_upload_to, width_field='width', height_field='height')
    width = models.PositiveIntegerField(editable=False)
    height = models.PositiveIntegerField(editable=False)

    hash = models.CharField(max_length=32, editable=False)

    created_at = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(django_settings.AUTH_USER_MODEL)

    captured_at = models.DateTimeField(null=True, blank=True, editable=False)
    captured_at_tz = TimeZoneField(null=True)

    exif_data = JSONField(blank=True, null=True)

    class Meta:
        abstract = True

    @property
    def url(self):
        return self.file.url

    @property
    def meta(self):
        if not self.exif_data:
            return None

        exif = self.exif_data.get('EXIF', {})
        image = self.exif_data.get('Image', {})
        gps = self.exif_data.get('GPS', {})

        lens_specifications = exif.get('LensSpecification', [None, None, None, None])
        lat = gps.get('GPSLatitude', None)
        lat_ref = gps.get('GPSLatitudeRef', None)
        if lat and lat_ref:
            lat *= 1 if lat_ref == 'N' else -1
        lng = gps.get('GPSLongitude', None)
        lng_ref = gps.get('GPSLongitudeRef', None)
        if lng and lng_ref:
            lng *= 1 if lng_ref == 'E' else -1

        meta = {
            'capture_time': exif.get('DateTimeOriginal', None),
            'creation_time': image.get('DateTime', None),
            'camera': {
                'make': image.get('Make', None),
                'model': image.get('Model', None),
                'lens': exif.get('LensModel', None),
                'lens_focal_range': lens_specifications[:2],
                'lens_aperture': lens_specifications[2:],
            },
            'exposure': {
                'shutter': exif.get('ExposureTime', None),
                'fstop': exif.get('FNumber', None),
                'focal_length': exif.get('FocalLength', None),
                'iso': exif.get('ISOSpeedRatings', None),
                'ev': exif.get('ExposureBiasValue', None),
                'program': exif.get('ExposureProgram', None),
            },
            'gps': {
                'lat': lat,
                'lng': lng,
                'altitude': gps.get('GPSAltitude', None),
            },
            'credit': {
                'artist': image.get('Artist', None),
                'copyright': image.get('Copyright', None),
            },
        }



        return meta

    def __init__(self, *args, **kwargs):
        super(AbstractImage, self).__init__(*args, **kwargs)
        self.old_file = self.file
        self.old_hash = self.hash
        self.exif_updated = False

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.old_file != self.file and not self.exif_updated:
            self.update_exif()
        if self.captured_at and self.captured_at_tz:
            self.captured_at = self.captured_at.replace(tzinfo=self.captured_at_tz or pytz.UTC)
        return super(AbstractImage, self).save(*args, **kwargs)

    @contextmanager
    def get_willow_image(self):
        close_file = False
        image_file = self.file

        if self.file.closed:
            self.file.open('rb')
            close_file = True

        image_file.seek(0)

        try:
            yield WillowImage.open(image_file)
        finally:
            if close_file:
                image_file.close()

    def get_exif(self, file=None):
        exif = EXIF(file or self.file.file)
        return exif.get_json()

    def update_exif(self, file=None):
        exif = self.get_exif(file)
        if len(exif.keys()) > 0:
            self.exif_data = exif
            capture_time = exif.get('EXIF', {}).get('DateTimeOriginal', None)
            if capture_time:
                self.captured_at = datetime.strptime(capture_time, '%Y-%m-%dT%H:%M:%S')
            self.exif_updated = True

    def get_file_hash(self):
        file_bytes = getattr(self, 'file_bytes', getattr(self.file._file, 'file', None))
        assert file_bytes is not None, 'Unable to get file bytes.'
        self.hash = hashlib.md5(file_bytes.getvalue()).hexdigest()
        return self.hash

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

    def get_size(self, width, height, crop=False):
        return self.get_rendition(Filter(width, height, crop))

    def get_rendition(self, filter):
        try:
            return self.renditions.get_with_filter(filter)
        except Rendition.DoesNotExist:
            rendition = Rendition(image=self, **filter.rendition_fields())

        base_filename = os.path.basename(self.file.name)
        base_filename_wo_ext, ext = os.path.splitext(base_filename)

        filename = '{}-{}{}'.format(base_filename_wo_ext, filter.get_filename_extension(), ext)
        
        generated_image = filter.run(self, BytesIO())
        rendition.file.save(filename, generated_image.f, save=False)

        rendition.save()

        return rendition


class Image(AbstractImage):
    pass


class Filter(object):

    def __init__(self, width, height, crop=False):
        self.width = width
        self.height = height
        self.crop = crop

    def __str__(self):
        return '{}x{}{}'.format(self.width, self.height, '_crop' if self.crop else '')

    def rendition_fields(self):
        return {
            'target_width': self.width,
            'target_height': self.width,
            'crop': self.crop,
        }

    def get_filename_extension(self):
        ext = '{}x{}'.format(self.width, self.height)
        if self.crop:
            ext = '{}crop'.format(ext)
        return ext

    def run(self, image, output):
        with image.get_willow_image() as willow:
            original_format = willow.format_name

            willow = willow.auto_orient()

            original_width, original_height = willow.get_size()

            width, height = None, None
            if original_width > original_height:
                width = self.width
                height = round(original_height * (self.width / original_width))
            else:
                height = self.height
                width = round(original_width * (self.height / original_height))

            if width and height:
                willow = willow.resize((width, height))

            if self.crop:
                pass

            output_format = original_format

            if output_format == 'jpeg':
                return willow.save_as_jpeg(output, quality=85, progressive=True, optimize=True)
            elif output_format == 'png':
                return willow.save_as_png(output)
            elif output_format == 'git':
                return willow.save_as_gif(output)


class RenditionQuerySet(models.QuerySet):

    def get_with_filter(self, filter):
        return self.get(**filter.rendition_fields())


class AbstractRendition(models.Model):
    if settings.USE_UUID_KEYS:
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    image = models.ForeignKey(Image, related_name='renditions')

    target_width = models.PositiveIntegerField(editable=False)
    target_height = models.PositiveIntegerField(editable=False)
    crop = models.BooleanField(default=False)

    file = models.ImageField(
        'file', upload_to=get_rendition_upload_to, width_field='width', height_field='height')

    width = models.PositiveIntegerField(editable=False)
    height = models.PositiveIntegerField(editable=False)

    created_at = models.DateTimeField(default=timezone.now)

    objects = RenditionQuerySet.as_manager()

    class Meta:
        abstract = True

    @property
    def url(self):
        return self.file.url

    def get_upload_to(self, filename):
        folder_name = 'images/{}'.format(self.image.hash)
        filename = self.file.field.storage.get_valid_name(filename)
        return os.path.join(folder_name, filename)

    def equals_size(self, width, height, crop=False):
        filter = Filter(width, height, crop)
        return self.equals_filter(filter)

    def equals_filter(self, filter):
        for field, value in filter.rendition_fields().items():
            if getattr(self, field) != value:
                return False
        return True


class Rendition(AbstractRendition):
    pass
