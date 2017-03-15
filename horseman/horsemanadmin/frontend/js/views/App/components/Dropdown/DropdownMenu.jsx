import React, { PropTypes } from 'react';
import classNames from 'classnames';

import styles from './styles.css';


const DropdownMenu = ({ children, className, right, up, dontRemove }, { dropdownOpen }) => {
  if (dropdownOpen || dontRemove) {
    return (
      <ul
        className={classNames('dropdown-menu', className, {
          'dropdown-menu-right': right,
          'dropdown-menu-up': up,
        })}
        styleName='styles.menu'
      >
        { children }
      </ul>
    );
  }
  return null;
};

DropdownMenu.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  right: PropTypes.bool,
  up: PropTypes.bool,
  dontRemove: PropTypes.bool,
};

DropdownMenu.contextTypes = {
  dropdownOpen: PropTypes.bool.isRequired,
};

export default DropdownMenu;
