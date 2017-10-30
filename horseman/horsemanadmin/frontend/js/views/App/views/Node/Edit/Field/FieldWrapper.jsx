import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';


const FieldWrapper = ({ fieldType, children, ...props }) => (
  <div className={classNames('field', `field-${fieldType}`)} {...props}>
    { children }
  </div>
);
