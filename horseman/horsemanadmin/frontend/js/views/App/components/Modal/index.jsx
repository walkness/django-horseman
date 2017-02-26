import React, { PropTypes } from 'react';
import classNames from 'classnames';

import modal from './modal.css';


const Modal = ({ children, className, ...props }) => (
  <div>

    <div className={classNames('modal', className)} styleName='modal.modal' {...props}>

      <div styleName='modal.content'>
        { children }
      </div>

    </div>

    <div styleName='modal.backdrop' />

  </div>
);

export default Modal;
