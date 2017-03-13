import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';

import InputWrapper from '../InputWrapper';

import { RichText, Image } from './Blocks';
import AddBlock from './AddBlock';

import styles from './styles.css';


const getBlockConfig = (fieldConfig, blockType) => {
  return ((fieldConfig && fieldConfig.blocks) || []).reduce((prev, curr) => {
    if (curr.type === blockType) return curr;
    return prev;
  }, null);
};


class StructuredField extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      value: [],
    };
    if (Array.isArray(props.value)) this.state.value = props.value;
    this.blockRefs = [];
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value && nextProps.value !== this.props.value) {
      this.setState({ value: nextProps.value });
    }
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
    return (
      <div styleName='styles.structured-field'>
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
          if (block.type === 'image' || block.type === 'gallery') {
            let sizeOptions;
            let defaultSize;
            let minCols = 2;
            let maxCols = 5;
            if (block.type === 'gallery') {
              const { fieldConfig } = this.props;
              const blockConfig = getBlockConfig(fieldConfig, block.type);
              sizeOptions = ((
                blockConfig && blockConfig.fields.size && blockConfig.fields.size.size_options
              ) || []).map(opt => ({ value: opt[0], label: opt[1] }));
              defaultSize = (
                (blockConfig.fields.size && blockConfig.fields.size.default)
              ) || (sizeOptions.length > 0 ? sizeOptions[0].value : null);
            }
            return (
              <Image
                {...blockProps}
                imagesById={this.props.imagesById}
                orderedImages={this.props.orderedImages}
                imagesRequest={this.props.imagesRequest}
                imageUploaded={this.props.imageUploaded}
                gallery={block.type === 'gallery'}
                sizeOptions={sizeOptions}
                defaultSize={defaultSize}
                minColumns={minCols}
                maxColumns={maxCols}
              />
            );
          }

          return null;
        }) }

        <AddBlock
          blocks={this.props.fieldConfig.blocks}
          onClick={this.addNewBlock}
        />
      </div>
    );
  }
}

export default InputWrapper(StructuredField);
