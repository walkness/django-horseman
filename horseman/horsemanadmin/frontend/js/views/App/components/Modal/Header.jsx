import React, { PropTypes } from 'react';

import CloseButton from '../CloseButton';

import styles from './styles.css';


const ModalHeader = ({ children }, { closeModal, modalTitle }) => (
  <header styleName='styles.header'>

    { children ? children :
    <div styleName='styles.default-header'>
      <h2 styleName='styles.header__title'>{ modalTitle }</h2>
      <CloseButton onClick={() => closeModal()} />
    </div>
    }

  </header>
);

ModalHeader.propTypes = {
  children: PropTypes.node,
};

ModalHeader.contextTypes = {
  closeModal: PropTypes.func.isRequired,
  modalTitle: PropTypes.string,
};

export default ModalHeader;
