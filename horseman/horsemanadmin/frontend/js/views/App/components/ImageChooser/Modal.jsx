import React, { PropTypes } from 'react';

import ImageChooser from './index';
import Modal from '../Modal';


const ImageChooserModal = ({ modalProps, ...props }) => (
  <Modal {...modalProps}>

    <ImageChooser {...props} />

  </Modal>
);

ImageChooserModal.propTypes = {
  modalProps: PropTypes.object,
};

export default ImageChooserModal;
