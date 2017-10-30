import React from 'react';
import PropTypes from 'prop-types';

import { Input } from 'Components/Forms';


const Field = ({ fieldType, ...props }) => (
  <div className='char-field'>
    <Input {...props} />
  </div>
)

export default Field;
