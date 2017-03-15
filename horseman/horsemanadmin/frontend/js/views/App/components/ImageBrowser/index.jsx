/* globals window document */

import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';

import { Input } from '../Forms/Input';

import Grid from './Grid';


const MODES = {
  GRID: 'GRID',
  LIST: 'LIST',
};


class ImageBrowser extends Component {

  static propTypes = {
    imagesById: PropTypes.object.isRequired,
    orderedImages: PropTypes.object.isRequired,
    useWindowScroll: PropTypes.bool,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      mode: MODES.GRID,
      search: null,
    };
    this.pastThreshold = false;
    this.scrollThreshold = 0.25;
  }

  componentWillMount() {
    this.props.imagesRequest();
  }

  componentDidMount() {
    if (this.props.useWindowScroll) {
      window.addEventListener('scroll', this.handleScroll);
    }
    this._setDimensions();
  }

  componentDidUpdate() {
    this._setDimensions();
  }

  componentWillUnmount() {
    if (this.props.useWindowScroll) {
      window.removeEventListener('scroll', this.handleScroll);
    }
  }

  _setDimensions() {
    if (this.props.useWindowScroll) {
      this._containerHeight = window.innerHeight;
      this._contentHeight = document.documentElement.scrollHeight;
    }
  }

  @autobind
  handleScroll(e) {
    const scrollTop = this.props.useWindowScroll ? window.scrollY : null;
    const pct = scrollTop / (this._contentHeight - this._containerHeight);
    if (pct >= (1 - this.scrollThreshold) && !this.pastThreshold) {
      this.pastThreshold = true;
      this.handleLoadNext();
    } else if (pct < (1 - this.scrollThreshold)) {
      this.pastThreshold = false;
    }
  }

  @autobind
  handleSearchInputChange(value) {
    this.setState({ search: value });
  }

  @autobind
  handleLoadNext() {
    const ordered = this.props.orderedImages.default;
    if (ordered.next && !ordered.loading) {
      this.props.imagesRequest(Object.assign({}, ordered.next));
    }
  }

  render() {
    const { mode, search } = this.state;
    const { imagesById, orderedImages, selected, onImageClick } = this.props;
    const ids = (orderedImages.default && orderedImages.default.ids) || [];
    return (
      <div className='image-browser'>

        <div>
          <Input
            name='s'
            label='Search'
            getValue={() => search}
            setValue={this.handleSearchInputChange}
          />
        </div>

        { mode === MODES.GRID ?
          <Grid
            ids={ids}
            imagesById={imagesById}
            getLink={this.props.getLink}
            selected={selected}
            onImageClick={onImageClick}
            onLoadNext={this.handleLoadNext}
          />
        : null }

      </div>
    );
  }
}

export default ImageBrowser;
