import React, { Component, PropTypes } from 'react';
import { HOC } from 'formsy-react';
import { autobind } from 'core-decorators';

import Image from '../Image';
import ImageChooserModal from '../ImageChooser/Modal';


class ImageChooser extends Component {

  static propTypes = {
    onChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    onChange: () => {},
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

export default HOC(ImageChooser);
