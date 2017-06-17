import React, { PropTypes } from 'react';

import Modal, { ModalHeader, ModalBody } from 'Components/Modal';

import ImageChooser from './index';


const ImageChooserModal = ({ modalProps, ...props }) => (
  <Modal title={`Choose Image${props.multiple ? 's' : ''}`} {...modalProps}>

    <ModalHeader />

    <ModalBody>
      <ImageChooser {...props} />
    </ModalBody>

  </Modal>
);

ImageChooserModal.propTypes = {
  modalProps: PropTypes.object,
  multiple: PropTypes.bool,
};

ImageChooserModal.defaultProps = {
  multiple: false,
};

export default ImageChooserModal;
