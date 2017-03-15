import React, { Component, PropTypes } from 'react';
import { HOC } from 'formsy-react';
import { autobind } from 'core-decorators';

import Image from '../Image';
import ImageChooserModal from '../ImageChooser/Modal';

import InputWrapper from './InputWrapper';


class ImageChooser extends Component {

  static propTypes = {
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
  handleChange(id) {
    this.props.setValue(id);
    this.props.onChange(id);
    this.setState({ showModal: false });
  }

  render() {
    const { imagesById } = this.props;
    const { showModal } = this.state;
    const image = imagesById[this.props.getValue()];
    return (
      <div>

        { image ?
          <Image image={image} srcSize='thumbnail_300' />
        : null }

        <button
          type='button'
          className='btn'
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
            modalProps={{
              closeModal: () => this.setState({ showModal: false }),
            }}
            multiple={this.props.multiple}
            filters={this.props.imageFilters}
            handleFiltersChange={this.props.handleImageFiltersChange}
          />
        : null }

      </div>
    );
  }
}

export default HOC(InputWrapper(ImageChooser));
