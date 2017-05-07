import React, { Component, PropTypes } from 'react';
import { HOC } from 'formsy-react';
import { autobind } from 'core-decorators';

import InputWrapper from './InputWrapper';


class _Select extends Component {

  @autobind
  handleChange(e) {
    const value = e.target.value;
    this.props.setValue(value);
  }

  render() {
    return (
      <select value={this.props.getValue()} onChange={this.handleChange}>

        { this.props.options.map(({ value, label }) => (
          <option value={value}>{ label }</option>
        )) }

      </select>
    );
  }
}

export const Select = InputWrapper(_Select);

export default HOC(Select);
