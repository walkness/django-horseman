import React, { Component, PropTypes } from 'react';
import { HOC } from 'formsy-react';
import classNames from 'classnames';
import { autobind } from 'core-decorators';
import BaseDatePicker from 'react-datepicker';
import moment from 'moment';

import 'react-datepicker/dist/react-datepicker.css';

import BaseInputWrapper from 'react-formsy-bootstrap-components/InputWrapper';
import FormGroup from 'react-formsy-bootstrap-components/FormGroup';

import InputWrapper from './InputWrapper';


class Input extends Component {

  static propTypes = {
    onChange: PropTypes.func,
    formsy: PropTypes.shape({ setValue: PropTypes.func }),
  };

  static defaultProps = {
    onChange: () => {},
    formsy: {},
  };

  @autobind
  handleChange(value) {
    const { formsy, onChange } = this.props;
    const { setValue } = formsy;
    if (setValue || onChange) {
      const dateStr = value && value.format('YYYY-MM-DD');
      if (setValue) setValue(dateStr);
      if (onChange) onChange(dateStr, value);
    }
  }

  render() {
    const { onChange, value: dateStr, className, type, renderFeedback, ...inputProps } = this.props;
    return (
      <div>
        <BaseDatePicker
          className={classNames('control', className)}
          onChange={this.handleChange}
          selected={dateStr && moment(dateStr)}
          {...inputProps}
        />

        { renderFeedback && renderFeedback() }
      </div>
    );
  }
}

export const DatePicker = InputWrapper(BaseInputWrapper(Input, FormGroup));

export default HOC(DatePicker);
