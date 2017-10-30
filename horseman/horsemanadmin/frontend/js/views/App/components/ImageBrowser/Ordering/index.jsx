import React from 'react';
import PropTypes from 'prop-types';

import Option from './Option';

import { ORDER } from './constants';

import './styles.css';


const Ordering = ({ ordering, defaultOrder, onChange }) => {
  const getOrder = (value) => {
    let order = (ordering && ordering.toLowerCase()) || defaultOrder;
    if (order && order.startsWith('-')) order = order.substr(1);
    if (order === value.toLowerCase()) {
      return ((ordering && ordering) || defaultOrder).startsWith('-') ? ORDER.DESC : ORDER.ASC;
    }
    return null;
  };

  const handleChange = (field, order) => {
    let newOrdering = field;
    if (order === ORDER.DESC) newOrdering = `-${field}`;
    onChange(newOrdering);
  };

  return (
    <div styleName='root'>

      <span>Sort</span>

      { [
        { label: 'Uploaded', value: 'created_at' },
        { label: 'Captured', value: 'captured_at' },
      ].map(option => (
        <Option
          {...option}
          key={option.value}
          order={getOrder(option.value)}
          onChange={handleChange}
        />
      )) }

    </div>
  );
};

Ordering.propTypes = {
  ordering: PropTypes.string,
  defaultOrder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

Ordering.defaultProps = {
  ordering: null,
  defaultOrder: null,
};

export default Ordering;
