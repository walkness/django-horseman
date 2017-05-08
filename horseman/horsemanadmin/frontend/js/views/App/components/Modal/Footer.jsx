import React, { PropTypes } from 'react';

import './styles.scss';


const ModalFooter = ({ children }) => (
  <footer styleName='footer'>

    { children }

  </footer>
);

ModalFooter.propTypes = {
  children: PropTypes.node,
};

export default ModalFooter;
