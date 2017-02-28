import React, { PropTypes } from 'react';

import styles from './styles.css';


const CloseButton = ({ onClick, ...props }) => (
  <button
    type='button'
    styleName='styles.button'
    onClick={onClick}
    title='Close'
    {...props}
  >
    &times;
  </button>
);

CloseButton.propTypes = {
  onClick: PropTypes.func,
};

CloseButton.defaultProps = {
  onClick: () => {},
};

export default CloseButton;
