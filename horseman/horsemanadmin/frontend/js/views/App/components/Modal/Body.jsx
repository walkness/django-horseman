import React, { PropTypes } from 'react';

import './styles.scss';


const ModalBody = ({ children, className, ...props }) => (
  <main className={className} styleName='body' {...props}>
    { children }
  </main>
);

ModalBody.propTypes = {
  children: PropTypes.node,
};

export default ModalBody;
