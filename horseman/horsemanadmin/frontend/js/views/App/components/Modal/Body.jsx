import React, { PropTypes } from 'react';

import styles from './styles.css';


const ModalBody = ({ children }) => (
  <main styleName='styles.body'>
    { children }
  </main>
);

ModalBody.propTypes = {
  children: PropTypes.node,
};

export default ModalBody;
