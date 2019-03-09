/* eslint no-underscore-dangle: ["error", { "allow": ["_focus"] }] */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import AceEditor from 'react-ace';

import 'brace/mode/html';
import 'brace/theme/xcode';

import HOC from './HOC';

import './styles.scss';


class RichTextBlock extends Component {

  static propTypes = {
    isNew: PropTypes.bool.isRequired,
    block: PropTypes.shape({
      type: PropTypes.string,
      value: PropTypes.oneOfType([
        PropTypes.string,
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
      this.editor.editor.focus();
    }
  }

  getBlock(value) {
    const { type } = this.props.block;
    return { type, value };
  }

  getAPIValue() {
    const { value } = this.props.block;
    return this.getBlock(value);
  }

  @autobind
  handleChange(value) {
    this.props.onChange(this.getBlock(value));
  }

  render() {
    const { block, setWrapperClassName } = this.props;
    const { value } = block;
    return (
      <AceEditor
        mode='html'
        theme='xcode'
        onChange={this.handleChange}
        value={value}
        ref={(c) => { this.editor = c; }}
        onFocus={() => setWrapperClassName('hide-block-controls')}
        onBlur={() => setWrapperClassName(null)}
        width='100%'
        height='150px'
        styleName='html'
        showPrintMargin={false}
      />
    );
  }
}

export default HOC(RichTextBlock);
