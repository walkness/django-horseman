import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';

import Nav, { NavItem } from '../Nav';
import ImageBrowser from '../ImageBrowser';
import ImageUploader from '../ImageUploader';

import SelectedPreview from './SelectedPreview';

import styles from './styles.css';


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

  render() {
    const { mode, selected } = this.state;
    const lastSelected = this.props.imagesById[
      selected.length > 0 && selected[selected.length - 1]];
    return (
      <div styleName='styles.ImageChooser'>

        <header styleName='styles.header'>
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
              <div styleName='styles.library'>

                <div styleName='styles.browser'>
                  <ImageBrowser
                    imagesById={this.props.imagesById}
                    orderedImages={this.props.orderedImages}
                    imagesRequest={this.props.imagesRequest}
                    selected={selected}
                    onImageClick={this.handleImageSelected}
                  />
                </div>

                <div styleName='styles.selectedImage'>
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

        <footer styleName='styles.footer'>
          <button
            type='button'
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
