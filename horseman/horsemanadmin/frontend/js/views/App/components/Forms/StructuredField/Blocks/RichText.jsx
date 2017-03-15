import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';

import RichTextEditor from '../../../RTE/src/RichTextEditor';

import Block from './HOC';


class RichTextBlock extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      value: RichTextEditor.createValueFromString(props.block.value || '', 'html'),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.block.value !== nextProps.block.value) {
      this.setState({ value: RichTextEditor.createValueFromString(nextProps.block.value || '', 'html') });
    }
  }

  @autobind
  handleChange(value) {
    this.setState({ value });
    this.props.onChange(value, false);
  }

  getBlock(value) {
    const { type } = this.props.block;
    return { type, value };
  }

  getAPIValue() {
    return this.getBlock(this.state.value.toString('html'));
  }

  render() {
    return (
      <RichTextEditor
        value={this.state.value}
        onChange={this.handleChange}
      />
    );
  }
}

export default Block(RichTextBlock);
