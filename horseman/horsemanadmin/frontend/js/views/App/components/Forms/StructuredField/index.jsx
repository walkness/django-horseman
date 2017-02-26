import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';

import InputWrapper from '../InputWrapper';

import { RichText, Image } from './Blocks';
import AddBlock from './AddBlock';


class StructuredField extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      value: [],
    };
    if (Array.isArray(props.value)) this.state.value = props.value;
    this.blockRefs = [];
  }

  updateBlock(index, newValue) {
    const value = this.state.value.slice(0);
    value[index] = Object.assign({}, value[index], newValue);
    this.setState({ value });
  }

  @autobind
  addNewBlock(type, before = null) {
    const value = this.state.value.slice(0);
    if (before) {
      value.insertAt({ type }, before);
    } else {
      value.push({ type });
    }
    this.setState({ value });
  }

  @autobind
  deleteBlock(index) {
    const value = this.state.value.slice(0);
    value.splice(index, 1);
    this.setState({ value });
  }

  getAPIValue() {
    return this.state.value.map((block, i) => {
      if (this.blockRefs[i]) {
        return this.blockRefs[i].getAPIValue();
      }
      return block;
    });
  }

  render() {
    const { label } = this.props;
    return (
      <InputWrapper label={label}>

        { this.state.value.map((block, i) => {
          const blockProps = {
            key: i,
            index: i,
            onChange: v => this.updateBlock(i, v),
            deleteBlock: this.deleteBlock,
            ref: c => { this.blockRefs[i] = c; },
            block,
          };
          if (block.type === 'richtext') {
            return <RichText {...blockProps} />;
          }
          if (block.type === 'image') {
            return (
              <Image
                {...blockProps}
                imagesById={this.props.imagesById}
                orderedImages={this.props.orderedImages}
                imagesRequest={this.props.imagesRequest}
              />
            );
          }
          return null;
        }) }

        <AddBlock
          blocks={this.props.fieldConfig.blocks}
          onClick={this.addNewBlock}
        />

      </InputWrapper>
    );
  }
}

export default StructuredField;
