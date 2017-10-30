/* eslint-disable react/no-array-index-key */

import React from 'react';
import PropTypes from 'prop-types';

import ErrorMessage from 'react-formsy-bootstrap-components/ErrorMessage';

import './styles.scss';


const FormMessages = ({ success, successMessage, errors }) => (
  <div styleName='messages'>

    { success ?
      <div styleName='success'>
        { successMessage }
      </div>
    : null }

    { (errors || []).length > 0 ?
      <div styleName='error'>
        <ul styleName='error-list'>
          { (errors || []).map((error, i) => {
            if (error.message) return <ErrorMessage key={i} {...error} />;
            return <ErrorMessage key={i} message={error} />;
          }) }
        </ul>
      </div>
    : null }

  </div>
);

FormMessages.propTypes = {
  errors: PropTypes.arrayOf(PropTypes.node),
  success: PropTypes.bool,
  successMessage: PropTypes.node,
};

FormMessages.defaultProps = {
  errors: [],
  success: false,
  successMessage: 'Your changes have been saved.',
};

export default FormMessages;
