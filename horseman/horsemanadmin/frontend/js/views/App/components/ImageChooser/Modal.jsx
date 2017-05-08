import React, { PropTypes } from 'react';

import ImageChooser from './index';
import Modal, { ModalHeader, ModalBody, ModalFooter } from '../Modal';


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
