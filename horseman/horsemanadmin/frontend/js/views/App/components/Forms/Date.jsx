import React, { Component, PropTypes } from 'react';
import { HOC } from 'formsy-react';
import classNames from 'classnames';
import { autobind } from 'core-decorators';
import BaseDatePicker from 'react-datepicker';
import moment from 'moment';

import 'react-datepicker/dist/react-datepicker.css';

import InputWrapper from './InputWrapper';


class Input extends Component {

  static propTypes = {
    onChange: PropTypes.func,
  };

  static defaultProps = {
    onChange: () => {},
  };

  @autobind
  handleChange(value) {
    this.props.setValue(value && value.format('YYYY-MM-DD'));
    this.props.onChange(value);
  }

  render() {
    const { setValue, getValue, onChange, value, className, type, ...inputProps } = this.props;
    const dateStr = getValue();
    return (
      <BaseDatePicker
        className={classNames('control', className)}
        onChange={this.handleChange}
        selected={dateStr && moment(dateStr)}
        {...inputProps}
      />
    );
  }
}

export const DatePicker = InputWrapper(Input);

export default HOC(DatePicker);
