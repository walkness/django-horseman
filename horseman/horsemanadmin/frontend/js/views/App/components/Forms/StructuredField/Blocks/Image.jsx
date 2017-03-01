import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';

import Block from './HOC';

import Image from '../../../Image';
import ImageChooserModal from '../../../ImageChooser/Modal';

import { Unattached as Select } from '../../../Forms/Select';

import styles from './styles.css';


class ImageBlock extends Component {

  static propTypes = {
    block: PropTypes.object.isRequired,
    imagesById: PropTypes.object.isRequired,
    orderedImages: PropTypes.object.isRequired,
    imagesRequest: PropTypes.func.isRequired,
    imageUploaded: PropTypes.func.isRequired,
    onChange: PropTypes.func,
    multiple: PropTypes.bool,
    gallery: PropTypes.bool,
  };

  static defaultProps = {
    onChange: () => {},
    multiple: false,
    gallery: false,
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

  @autobind
  handleSizeChange(value) {
    this.props.onChange(this.getBlock(null, value));
  }

  @autobind
  handleColumnsChange(value) {
    this.props.onChange(this.getBlock(null, null, value));
  }

  getBlock(value = null, size = null, columns = null) {
    const imagesKey = this.props.multiple ? 'images' : 'id';
    const block = Object.assign({}, this.props.block);
    if (value) {
      block[imagesKey] = value;
    }
    if (size) {
      block.size = size;
    }
    if (columns) {
      block.columns = parseInt(columns, 10);
    }
    return block;
  }

  getAPIValue() {
    return this.getBlock();
  }

  render() {
    const { imagesById, block, gallery, defaultSize, minColumns, maxColumns } = this.props;
    const multiple = gallery || this.props.multiple;
    const { showModal } = this.state;
    const { id, images, size, columns } = block;
    return (
      <div styleName='styles.image'>

        <div styleName='styles.selected-images'>
          { (multiple ? (images || []) : [id]).map((id) => {
            const image = imagesById[id];
            return <Image image={image} srcSize={size || defaultSize || 'thumbnail_300'} />;
          }) }
        </div>

        <button
          type='button'
          onClick={() => this.setState({ showModal: !showModal })}
        >
          Select image{ multiple ? 's' : '' }
        </button>

        { gallery ?
          <Select
            name='size'
            label='Size'
            options={this.props.sizeOptions}
            getValue={() => (size || defaultSize)}
            setValue={this.handleSizeChange}
          />
        : null }

        { gallery ?
          <Select
            name='columns'
            label='Columns'
            options={(
              Array.from(Array((minColumns + maxColumns) - 1)).slice(minColumns).map((_, index) => {
                const num = index + 2;
                return { value: num, label: `${num}` };
              })
            )}
            getValue={() => columns || 2}
            setValue={this.handleColumnsChange}
          />
        : null }

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
