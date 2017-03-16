import React, { PropTypes } from 'react';

import { DatePicker } from '../../Forms/Date';
import DateRange from './DateRange';


const Filters = ({ filters, handleFiltersChange }) => (
  <div>

    <DateRange
      name='captured_at'
      label='Captured'
      end={filters.captured_before}
      start={filters.captured_after}
      onStartChange={captured_after => handleFiltersChange({ captured_after })}
      onEndChange={captured_before => handleFiltersChange({ captured_before })}
    />

  </div>
);

export default Filters;
