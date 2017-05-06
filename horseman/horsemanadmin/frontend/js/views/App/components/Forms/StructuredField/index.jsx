import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import { isEqual } from 'lodash';
import uuidV4 from 'uuid/v4';

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

const getInitialValue = (value) => {
  return value.map((block, i) => Object.assign({}, block, { key: uuidV4() }));
};


class StructuredField extends Component {

  static propTypes = {
    onChange: PropTypes.func,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      value: [],
      newest: null,
    };
    if (Array.isArray(props.value)) {
      this.state.value = getInitialValue(props.value);
    }
    this.blockRefs = [];
    this.blockChanging = null;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.value && !isEqual(this.props.value, nextProps.value)) {
      this.setState({ value: getInitialValue(nextProps.value) });
    }
  }

  componentDidUpdate() {
    this.blockChanging = null;
  }

  updateBlock(index, newValue) {
    const value = this.state.value.slice(0);
    value[index] = Object.assign({}, value[index], newValue);
    this.blockChanging = index;
    this.setState({ value, newest: null });
    if (this.props.onChange) {
      this.props.onChange();
    }
  }

  @autobind
  addNewBlock(type, before = null) {
    const value = this.state.value.slice(0);
    const block = { type, key: uuidV4() };
    if (before || before === 0) {
      value.splice(before, 0, block);
    } else {
      value.push(block);
    }
    this.setState({ value, newest: before === 0 ? before : (before || value.length - 1) });
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  @autobind
  deleteBlock(index) {
    const value = this.state.value.slice(0);
    value.splice(index, 1);
    this.setState({ value, newest: null });
    if (this.props.onChange) {
      this.props.onChange(value);
    }
  }

  @autobind
  moveBlockUp(index) {
    const value = this.state.value.slice(0);
    const block = this.blockRefs[index].getAPIValue();
    value.splice(index, 1);
    value.splice(Math.max(index - 1, 0), 0, block);
    this.setState({ value, newest: null });
  }

  @autobind
  moveBlockDown(index) {
    const value = this.state.value.slice(0);
    const block = this.blockRefs[index].getAPIValue();
    value.splice(index, 1);
    value.splice(Math.min(index + 1, value.length), 0, block);
    this.setState({ value, newest: null });
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
            key: block.key,
            index: i,
            onChange: (v, update) => this.updateBlock(i, v, update),
            deleteBlock: this.deleteBlock,
            ref: c => { this.blockRefs[i] = c; },
            block,
            blocks: this.props.fieldConfig.blocks,
            onAddBeforeClick: newBlock => this.addNewBlock(newBlock, i),
            onMoveUp: () => this.moveBlockUp(i),
            onMoveDown: () => this.moveBlockDown(i),
            isNew: this.state.newest === i,
            blockChanging: this.blockChanging === null ? null : this.blockChanging === i,
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
                imageFilters={this.props.imageFilters}
                handleImageFiltersChange={this.props.handleImageFiltersChange}
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
