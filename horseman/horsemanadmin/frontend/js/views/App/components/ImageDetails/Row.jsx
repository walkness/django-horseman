import React from 'react';
import PropTypes from 'prop-types';

import './styles.css';


const Row = ({ label, children }) => (
  <dl styleName='row'>
    <dt styleName='label'>{ label }</dt>
    <dd styleName='value'>{ children }</dd>
  </dl>
);

export default Row;
