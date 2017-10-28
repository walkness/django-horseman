import React, { PropTypes } from 'react';
import titleCase from 'title-case';

import { Input, ImageChooser, SlugField, DatePicker, TextArea } from 'Components/Forms';
import { RichText } from 'Components/Forms/RichText';
import { StructuredField } from 'Components/Forms/StructuredField';
import ForeignKey from './ForeignKey';


const Field = ({ config, fieldRef, nonFormsyFieldErrors, ...props }) => {
  const inputProps = {
    name: config.name,
    label: titleCase(config.verbose_name),
    ref: fieldRef,
    fieldConfig: config,
    required: !config.blank,
    heading: !!config.title_field,
    ...props,
  };

  if ([
    'horseman.horsemannodes.fields.StructuredField',
    'horseman.horsemannodes.fields.RichTextField',
  ].indexOf(config.type) !== -1) {
    inputProps.isValid = () => !nonFormsyFieldErrors[config.name];
    inputProps.isPristine = () => false;
  }

  if (nonFormsyFieldErrors[config.name]) {
    inputProps.getErrorMessages = () => nonFormsyFieldErrors[config.name];
  }

  if (
    [
      'django.db.models.fields.CharField',
    ].indexOf(config.type) !== -1
  ) {
    return <Input {...inputProps} />;
  }

  if (
    [
      'django.db.models.fields.SlugField',
    ].indexOf(config.type) !== -1
  ) {
    return <SlugField {...inputProps} />;
  }

  if ([
    'horseman.horsemannodes.fields.RichTextField',
  ].indexOf(config.type) !== -1) {
    return <RichText {...inputProps} />;
  }

  if ([
    'django.db.models.fields.TextField',
  ].indexOf(config.type) !== -1) {
    return <TextArea {...inputProps} />;
  }

  if ([
    'horseman.horsemannodes.fields.StructuredField',
  ].indexOf(config.type) !== -1) {
    return <StructuredField {...inputProps} />;
  }

  if (
    (
      config.type === 'django.db.models.fields.related.ForeignKey' &&
      config.related_model === 'horseman.horsemanimages.models.Image'
    ) || config.type === 'horseman.horsemannodes.fields.SingleImageField'
  ) {
    return <ImageChooser {...inputProps} />;
  }

  if ([
    'django.db.models.fields.related.ForeignKey',
    'django.db.models.fields.related.ManyToManyField',
    'mptt.fields.TreeForeignKey',
    'mptt.fields.TreeManyToManyField',
  ].indexOf(config.type) !== -1) {
    return (
      <ForeignKey
        multiple={[
          'django.db.models.fields.related.ManyToManyField',
          'mptt.fields.TreeManyToManyField',
        ].indexOf(config.type) !== -1}
        {...inputProps}
      />
    );
  }

  if ([
    'django.db.models.fields.DateField',
  ].indexOf(config.type) !== -1) {
    return <DatePicker {...inputProps} />;
  }

  return null;
};

export default Field;
