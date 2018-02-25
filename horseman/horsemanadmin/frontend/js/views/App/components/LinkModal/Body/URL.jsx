import React from 'react';
import PropTypes from 'prop-types';

import { Input } from 'Components/Forms/Input';


const URL = ({ atts, onAttsChange, inputRef }) => (
  <div>

    <Input
      name='url'
      getValue={() => atts.href}
      setValue={value => onAttsChange({ href: value })}
      label='Link to'
      placeholder='http://'
      inputRef={inputRef}
    />

  </div>
);

URL.propTypes = {
  atts: PropTypes.shape({
    href: PropTypes.string,
  }).isRequired,
  onAttsChange: PropTypes.func.isRequired,
  inputRef: PropTypes.func,
};

URL.defaultProps = {
  inputRef: null,
};

export default URL;
