import React, { PropTypes } from 'react';

import './style.css';


const Nav = ({ children }) => (
  <ul styleName='Nav'>

    { children }

  </ul>
);

Nav.propTypes = {
  children: PropTypes.node,
};

export default Nav;
export { default as NavItem } from './Item';
