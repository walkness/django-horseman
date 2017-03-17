import React, { PropTypes } from 'react';

import Select from './Select';


const TimezoneSelect = ({ timezones, label, ...props }) => (
  <Select
    options={[
      { value: null, label: 'None' },
      ...timezones.map(timezone => ({
        value: timezone,
        label: timezone.replace(/_/g, ' ').replace(/\//g, ' / '),
      })),
    ]}
    label={label || 'Timezone'}
    {...props}
  />
);

export default TimezoneSelect;
