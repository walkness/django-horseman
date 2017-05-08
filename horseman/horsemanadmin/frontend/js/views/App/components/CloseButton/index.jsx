import React, { PropTypes } from 'react';
import classNames from 'classnames';

import './styles.scss';


const CloseButton = ({ onClick, className, ...props }) => (
  <button
    type='button'
    className={classNames('close', className)}
    styleName='button'
    onClick={onClick}
    title='Close'
    {...props}
  >
    &times;
  </button>
);

CloseButton.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
};

CloseButton.defaultProps = {
  onClick: () => {},
};

export default CloseButton;
