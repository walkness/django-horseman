import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';

import RichTextEditor from '../../../RTE/src/RichTextEditor';

import Block from './HOC';


class RichTextBlock extends Component {

  @autobind
  handleChange(value) {
    this.props.onChange(this.getBlock(value));
  }

  getBlock(value) {
    const { type } = this.props.block;
    return { type, value };
  }

  getAPIValue() {
    return this.getBlock(this.props.block.value.toString('html'));
  }

  render() {
    const { value } = this.props.block;
    return (
      <RichTextEditor
        value={(
          !(value instanceof RichTextEditor.EditorValue) ?
          RichTextEditor.createValueFromString(value || '', 'html') :
          value
        )}
        onChange={this.handleChange}
      />
    );
  }
}

export default Block(RichTextBlock);
