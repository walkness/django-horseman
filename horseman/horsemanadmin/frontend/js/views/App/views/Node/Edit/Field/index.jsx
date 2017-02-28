import React, { PropTypes } from 'react';
import titleCase from 'title-case';

import { Input, RichText, StructuredField, ImageChooser, SlugField } from '../../../../components/Forms';


const Field = ({ config, fieldRef, ...props }) => {
  const inputProps = {
    name: config.name,
    label: titleCase(config.verbose_name),
    ref: fieldRef,
    fieldConfig: config,
    required: !config.blank,
    heading: !!config.title_field,
    ...props,
  };

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
    'horseman.horsemannodes.fields.StructuredField',
  ].indexOf(config.type) !== -1) {
    return <StructuredField {...inputProps} />;
  }

  if ([
    'django.db.models.fields.related.ForeignKey',
  ].indexOf(config.type) !== -1) {
    return <ImageChooser {...inputProps} />;
  }

  return null;
};

export default Field;
