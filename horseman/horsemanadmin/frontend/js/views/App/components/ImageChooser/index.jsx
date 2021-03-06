import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';

import Nav, { NavItem } from 'Components/Nav';
import ImageBrowser from 'Components/ImageBrowser';
import ImageUploader from 'Components/ImageUploader';

import SelectedPreview from './SelectedPreview';

import './styles.scss';


class ImageChooser extends Component {

  static propTypes = {
    multiple: PropTypes.bool,
    onSubmit: PropTypes.func,
    selected: PropTypes.arrayOf(PropTypes.string),
  };

  static defaultProps = {
    multiple: false,
    onSubmit: () => {},
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      mode: 'library',
      selected: props.selected || [],
      filters: {},
    };
  }

  @autobind
  handleImageSelected(id) {
    let selected = this.state.selected.slice(0);
    const index = this.state.selected.indexOf(id);
    if (index === -1) {
      if (this.props.multiple) {
        selected.push(id);
      } else {
        selected = [id];
      }
    } else {
      selected.splice(index, 1);
    }
    this.setState({ selected });
  }

  @autobind
  handleSubmit() {
    const { multiple, onSubmit } = this.props;
    const { selected } = this.state;
    onSubmit(multiple ? selected : selected[0]);
  }

  @autobind
  handleUploadSuccess(data) {
    const { imageUploaded, multiple, onSubmit } = this.props;
    imageUploaded(data);
    if (!multiple) {
      this.setState({ selected: [data.pk] }, () => {
        onSubmit(data.pk);
      });
    }
  }

  @autobind
  handleFiltersChange(newFilters) {
    const filters = Object.assign({}, this.state.filters, newFilters);
    this.setState({ filters });
  }

  render() {
    const { mode, selected } = this.state;
    const lastSelected = this.props.imagesById[
      selected.length > 0 && selected[selected.length - 1]];
    return (
      <div styleName='ImageChooser'>

        <header styleName='header'>
          <Nav>
            { [{ slug: 'library', name: 'Library' }, { slug: 'upload', name: 'Upload' }].map(({ slug, name }) => (
              <NavItem
                key={slug}
                active={mode === slug}
                onClick={() => this.setState({ mode: slug })}
              >
                { name }
              </NavItem>
            )) }
          </Nav>
        </header>

        <main styleName='contentWrapper'>
          <div styleName='content'>
            { mode === 'library' ?
              <div styleName='library'>

                <div styleName='browser'>
                  <ImageBrowser
                    imagesById={this.props.imagesById}
                    orderedImages={this.props.orderedImages}
                    imagesRequest={this.props.imagesRequest}
                    selected={selected}
                    onImageClick={this.handleImageSelected}
                    filters={this.props.filters || this.state.filters}
                    handleFiltersChange={
                      this.props.handleFiltersChange ||
                      this.handleFiltersChange
                    }
                  />
                </div>

                <div styleName='selectedImage'>
                  { lastSelected ?
                    <SelectedPreview image={lastSelected} />
                  : null }
                </div>

              </div>
            :
              <div>
                <ImageUploader onUploadSuccess={this.handleUploadSuccess} />
              </div>
            }
          </div>
        </main>

        <footer styleName='footer'>
          <button
            type='button'
            className='btn'
            disabled={selected.length === 0}
            onClick={this.handleSubmit}
          >
            Select
          </button>
        </footer>

      </div>
    );
  }
}

export default ImageChooser;
