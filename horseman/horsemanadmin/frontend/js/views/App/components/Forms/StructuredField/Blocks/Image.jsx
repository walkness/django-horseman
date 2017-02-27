import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';

import Block from './HOC';

import Image from '../../../Image';
import ImageChooserModal from '../../../ImageChooser/Modal';


class ImageBlock extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      showModal: false,
    };
  }

  @autobind
  handleChange(id) {
    this.props.onChange(this.getBlock(id));
    this.setState({ showModal: false });
  }

  getBlock(id) {
    const { type } = this.props.block;
    return { type, id };
  }

  getAPIValue() {
    return this.getBlock(this.props.block.id);
  }

  render() {
    const { imagesById, block } = this.props;
    const { showModal } = this.state;
    const { id } = block;
    const image = imagesById[id];
    return (
      <div>

        { image ?
          <Image image={image} srcSize='thumbnail_300' />
        : null }

        <button
          type='button'
          onClick={() => this.setState({ showModal: !showModal })}
        >
          Select image
        </button>

        { showModal ?
          <ImageChooserModal
            imagesById={imagesById}
            orderedImages={this.props.orderedImages}
            imagesRequest={this.props.imagesRequest}
            onSubmit={this.handleChange}
            imageUploaded={this.props.imageUploaded}
          />
        : null }

      </div>
    );
  }
}

export default Block(ImageBlock);
