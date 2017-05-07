import React, { PropTypes } from 'react';

import styles from './styles.css';


const ModalBody = ({ children, className, ...props }) => (
  <main className={className} styleName='styles.body' {...props}>
    { children }
  </main>
);

ModalBody.propTypes = {
  children: PropTypes.node,
};

export default ModalBody;
