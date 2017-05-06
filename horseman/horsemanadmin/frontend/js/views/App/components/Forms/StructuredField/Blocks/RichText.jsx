/* eslint no-underscore-dangle: ["error", { "allow": ["_focus"] }] */

import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';

import RichTextEditor, { EditorValue, createValueFromString } from '../../../RTE/src/RichTextEditor';

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
  };

  static defaultProps = {
    value: null,
  };

  componentDidMount() {
    if (this.props.isNew) {
      this.editor._focus();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isNew) {
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

  render() {
    const { value } = this.props.block;
    return (
      <RichTextEditor
        value={(
          !(value instanceof EditorValue) ?
          createValueFromString(value || '', 'html') :
          value
        )}
        onChange={this.handleChange}
        ref={(c) => { this.editor = c; }}
      />
    );
  }
}

export default HOC(RichTextBlock);
