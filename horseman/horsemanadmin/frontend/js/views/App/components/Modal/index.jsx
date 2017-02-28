import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import styles from './styles.css';


class Modal extends Component {

  static propTypes = {
    closeModal: PropTypes.func.isRequired,
    children: PropTypes.node,
    className: PropTypes.string,
    title: PropTypes.string,
  };

  static childContextTypes = {
    closeModal: PropTypes.func,
    modalTitle: PropTypes.string,
  };

  getChildContext() {
    const { closeModal, title } = this.props;
    return { closeModal, modalTitle: title };
  }

  render() {
    const { children, className, ...props } = this.props;
    return (
      <div>

        <div className={classNames('modal', className)} styleName='styles.modal' {...props}>

          <div styleName='styles.content'>
            { children }
          </div>

        </div>

        <div styleName='styles.backdrop' />

      </div>
    );
  }
}

export default Modal;
export { default as ModalHeader } from './Header';
export { default as ModalBody } from './Body';
export { default as ModalFooter } from './Footer';
