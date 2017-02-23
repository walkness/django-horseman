import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { autobind } from 'core-decorators';
import RichTextEditor from 'react-rte';

import InputWrapper from './InputWrapper';


class RichText extends Component {

  static propTypes = {
    type: PropTypes.string,
    onChange: PropTypes.func,
  };

  static defaultProps = {
    type: 'text',
    onChange: () => {},
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      value: null,
    };
    if (props.value) {
      this.state.value = RichTextEditor.createValueFromString(props.value, 'html');      
    } else {
      this.state.value = RichTextEditor.createEmptyValue();
    }
  }

  @autobind
  handleChange(value) {
    this.setState({ value });
    this.props.onChange(value);
  }

  getAPIValue() {
    return this.state.value.toString('html');
  }

  render() {
    const { className, label, ...inputProps } = this.props;

    return (
      <InputWrapper label={label}>

        <RichTextEditor
          className={classNames('control', className)}
          onChange={this.handleChange}
          value={this.state.value}
        />

      </InputWrapper>
    );
  }
}

export default RichText;
