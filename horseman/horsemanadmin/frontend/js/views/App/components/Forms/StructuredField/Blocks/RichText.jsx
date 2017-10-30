/* eslint no-underscore-dangle: ["error", { "allow": ["_focus"] }] */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';

import RichTextEditor, { EditorValue, createValueFromString } from 'Components/RTE/src/RichTextEditor';

import HOC from './HOC';


class RichTextBlock extends Component {

  static propTypes = {
    isNew: PropTypes.bool.isRequired,
    block: PropTypes.shape({
      type: PropTypes.string,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(EditorValue),
      ]),
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    setWrapperClassName: PropTypes.func.isRequired,
  };

  static defaultProps = {
    value: null,
  };

  componentDidMount() {
    const { block, isNew } = this.props;
    const { noFocusOnNew } = block;
    if (isNew && !noFocusOnNew) {
      this.editor._focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { block, isNew } = nextProps;
    const { noFocusOnNew } = block;
    if (isNew && !noFocusOnNew) {
      this.editor._focus();
    }
  }

  getBlock(value) {
    const { type } = this.props.block;
    return { type, value };
  }

  getAPIValue() {
    const { value } = this.props.block;
    return this.getBlock(value instanceof EditorValue ? value.toString('html') : value);
  }

  @autobind
  handleChange(value) {
    this.props.onChange(this.getBlock(value));
  }

  @autobind
  handleSplit(content, callback) {
    const { onAddAfterClick, block } = this.props;
    onAddAfterClick(block.type, content, { noFocusOnNew: true }, callback);
  }

  render() {
    const { block, setWrapperClassName } = this.props;
    const { value } = block;
    return (
      <RichTextEditor
        value={(
          !(value instanceof EditorValue) ?
          createValueFromString(value || '', 'html') :
          value
        )}
        onChange={this.handleChange}
        ref={(c) => { this.editor = c; }}
        onSplitBlock={this.handleSplit}
        onFocus={() => setWrapperClassName('hide-block-controls')}
        onBlur={() => setWrapperClassName(null)}
      />
    );
  }
}

export default HOC(RichTextBlock);
