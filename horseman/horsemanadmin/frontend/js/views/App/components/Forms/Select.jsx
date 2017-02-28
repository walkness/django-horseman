import React, { Component, PropTypes } from 'react';
import { HOC } from 'formsy-react';
import { autobind } from 'core-decorators';

import InputWrapper from './InputWrapper';


class Select extends Component {

  @autobind
  handleChange(e) {
    const value = e.target.value;
    this.props.setValue(value);
  }

  render() {
    return (
      <InputWrapper label={this.props.label}>

        <select value={this.props.getValue()} onChange={this.handleChange}>

          { this.props.options.map(({ value, label }) => (
            <option value={value}>{ label }</option>
          )) }

        </select>

      </InputWrapper>
    );
  }
}

export default HOC(Select);
