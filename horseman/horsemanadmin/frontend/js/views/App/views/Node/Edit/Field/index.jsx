import React, { PropTypes } from 'react';
import titleCase from 'title-case';

import { Input, RichText, StructuredField } from '../../../../components/Forms';


const Field = ({ config, fieldRef, ...props }) => {
  const inputProps = {
    name: config.name,
    label: titleCase(config.verbose_name),
    ref: fieldRef,
    fieldConfig: config,
    ...props,
  };

  if (
    [
      'django.db.models.fields.CharField',
      'django.db.models.fields.SlugField',
    ].indexOf(config.type) !== -1
  ) {
    return <Input {...inputProps} />;
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

  return null;
}

export default Field;
