import React, { PropTypes } from 'react';

import Input from './Input';

import styles from './styles.css';


const SlugField = ({ ...props }) => (
  <Input
    validations={{
      matchRegexp: /^[A-Za-z0-9-_]+$/,
    }}
    validationErrors={{
      matchRegexp: 'Can contain only letters, numbers, underscores and dashes.',
    }}
    className={`slug-field ${styles['slug-field']}`}
    {...props}
  />
);

export default SlugField;
