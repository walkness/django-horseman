import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';

import Block from './HOC';

import Image from '../../../Image';
import ImageChooserModal from '../../../ImageChooser/Modal';


class ImageBlock extends Component {

  static propTypes = {
    block: PropTypes.object.isRequired,
    imagesById: PropTypes.object.isRequired,
    orderedImages: PropTypes.object.isRequired,
    imagesRequest: PropTypes.func.isRequired,
    imageUploaded: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    multiple: PropTypes.bool,
  };

  static defaultProps = {
    onChange: () => {},
    multiple: false,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      showModal: false,
    };
  }

  @autobind
  handleChange(value) {
    this.props.onChange(this.getBlock(value));
    this.setState({ showModal: false });
  }

  getBlock(value) {
    const { type } = this.props.block;
    return { type, [this.props.multiple ? 'images' : 'id']: value };
  }

  getAPIValue() {
    const { multiple, block } = this.props;
    const { id, images } = block;
    return this.getBlock(multiple ? images : id);
  }

  render() {
    const { imagesById, block, multiple } = this.props;
    const { showModal } = this.state;
    const { id, images } = block;
    return (
      <div>

        { (multiple ? (images || []) : [id]).map((id) => {
          const image = imagesById[id];
          return <Image image={image} srcSize='thumbnail_300' />;
        }) }

        <button
          type='button'
          onClick={() => this.setState({ showModal: !showModal })}
        >
          Select image{ multiple ? 's' : '' }
        </button>

        { showModal ?
          <ImageChooserModal
            imagesById={imagesById}
            orderedImages={this.props.orderedImages}
            imagesRequest={this.props.imagesRequest}
            onSubmit={this.handleChange}
            imageUploaded={this.props.imageUploaded}
            selected={multiple ? (images || []) : [id]}
            multiple={multiple}
            modalProps={{
              closeModal: () => this.setState({ showModal: false }),
            }}
          />
        : null }

      </div>
    );
  }
}

export default Block(ImageBlock);
