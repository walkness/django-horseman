import React, { Component, PropTypes } from 'react';
import RichTextEditor from 'react-rte';
import { autobind } from 'core-decorators';

import BlockWrapper from './Wrapper';


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
      <BlockWrapper>

        <RichTextEditor
          value={(
            !(value instanceof RichTextEditor.EditorValue) ?
            RichTextEditor.createValueFromString(value || '', 'html') :
            value
          )}
          onChange={this.handleChange}
        />

      </BlockWrapper>
    );
  }
}

export default RichTextBlock;
