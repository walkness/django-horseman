import React, { Component, PropTypes } from 'react';
import { HOC } from 'formsy-react';
import classNames from 'classnames';
import { autobind } from 'core-decorators';

import InputWrapper from './InputWrapper';


class _Input extends Component {

  static propTypes = {
    type: PropTypes.string,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    type: 'text',
    onChange: () => {},
  };

  @autobind
  handleChange(e) {
    const value = e.target.value;
    this.props.setValue(value);
    this.props.onChange(value);
  }

  render() {
    const { setValue, getValue, onChange, value, className, ...inputProps } = this.props;
    return (
      <input
        className={classNames('control', className)}
        onChange={this.handleChange}
        value={getValue() || ''}
        {...inputProps}
      />
    );
  }
}

export const Input = InputWrapper(_Input);

export default HOC(Input);
