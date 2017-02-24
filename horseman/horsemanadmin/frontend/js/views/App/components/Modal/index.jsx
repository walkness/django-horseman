import React, { PropTypes } from 'react';
import classNames from 'classnames';

import styles from './styles.css';


const Modal = ({ children, className, ...props }) => (
  <div className={classNames('modal', className)} styleName='styles.modal' {...props}>

    

  </div>
);

export default Modal;
