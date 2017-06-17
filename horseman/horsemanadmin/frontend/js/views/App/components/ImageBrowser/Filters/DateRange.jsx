import React, { PropTypes } from 'react';
import moment from 'moment';

import InputWrapper from 'Components/Forms/InputWrapper';
import { DatePicker } from 'Components/Forms/Date';

import styles from './styles.css';


const DateRange = ({ name, start, end, onStartChange, onEndChange }) => {
  const startMoment = start && moment(start);
  const endMoment = end && moment(end);
  return (
    <div styleName='styles.date-range'>

      <DatePicker
        name={`${name}_start`}
        label='After'
        getValue={() => start}
        setValue={onStartChange}
        selectsStart
        startDate={startMoment}
        endDate={endMoment}
        isClearable
        showYearDropdown
        showMonthDropdown
      />

      <DatePicker
        name={`${name}_end`}
        label='Before'
        getValue={() => end}
        setValue={onEndChange}
        selectsEnd
        startDate={startMoment}
        endDate={endMoment}
        openToDate={startMoment}
        isClearable
        showYearDropdown
        showMonthDropdown
      />

    </div>
  );
};

export default InputWrapper(DateRange);
