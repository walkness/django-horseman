import React, { PropTypes } from 'react';

import './styles.css';

const NavTabs = ({ children }) => (
  <nav styleName='root'>
    { children }
  </nav>
);

NavTabs.propTypes = {
  children: PropTypes.node,
};

export default NavTabs;
