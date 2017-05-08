import React, { PropTypes } from 'react';

import CloseButton from '../CloseButton';

import './styles.scss';


const ModalHeader = ({ children }, { closeModal, modalTitle }) => (
  <header styleName='header'>

    { children ? children :
    <div styleName='default-header'>
      <h2 styleName='header__title'>{ modalTitle }</h2>
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
