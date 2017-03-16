import React, { PropTypes } from 'react';

import { ORDER } from './constants';


const Option = ({ label, value, order, onChange }) => {
  const handleClick = () => {
    let newOrder = ORDER.ASC;
    if (order === ORDER.ASC) newOrder = ORDER.DESC;
    else if (order === ORDER.DESC) newOrder = ORDER.ASC;
    onChange(value, newOrder);
  };
  return (
    <button
      className='btn'
      type='button'
      onClick={handleClick}
    >
      { label }
      { order === ORDER.ASC ? '▲' : null }
      { order === ORDER.DESC ? '▼' : null }
    </button>
  );
};

Option.propTypes = {
  label: PropTypes.node,
  value: PropTypes.string.isRequired,
  order: PropTypes.oneOf([ORDER.ASC, ORDER.DESC]),
  onChange: PropTypes.func.isRequired,
};

Option.defaultProps = {
  label: null,
  order: null,
};

export default Option;
