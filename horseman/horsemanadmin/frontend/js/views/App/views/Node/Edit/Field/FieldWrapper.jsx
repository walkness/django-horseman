import React, { PropTypes } from 'react';
import classNames from 'classnames';


const FieldWrapper = ({ fieldType, children, ...props }) => (
  <div className={classNames('field', `field-${fieldType}`)} {...props}>
    { children }
  </div>
);
