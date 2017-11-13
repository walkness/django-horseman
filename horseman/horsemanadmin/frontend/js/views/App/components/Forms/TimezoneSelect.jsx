import React from 'react';
import PropTypes from 'prop-types';
import { HOC } from 'formsy-react';

import { Select } from './Select';


const TimezoneSelect = ({ timezones, label, ...props }) => (
  <Select
    options={[
      ...timezones.map(timezone => ({
        value: timezone,
        label: timezone.replace(/_/g, ' ').replace(/\//g, ' / '),
      })),
    ]}
    label={label || 'Timezone'}
    {...props}
  />
);

export { TimezoneSelect };

export default HOC(TimezoneSelect);
