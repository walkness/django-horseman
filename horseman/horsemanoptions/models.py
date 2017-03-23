import uuid

from django.db import models


class BaseOptionSet(models.Model):
    slug = models.SlugField(primary_key=True)
    name = models.CharField(max_length=50)

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


class OptionSet(BaseOptionSet):
    pass


class BaseOption(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.SlugField()
    value = models.TextField(blank=True)

    class Meta:
        abstract = True

    def __str__(self):
        return self.key


class Option(BaseOption):
    option_set = models.ForeignKey(OptionSet)

    class Meta:
        unique_together = ('option_set', 'key')

    def __str__(self):
        return '{set_name}: {key}'.format(set_name=self.option_set.name, key=self.key)
