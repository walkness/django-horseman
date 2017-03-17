import React, { PropTypes } from 'react';

import styles from './styles.css';


const Row = ({ label, children }) => (
  <dl styleName='styles.row'>
    <dt styleName='styles.label'>{ label }</dt>
    <dd styleName='styles.value'>{ children }</dd>
  </dl>
);

export default Row;
