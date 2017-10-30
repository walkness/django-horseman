import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { HOC } from 'formsy-react';
import classNames from 'classnames';
import { autobind } from 'core-decorators';
import Select from 'react-select';

import 'react-select/dist/react-select.css';

import BaseInputWrapper from 'react-formsy-bootstrap-components/InputWrapper';
import FormGroup from 'react-formsy-bootstrap-components/FormGroup';

import InputWrapper from './InputWrapper';


class _TypedSelect extends Component {

  static propTypes = {
    onChange: PropTypes.func,
    multi: PropTypes.bool,
  };

  static defaultProps = {
    onChange: () => {},
    multi: false,
  };

  @autobind
  handleChange(e) {
    const { formsy, onChange } = this.props;
    const { setValue } = formsy;
    if (setValue || onChange) {
      let value;
      if (this.props.multi) {
        value = (e || []).map(opt => opt.value);
      } else {
        value = e && e.value;
      }
      if (setValue) setValue(value);
      if (onChange) onChange(value, e);
    }
  }

  render() {
    const { formsy, onChange, className, type, ...inputProps } = this.props;
    return (
      <Select
        className={classNames('control', className)}
        onChange={this.handleChange}
        {...inputProps}
      />
    );
  }
}

const TypedSelect = InputWrapper(BaseInputWrapper(_TypedSelect, FormGroup));

export default HOC(TypedSelect);
