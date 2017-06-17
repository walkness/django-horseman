import React, { PropTypes } from 'react';

import { Input } from 'Components/Forms';


const Field = ({ fieldType, ...props }) => (
  <div className='char-field'>
    <Input {...props} />
  </div>
)

export default Field;
