import React, { PropTypes } from 'react';

import './styles.css';


const Row = ({ label, children }) => (
  <dl styleName='row'>
    <dt styleName='label'>{ label }</dt>
    <dd styleName='value'>{ children }</dd>
  </dl>
);

export default Row;
