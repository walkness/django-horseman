import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withFormsy } from 'formsy-react';
import { autobind } from 'core-decorators';

import BaseInputWrapper from 'react-formsy-bootstrap-components/InputWrapper';
import FormGroup from 'react-formsy-bootstrap-components/FormGroup';

import Image from 'Components/Image';
import ImageChooserModal from 'Components/ImageChooser/Modal';

import InputWrapper from './InputWrapper';

import './styles.scss';


class _ImageChooser extends Component {

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
    const { formsy, onChange } = this.props;
    const { setValue } = formsy;
    if (setValue) setValue(id);
    if (onChange) onChange(id);
    this.setState({ showModal: false });
  }

  render() {
    const { imagesById } = this.props;
    const { showModal } = this.state;
    const image = imagesById[this.props.value];
    return (
      <div styleName='image-chooser'>

        { image ?
          <Image image={image} srcSize='thumbnail_300' />
        : null }

        <div styleName='image-chooser-actions'>

          <button
            type='button'
            className='btn'
            onClick={() => this.setState({ showModal: !showModal })}
          >
            Select image
          </button>

          <button
            type='button'
            className='btn'
            onClick={() => this.handleChange(null)}
          >
            Remove image
          </button>

        </div>

        { showModal ?
          <ImageChooserModal
            imagesById={imagesById}
            orderedImages={this.props.orderedImages}
            imagesRequest={this.props.imagesRequest}
            onSubmit={this.handleChange}
            imageUploaded={this.props.imageUploaded}
            selected={image ? [image.pk] : []}
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

export const ImageChooser = InputWrapper(BaseInputWrapper(_ImageChooser, FormGroup));

export default withFormsy(ImageChooser);
