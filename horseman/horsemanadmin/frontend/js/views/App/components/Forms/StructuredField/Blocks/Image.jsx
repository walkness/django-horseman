import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';

import BlockWrapper from './Wrapper';


class ImageBlock extends Component {

  @autobind
  handleChange(value) {
    this.props.onChange(this.getBlock(value));
  }

  getBlock(id) {
    const { type } = this.props.block;
    return { type, id };
  }

  getAPIValue() {
    return this.getBlock();
  }

  render() {
    const { imagesById, block } = this.props;
    const { id } = block;
    const image = imagesById[id];
    return (
      <BlockWrapper>

        <img
          src={image.renditions.thumbnail_300.url}
          alt={image.title}
        />

      </BlockWrapper>
    );
  }
}

export default ImageBlock;
