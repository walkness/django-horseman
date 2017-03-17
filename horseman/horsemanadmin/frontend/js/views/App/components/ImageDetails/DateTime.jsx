import React, { PropTypes } from 'react';
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl';
import moment from 'moment-timezone';


const DateTime = ({ value, timezone, defaultTimezone, displayTimezone }) => {
  let date = value && moment(value);
  if (timezone) {
    date = date.tz(timezone);
  } else if (defaultTimezone) {
    date = date.tz(defaultTimezone);
  } else {
    const currentTz = moment.tz.guess();
    if (currentTz) {
      date = date.tz(currentTz);
    }
  }
  return (
    <FormattedMessage
      id='image.date'
      values={{
        date: date.format('LL'),
        time: date.format(displayTimezone ? 'LTS z' : 'LTS'),
      }}
      defaultMessage='{date} at {time}'
    />
  );
};

DateTime.propTypes = {
  defaultTimezone: PropTypes.string,
  displayTimezone: PropTypes.bool,
};

DateTime.defaultProps = {
  defaultTimezone: null,
  displayTimezone: true,
};

export default DateTime;
