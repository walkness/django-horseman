import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape, defineMessages } from 'react-intl';

import Modal, { ModalHeader, ModalBody, ModalFooter } from 'Components/Modal';

import './styles.scss';


const messages = defineMessages({
  title: {
    id: 'node.edit.delete.title',
    defaultMessage: 'Confirm Deletion',
  },
});


const Delete = ({ nodeName, onClose, onConfirm }, { intl }) => (
  <Modal
    size='small'
    title={intl.formatMessage(messages.title)}
    closeModal={onClose}
    styleName='delete-modal'
  >

    <ModalHeader />

    <ModalBody styleName='delete-body'>
      <FormattedMessage
        id='node.edit.delete.confirm.body'
        values={{ nodeName }}
        defaultMessage='Are you sure you want to delete this {nodeName}? This action cannot be undone.'
      />
    </ModalBody>

    <ModalFooter styleName='delete-footer'>
      <button className='btn' onClick={onClose}>Cancel</button>
      <button className='btn btn-danger' onClick={onConfirm}>Delete</button>
    </ModalFooter>

  </Modal>
);

Delete.propTypes = {
  nodeName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

Delete.contextTypes = {
  intl: intlShape.isRequired,
};

export default Delete;
