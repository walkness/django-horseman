import React, { PropTypes } from 'react';

import styles from './style.css';


const Nav = ({ children }) => (
  <ul styleName='styles.Nav'>

    { children }

  </ul>
);

Nav.propTypes = {
  children: PropTypes.node,
};

export default Nav;
export { default as NavItem } from './Item';
