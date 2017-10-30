import React from 'react';
import PropTypes from 'prop-types';

import './styles.css';


const DropdownToggle = (props, context) => (
  <button
    type='button'
    className='dropdown-toggle btn'
    styleName='toggle'
    data-toggle='dropdown'
    role='button'
    aria-haspopup='true'
    aria-expanded={context.dropdownOpen}
    onClick={context.handleDropdownClick}
  >
    { props.children }
  </button>
);

DropdownToggle.contextTypes = {
  dropdownOpen: PropTypes.bool.isRequired,
  handleDropdownClick: PropTypes.func.isRequired,
};

export default DropdownToggle;
