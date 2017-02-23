import React, { Component, PropTypes } from 'react';
import { HOC } from 'formsy-react';
import classNames from 'classnames';
import { autobind } from 'core-decorators';

import InputWrapper from './InputWrapper';


class Input extends Component {

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
    const {
      setValidations,
      setValue,
      resetValue,
      getValue,
      hasValue,
      getErrorMessage,
      getErrorMessages,
      isFormDisabled,
      isValid,
      isPristine,
      isFormSubmitted,
      isRequired,
      showRequired,
      showError,
      isValidValue,
      validationError,
      validationErrors,
      className,
      label,
      ...inputProps
    } = this.props;

    const control = (
      <input
        className={classNames('control', className)}
        onChange={this.handleChange}
        value={getValue()}
        {...inputProps}
      />
    );

    if (inputProps.type === 'hidden') {
      return control;
    }

    return (
      <InputWrapper label={label}>
        { control }
      </InputWrapper>
    );
  }
}

export default HOC(Input);
