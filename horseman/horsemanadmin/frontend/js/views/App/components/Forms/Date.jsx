import React, { Component, PropTypes } from 'react';
import { HOC } from 'formsy-react';
import classNames from 'classnames';
import { autobind } from 'core-decorators';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import InputWrapper from './InputWrapper';

import 'react-datepicker/dist/react-datepicker.css';


class Input extends Component {

  static propTypes = {
    onChange: PropTypes.func,
  };

  static defaultProps = {
    onChange: () => {},
  };

  @autobind
  handleChange(value) {
    this.props.setValue(value.format('YYYY-MM-DD'));
    this.props.onChange(value);
  }

  render() {
    const { setValue, getValue, onChange, value, className, type, ...inputProps } = this.props;
    return (
      <DatePicker
        className={classNames('control', className)}
        onChange={this.handleChange}
        selected={moment(getValue())}
        {...inputProps}
      />
    );
  }
}

export default HOC(InputWrapper(Input));
