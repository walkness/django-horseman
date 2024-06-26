import os.path
import uuid
import hashlib
import mimetypes
from io import BytesIO
from contextlib import contextmanager
from datetime import datetime
from unidecode import unidecode
from django.db import models
from django.apps import apps as django_apps
from django.utils import timezone
from django.conf import settings as django_settings
from django.contrib.postgres.fields import JSONField

import pytz
from timezone_field import TimeZoneField

from willow.image import Image as WillowImage

from horseman import settings

from .exif import EXIF
from .signals import image_file_changed


def get_upload_to(instance, filename):
    return instance.get_upload_to(filename)

def get_rendition_upload_to(instance, filename):
    return instance.get_upload_to(filename)


def get_mime_type_from_file(file):
    fname = os.path.basename(file.name)
    mime, encoding = mimetypes.guess_type(fname)
    return mime


def compute_hash(file_bytes):
    value = None
    if hasattr(file_bytes, 'getvalue'):
        value = file_bytes.getvalue()
    else:
        file_bytes.seek(0)
        value = file_bytes.read()
    return hashlib.md5(value).hexdigest()


def get_exif_json(file_bytes):
    exif = EXIF(file_bytes)
    return exif.get_json()


class AbstractImage(models.Model):
    if settings.USE_UUID_KEYS:
        id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    title = models.CharField(max_length=255)
    original_filename = models.CharField(max_length=255, editable=False)

    file = models.ImageField(
        'file', upload_to=get_upload_to, width_field='width', height_field='height')
    width = models.PositiveIntegerField(editable=False)
    height = models.PositiveIntegerField(editable=False)

    hash = models.CharField(max_length=32, editable=False)

    filesize = models.PositiveIntegerField(blank=True, null=True, editable=False)
    mime_type = models.CharField(max_length=50, blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    created_by = models.ForeignKey(django_settings.AUTH_USER_MODEL)

    captured_at = models.DateTimeField(null=True, blank=True, editable=False)
    captured_at_tz = TimeZoneField(null=True, verbose_name='Captured in timezone')

    exif_data = JSONField(blank=True, null=True, editable=False)

    wp_id = models.PositiveIntegerField(blank=True, null=True, editable=False)

    admin_sizes = [
        ('thumbnail_150', (150, 150)),
        ('thumbnail_300', (300, 300)),
        ('thumbnail_600', (600, 600)),
        ('thumbnail_1200', (1200, 1200)),
    ]

    class Meta:
        abstract = True

    @classmethod
    def get_tzwhere(cls, *args, **kwargs):
        if not getattr(cls, '_tzwhere', None):
            from tzwhere import tzwhere
            cls._tzwhere = tzwhere.tzwhere(*args, **kwargs)
        return cls._tzwhere

    @property
    def url(self):
        return self.file.url

    @property
    def meta(self):
        if not self.exif_data:
            return None

        exif = self.exif_data.get('EXIF', {})
        image = self.exif_data.get('Image', {})

        lens_specifications = exif.get('LensSpecification', [None, None, None, None])

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
            'gps': self.gps_data,
            'credit': {
                'artist': image.get('Artist', None),
                'copyright': image.get('Copyright', None),
            },
        }

        return meta

    @property
    def gps_data(self):
        gps = self.exif_data.get('GPS', {})
        if not gps:
            return None
        lat = gps.get('GPSLatitude', None)
        lat_ref = gps.get('GPSLatitudeRef', None)
        if lat and lat_ref:
            lat *= 1 if lat_ref == 'N' else -1
        lng = gps.get('GPSLongitude', None)
        lng_ref = gps.get('GPSLongitudeRef', None)
        if lng and lng_ref:
            lng *= 1 if lng_ref == 'E' else -1
        return {
            'lat': lat,
            'lng': lng,
            'altitude': gps.get('GPSAltitude', None),
        }


    def __init__(self, *args, **kwargs):
        super(AbstractImage, self).__init__(*args, **kwargs)
        self.old_file = self.file
        self.old_filename = self.file.name
        self.old_hash = self.hash
        self.exif_updated = False

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        old_filename = self.old_filename
        new_filename = self.file.name
        file_changed = old_filename != new_filename

        if file_changed and not self.exif_updated:
            self.update_exif()
            self.update_capture_time_from_exif()

        if (file_changed or not self.mime_type) and self.file:
            self.mime_type = get_mime_type_from_file(self.file) or ''

        if (file_changed or not self.filesize) and self.file:
            self.filesize = self.file.size

        new = super(AbstractImage, self).save(*args, **kwargs)

        if file_changed:
            image_file_changed.send(
                sender=self.__class__, instance=self, old_filename=old_filename,
                new_filename=new_filename)

        return new

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
        return get_exif_json(file or self.file.file)

    def update_exif(self, file=None):
        exif = self.get_exif(file)
        if exif and len(exif.keys()) > 0:
            self.exif_data = exif
            self.exif_updated = True

    def update_capture_time_from_exif(self, camera_tz=None, correct_tz=None, exif=None):
        _exif = exif or self.exif_data or {}
        capture_time = _exif.get('EXIF', {}).get('DateTimeOriginal', None)
        if capture_time:
            naive = datetime.strptime(capture_time, '%Y-%m-%dT%H:%M:%S')
            if naive:
                camera_tz_obj = None
                if camera_tz:
                    camera_tz_obj = pytz.timezone(camera_tz)

                tz = camera_tz_obj or pytz.UTC
                if correct_tz:
                    correct_tz_obj = pytz.timezone(correct_tz)
                    self.captured_at_tz = correct_tz_obj
                    tz = correct_tz_obj
                elif self.captured_at_tz:
                    tz = self.captured_at_tz
                else:
                    tz = self.update_captured_at_tz_from_gps(tz)

                if camera_tz:
                    camera_tz_obj = pytz.timezone(camera_tz)
                    aware = camera_tz_obj.localize(naive)
                else:
                    aware = tz.localize(naive)

                self.captured_at = aware

    def update_captured_at_tz_from_gps(self, default=None, force=True):
        tz = default
        gps = self.gps_data
        if gps:
            lat = gps.get('lat', None)
            lng = gps.get('lng', None)
            if lat and lng:
                where = self.__class__.get_tzwhere(forceTZ=force)
                tzName = where.tzNameAt(lat, lng, forceTZ=force)
                if tzName:
                    tz = pytz.timezone(tzName)
                    self.captured_at_tz = tz
        return tz

    def get_file_hash(self):
        file_bytes = getattr(self, 'file_bytes', getattr(self.file._file, 'file', None))
        assert file_bytes is not None, 'Unable to get file bytes.'
        self.hash = compute_hash(file_bytes)
        return self.hash

    def get_upload_to(self, filename):
        file_hash = self.hash or self.get_file_hash()
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

    def get_size(self, width, height, crop=False, handle_create_rendition=None):
        return self.get_rendition(
            Filter(width, height, crop),
            handle_create_rendition=handle_create_rendition,
        )

    def get_rendition(self, filter_, handle_create_rendition=None):
        try:
            return self.renditions.get_with_filter(filter_)
        except Rendition.DoesNotExist:
            if callable(handle_create_rendition):
                return handle_create_rendition(self.pk, filter_.__dict__())
            return self.create_rendition(filter_)

    def create_rendition(self, filter_):
        rendition = Rendition(image=self, **filter_.rendition_fields())

        base_filename = os.path.basename(self.file.name)
        base_filename_wo_ext, ext = os.path.splitext(base_filename)

        filename = '{}-{}{}'.format(base_filename_wo_ext, filter_.get_filename_extension(), ext)

        generated_image = filter_.run(self, BytesIO())
        rendition.file.save(filename, generated_image.f, save=False)
        rendition.filesize = rendition.file.size

        rendition.save()

        return rendition

    def ensure_sizes(self, sizes_args, handle_create_rendition=None):
        uncreated_sizes = sizes_args[0:]
        for rendition in self.renditions.all():
            i = 0
            for args in uncreated_sizes:
                if rendition.equals_size(*args):
                    del uncreated_sizes[i]
                i += 1

        for args in uncreated_sizes:
            kwargs = {}
            if callable(handle_create_rendition):
                kwargs['handle_create_rendition'] = handle_create_rendition
            self.get_size(*args, **kwargs)

    def ensure_admin_sizes(self, handle_create_rendition=None):
        sizes_args = [rendition[1] for rendition in getattr(Image, 'admin_sizes', [])]
        self.ensure_sizes(sizes_args, handle_create_rendition=handle_create_rendition)

    def get_revision_relation_value(self):
        return str(self.pk)

    def get_related_nodes(self):
        node_model = django_apps.get_model('horsemannodes', 'Node')
        return node_model.objects.get_all_nodes_with_image(self)

    def get_cached_paths(self):
        return
        yield


class Image(AbstractImage):
    pass


class Filter(object):

    def __init__(self, width, height, crop=False):
        self.width = width
        self.height = height
        self.crop = crop

    def __str__(self):
        return '{}x{}{}'.format(self.width, self.height, '_crop' if self.crop else '')

    def __dict__(self):
        return {
            'width': self.width,
            'height': self.height,
            'crop': self.crop,
        }

    def rendition_fields(self):
        return {
            'target_width': self.width,
            'target_height': self.height,
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

            if self.crop:
                original_aspect = original_width / original_height
                crop_aspect = self.width / self.height

                if original_aspect < crop_aspect:
                    # Image is wider than original, crop top and bottom
                    target_height = round(original_width / crop_aspect)
                    top = round((original_height / 2) - (target_height / 2))
                    willow = willow.crop((0, top, original_width, top + target_height))
                elif original_aspect > crop_aspect:
                    # Image is taller than original, crop left and right
                    target_width = round(original_height * crop_aspect)
                    left = round((original_width / 2) - (target_width / 2))
                    willow = willow.crop((left, 0, left + target_width, original_height))

                willow = willow.resize((self.width, self.height))

            else:
                width, height = None, None
                if original_width > original_height:
                    width = self.width
                    height = round(original_height * (self.width / original_width))
                else:
                    height = self.height
                    width = round(original_width * (self.height / original_height))

                willow = willow.resize((width, height))

            output_format = original_format

            if output_format == 'jpeg':
                return willow.save_as_jpeg(output, quality=85, progressive=True, optimize=True)
            elif output_format == 'png':
                return willow.save_as_png(output)
            elif output_format == 'gif':
                return willow.save_as_gif(output)


class RenditionQuerySet(models.QuerySet):

    def get_with_filter(self, filter_):
        return self.get(**filter_.rendition_fields())


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

    filesize = models.PositiveIntegerField(blank=True, null=True)
    mime_type = models.CharField(max_length=50, blank=True)

    created_at = models.DateTimeField(default=timezone.now)

    objects = RenditionQuerySet.as_manager()

    class Meta:
        abstract = True
        unique_together = ('image', 'target_width', 'target_height', 'crop')

    @property
    def url(self):
        return self.file.url

    @property
    def target(self):
        return {
            'width': self.target_width,
            'height': self.target_height,
        }

    def __str__(self):
        return '{}x{}{}'.format(self.target_width, self.target_height, '_crop' if self.crop else '')

    def save(self, *args, **kwargs):
        if not self.mime_type and self.file:
            self.mime_type = get_mime_type_from_file(self.file) or ''
        if not self.filesize and self.file:
            self.filesize = self.file.size
        return super(AbstractRendition, self).save(*args, **kwargs)

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
