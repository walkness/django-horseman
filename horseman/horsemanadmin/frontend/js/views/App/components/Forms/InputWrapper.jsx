import React, { PropTypes } from 'react';


const InputWrapper = ({ children, label }) => (
  <div className='input-wrapper'>

    { label ?
      <label className='input-label'>{ label }</label>
    : null }

    <div className='control-wrapper'>
      { children }
    </div>

  </div>
);

export default InputWrapper;
