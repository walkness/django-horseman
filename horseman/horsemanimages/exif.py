import exifread
import fractions
from io import BytesIO
from datetime import datetime
import pytz
import json


def all_subclasses(cls):
    return cls.__subclasses__() + [g for s in cls.__subclasses__()
                                   for g in all_subclasses(s)]


class FractionFromRatio(fractions.Fraction):

    def __new__(cls, ratio):
        instance = fractions.Fraction.__new__(
            cls, numerator=ratio.num, denominator=ratio.den)
        instance.original_ratio = ratio
        return instance


class EXIF(object):

    def __init__(self, file):
        self.file = file

    def get_file_bytes(self):
        if not self.file:
            return None

        if isinstance(self.file, BytesIO):
            return self.file

        if self.file.closed and hasattr(self.file, 'open'):
            self.file.open('rb')
        self.file.seek(0)
        return BytesIO(self.file.read())

    def get_file(self):
        file_ = self.get_file_bytes()
        if not file_:
            return None

        file_.seek(0)

        return file_

    def get_raw_exif(self):
        file_ = self.get_file()
        if not file_:
            return None
        return exifread.process_file(file_)

    def process_exif(self, raw_exif):
        processed = {}
        for key, raw_value in raw_exif.items():
            key_parts = key.split(' ')
            field_group = key_parts[0]
            field_name = ' '.join(key_parts[1:])
            if field_group in ['Image', 'GPS', 'EXIF', 'Interoperability', 'MakerNote']:
                if processed.get(field_group, None) is None:
                    processed[field_group] = {}
                value = EXIFFieldValue.init(raw_value, field_group, field_name, raw_exif)
                json_value = value.get_json_value()
                try:
                    json.dumps(json_value)
                except TypeError:
                    pass
                else:
                    processed[field_group][field_name] = json_value
        return processed

    def get_json(self):
        raw_exif = self.get_raw_exif()
        if not raw_exif:
            return None
        return self.process_exif(raw_exif)


class EXIFFieldValue(object):

    def __init__(self, raw_value, all_fields=None):
        self.raw_value = raw_value
        self.all_fields = all_fields

    @classmethod
    def init(cls, raw_value, field_group=None, field_name=None, all_fields=None):
        for special in all_subclasses(cls):
            if (field_group, field_name) in getattr(special, 'fields', []):
                return special(raw_value, all_fields=all_fields)
        return cls(raw_value, all_fields=all_fields)

    def get_values(self):
        if isinstance(self.raw_value.values, (list, tuple, )):
            return [EXIFValue(value) for value in self.raw_value.values]
        return EXIFValue(self.raw_value.values)

    def get_json_value(self):
        values = self.get_values()
        if isinstance(values, list):
            if len(values) == 1:
                return values[0].get_json_value()
            return [value.get_json_value() for value in values]
        return values.get_json_value()


class RatioAsDecimal(EXIFFieldValue):
    fields = (
        ('GPS', 'GPSAltitude'),
        ('EXIF', 'LensSpecification'),
        ('EXIF', 'LensInfo'),
        ('EXIF', 'FNumber'),
        ('EXIF', 'FocalLength'),
    )

    def get_json_value(self):
        if isinstance(self.raw_value.values, (list, tuple)):
            values = []
            for v in self.raw_value.values:
                if v and v.den:
                    values.append(float(FractionFromRatio(v)))
            if len(values) == 1:
                return values[0]
            return values
        return float(FractionFromRatio(self.raw_value.values))


class EXIFGPSCoords(EXIFFieldValue):
    fields = (
        ('GPS', 'GPSLatitude'),
        ('GPS', 'GPSLongitude'),
    )

    def get_json_value(self):
        values = []
        for v in self.raw_value.values:
            if v and v.den:
                values.append(FractionFromRatio(v))
        if len(values) == 3:
            return float(values[0]) + ((float(values[1]) + (float(values[2]) / 60)) / 60)
        return None


class EXIFDateTime(EXIFFieldValue):
    fields = (
        ('EXIF', 'DateTimeDigitized'),
        ('EXIF', 'DateTimeOriginal'),
        ('Image', 'DateTime'),
    )
    datetime_format = '%Y:%m:%d %H:%M:%S'

    def get_tz_offset(self):
        if not self.all_fields:
            return None
        return self.all_fields.get('TimeZoneOffset', None)

    def get_json_value(self):
        value = self.raw_value.values
        if isinstance(value, (list, tuple, )):
            value = value[0]
        dt = datetime.strptime(value, self.datetime_format)
        return dt.isoformat()


class EXIFValue(object):

    def __init__(self, raw_value):
        self.raw_value = raw_value

    def get_json_value(self):
        if isinstance(self.raw_value, exifread.utils.Ratio):
            return str(self.raw_value)

        return self.raw_value
