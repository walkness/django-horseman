import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';

import Modal, { ModalHeader, ModalFooter } from 'Components/Modal';
import Body from './Body';


export default class LinkModal extends Component {

  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      atts: {},
    };
  }

  componentDidMount() {
    if (this.linkInput && this.linkInput.focus) {
      this.linkInput.focus();
    }
  }

  @autobind
  handleSubmit() {
    this.props.onSubmit(this.state.atts);
  }

  render() {
    return (
      <Modal title='Insert link' closeModal={this.props.onCancel} size='small'>

        <ModalHeader />

        <Body
          atts={this.state.atts}
          onAttsChange={atts => this.setState({ atts })}
          onSubmit={this.handleSubmit}
          inputRef={(c) => {this.linkInput = c;}}
        />

        <ModalFooter>
          <button
            type='button'
            onClick={this.handleSubmit}
            className='btn'
            disabled={!this.state.atts.href}
          >
            Insert
          </button>
        </ModalFooter>

      </Modal>
    );
  }
}
