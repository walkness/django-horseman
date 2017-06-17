import React, { PropTypes } from 'react';

import DateRange from './DateRange';

import './styles.css';


const Filters = ({ filters, handleFiltersChange, display, toggleDisplay }) => (
  <div styleName='filters'>

    <button type='button' className='link' styleName='show-button' onClick={toggleDisplay}>
      {display ? 'Hide filters' : 'Show filters'}
    </button>

    { display ?
      <div>

        <DateRange
          name='uploaded_at'
          label='Uploaded'
          end={filters.uploaded_before}
          start={filters.uploaded_after}
          onStartChange={uploaded_after => handleFiltersChange({ uploaded_after })}
          onEndChange={uploaded_before => handleFiltersChange({ uploaded_before })}
        />

        <DateRange
          name='captured_at'
          label='Captured'
          end={filters.captured_before}
          start={filters.captured_after}
          onStartChange={captured_after => handleFiltersChange({ captured_after })}
          onEndChange={captured_before => handleFiltersChange({ captured_before })}
        />

      </div>
    : null }

  </div>
);

Filters.propTypes = {
  filters: PropTypes.object.isRequired,
  handleFiltersChange: PropTypes.func.isRequired,
  display: PropTypes.bool,
  toggleDisplay: PropTypes.func.isRequired,
};

Filters.defaultProps = {
  display: false,
};

export default Filters;
