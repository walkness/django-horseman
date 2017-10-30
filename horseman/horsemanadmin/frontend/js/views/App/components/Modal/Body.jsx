import React from 'react';
import PropTypes from 'prop-types';

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
