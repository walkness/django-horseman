import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment-timezone';


const DateTime = ({ value, timezone, defaultTimezone, displayTimezone, ...props }) => {
  let date = value && moment(value);
  if (!date) return null;
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
    <span {...props}>
      <FormattedMessage
        id='image.date'
        values={{
          date: date.format('LL'),
          time: date.format(displayTimezone ? 'LTS z' : 'LTS'),
        }}
        defaultMessage='{date} at {time}'
      />
    </span>
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
