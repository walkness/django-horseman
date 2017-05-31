import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';


const getRange = (size) => {
  if (size >= 1000000) return 'megabytes';
  if (size >= 1000) return 'kilobytes';
  return 'bytes';
};

const Filesize = ({ size, showDecimals }) => {
  const numberFormat = showDecimals ? 'oneDecimal' : 'noDecimals';
  return (
    <FormattedMessage
      id='filesize'
      values={{
        bytes: size,
        kilobytes: size / 1000,
        megabytes: size / 1000000,
        range: getRange(size),
      }}
      defaultMessage={`{range, select,
        bytes {{bytes, number, ${numberFormat}} B}
        kilobytes {{kilobytes, number, ${numberFormat}} KB}
        megabytes {{megabytes, number, ${numberFormat}} MB}
      }`}
    />
  );
};

Filesize.propTypes = {
  size: PropTypes.number.isRequired,
  showDecimals: PropTypes.bool,
};

Filesize.defaultProps = {
  showDecimals: true,
};

export default Filesize;
