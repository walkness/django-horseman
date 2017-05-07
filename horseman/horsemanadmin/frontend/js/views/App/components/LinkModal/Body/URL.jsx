import React, { PropTypes } from 'react';

import { Input } from '../../Forms/Input';


const URL = ({ atts, onAttsChange }) => (
  <div>

    <Input
      name='url'
      getValue={() => atts.href}
      setValue={value => onAttsChange({ href: value })}
      label='Link to'
      placeholder='http://'
    />

  </div>
);

URL.propTypes = {
  atts: PropTypes.shape({
    href: PropTypes.string,
  }).isRequired,
  onAttsChange: PropTypes.func.isRequired,
};

export default URL;
