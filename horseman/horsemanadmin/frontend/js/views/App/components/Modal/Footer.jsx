import React, { PropTypes } from 'react';

import './styles.scss';


const ModalFooter = ({ children, className, ...props }) => (
  <footer {...props} className={className} styleName='footer'>

    { children }

  </footer>
);

ModalFooter.propTypes = {
  children: PropTypes.node,
};

export default ModalFooter;
