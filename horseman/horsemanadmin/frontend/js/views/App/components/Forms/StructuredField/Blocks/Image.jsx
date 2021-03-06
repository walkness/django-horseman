import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';

import Image from 'Components/Image';
import ImageChooserModal from 'Components/ImageChooser/Modal';

import { Select } from 'Components/Forms/Select';

import Block from './HOC';

import styles from './styles.scss';


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
    defaultColumns: PropTypes.number,
  };

  static defaultProps = {
    onChange: () => {},
    multiple: false,
    gallery: false,
    defaultColumns: 2,
  };

  constructor(props, context) {
    super(props, context);
    const { block } = props;
    const { autoCreated } = block;
    this.state = {
      showModal: !autoCreated && !!props.isNew,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isNew) {
      this.setState({ showModal: true });
    }
  }

  @autobind
  handleChange(value) {
    const { allowMultipleBlocks, gallery, onAddAfterClick, onChange, block } = this.props;
    if (allowMultipleBlocks && !gallery) {
      const otherIds = value.slice(0);
      const first = otherIds.shift();
      if (otherIds.length > 0) {
        const otherBlocks = otherIds.map(id => ({ id, autoCreated: true }));
        onAddAfterClick(block.type, otherBlocks, () => {
          onChange(this.getBlock(first));
        });
      } else {
        onChange(this.getBlock(first));
      }
    } else {
      onChange(this.getBlock(value));
    }
    this.setState({ showModal: false });
  }

  @autobind
  handleCloseModal() {
    const { isNew, index, deleteBlock, block } = this.props;
    const value = block && block.images;
    this.setState({ showModal: false }, () => {
      if (isNew && (!value || value.length === 0)) {
        deleteBlock(index);
      }
    });
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
    const { multiple, gallery, defaultSize, defaultColumns } = this.props;
    const imagesKey = multiple || gallery ? 'images' : 'id';
    const block = Object.assign({}, this.props.block);
    if (value) block[imagesKey] = value;
    if (size) block.size = size;
    if (columns) block.columns = parseInt(columns, 10);
    if (!block.size) block.size = defaultSize;
    if (!block.columns) block.columns = defaultColumns;
    return block;
  }

  getAPIValue() {
    return this.getBlock();
  }

  render() {
    const { imagesById, block, gallery, defaultSize, minColumns, maxColumns } = this.props;
    const multiple = gallery || this.props.multiple;
    const allowMultiple = multiple || this.props.allowMultipleBlocks;
    const { showModal } = this.state;
    const { id, images, size, columns } = block;
    return (
      <div styleName='styles.image'>

        <div styleName='styles.selected-images' data-columns={columns}>
          { (multiple ? (images || []) : [id]).map((id) => {
            const image = imagesById[id];
            if (!image) return null;
            return <Image image={image} srcSize={size || defaultSize || 'thumbnail_300'} />;
          }) }
        </div>

        <div styleName='styles.image-controls'>

          <button
            type='button'
            className='btn'
            onClick={() => this.setState({ showModal: !showModal })}
          >
            Select image{ allowMultiple ? 's' : '' }
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
              getValue={() => columns || this.props.defaultColumns}
              setValue={this.handleColumnsChange}
            />
          : null }

        </div>

        { showModal ?
          <ImageChooserModal
            imagesById={imagesById}
            orderedImages={this.props.orderedImages}
            imagesRequest={this.props.imagesRequest}
            onSubmit={this.handleChange}
            imageUploaded={this.props.imageUploaded}
            selected={multiple ? (images || []) : (id ? [id] : [])}
            multiple={allowMultiple}
            modalProps={{
              closeModal: this.handleCloseModal,
            }}
            filters={this.props.imageFilters}
            handleFiltersChange={this.props.handleImageFiltersChange}
          />
        : null }

      </div>
    );
  }
}

export default Block(ImageBlock);
