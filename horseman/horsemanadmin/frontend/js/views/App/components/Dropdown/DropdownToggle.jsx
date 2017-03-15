import React, { PropTypes } from 'react';

import styles from './styles.css';


const DropdownToggle = (props, context) => (
  <button
    type='button'
    className='dropdown-toggle'
    styleName='styles.toggle'
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
