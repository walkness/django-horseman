import React, { PropTypes } from 'react';

import styles from './styles.css';


const ModalFooter = ({ children }) => (
  <footer styleName='styles.footer'>

    { children }

  </footer>
);

ModalFooter.propTypes = {
  children: PropTypes.node,
};

export default ModalFooter;
