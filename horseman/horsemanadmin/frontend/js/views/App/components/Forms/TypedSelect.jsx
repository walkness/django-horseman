import React, { Component, PropTypes } from 'react';
import { HOC } from 'formsy-react';
import classNames from 'classnames';
import { autobind } from 'core-decorators';
import Select from 'react-select';

import 'react-select/dist/react-select.css';

import InputWrapper from './InputWrapper';


class TypedSelect extends Component {

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
    let value;
    if (this.props.multi) {
      value = (e || []).map(opt => opt.value);
    } else {
      value = e && e.value;
    }
    this.props.setValue(value);
    this.props.onChange(value);
  }

  render() {
    const { setValue, getValue, onChange, value, className, type, ...inputProps } = this.props;
    return (
      <Select
        className={classNames('control', className)}
        onChange={this.handleChange}
        value={getValue()}
        {...inputProps}
      />
    );
  }
}

export default HOC(InputWrapper(TypedSelect));
