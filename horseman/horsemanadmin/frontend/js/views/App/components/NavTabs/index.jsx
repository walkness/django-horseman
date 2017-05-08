import React, { PropTypes } from 'react';

import './styles.scss';

const NavTabs = ({ children }) => (
  <nav styleName='root'>
    { children }
  </nav>
);

NavTabs.propTypes = {
  children: PropTypes.node,
};

export default NavTabs;
