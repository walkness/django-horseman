/* globals window document */

import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import { isEqual } from 'lodash';
import classNames from 'classnames';

import { Input } from '../Forms/Input';

import Grid from './Grid';

import styles from './styles.css';


const MODES = {
  GRID: 'GRID',
  LIST: 'LIST',
};


class ImageBrowser extends Component {

  static propTypes = {
    imagesById: PropTypes.object.isRequired,
    orderedImages: PropTypes.object.isRequired,
    useWindowScroll: PropTypes.bool,
    filters: PropTypes.object,
    handleFiltersChange: PropTypes.func,
  };

  static defaultProps = {
    filters: {},
    handleFiltersChange: () => {},
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      mode: MODES.GRID,
    };
    this.pastThreshold = false;
    this.scrollThreshold = 0.25;
  }

  componentWillMount() {
    this.getImages();
  }

  componentDidMount() {
    if (this.props.useWindowScroll) {
      window.addEventListener('scroll', this.handleScroll);
    }
    this._setDimensions();
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.filters, this.props.filters)) {
      this.getImages(nextProps);
    }
  }

  componentDidUpdate() {
    this._setDimensions();
  }

  componentWillUnmount() {
    if (this.props.useWindowScroll) {
      window.removeEventListener('scroll', this.handleScroll);
    }
  }

  getImages(props) {
    const { orderedImages, imagesRequest, filters } = props || this.props;
    const node = this.getOrderedNode(props);
    if (!(node && node.ids)) {
      imagesRequest(filters);
    }
  }

  getActiveFilter(props) {
    const { filters } = props || this.props;
    const searchLessFilters = Object.assign({}, filters);
    delete searchLessFilters.search;
    return (
      Object.keys(searchLessFilters).map(key => `${key}=${filters[key]}`).join('&') ||
      'default'
    );
  }

  getCachedSearch(props) {
    const { filters, orderedImages } = props || this.props;
    const searchStr = filters.search;
    const filterStr = this.getActiveFilter(props);
    const filtered = orderedImages[filterStr];
    const allCaches = Object.keys((filtered && filtered.search) || {});
    return allCaches.reduce((prev, curr) => {
      if (searchStr.startsWith(curr)) return curr;
      return prev;
    }, null);
  }

  getOrderedNode(props) {
    const { orderedImages, filters } = props || this.props;
    const filterStr = this.getActiveFilter(props);
    const ordered = orderedImages[filterStr];
    if (filters.search) {
      const cachedSearch = this.getCachedSearch(props);
      return (
        ordered && ordered.search && ordered.search[cachedSearch]
      );
    }
    return ordered;
  }

  getOrderedImages(props) {
    const node = this.getOrderedNode(props);
    return (node && node.ids) || [];
  }

  getSearchedImages(props) {
    const { imagesById, filters } = props || this.props;
    const ids = this.getOrderedImages(props);
    const searchStr = filters.search;
    if (!searchStr) return ids;
    const re = new RegExp(`(?:^|\s)${searchStr}`, 'ig');
    return ids.filter((id) => {
      const image = imagesById[id];
      return image && image.title && image.title.match(re);
    });
  }

  _setDimensions() {
    if (this.props.useWindowScroll) {
      this._containerHeight = window.innerHeight;
      this._contentHeight = document.documentElement.scrollHeight;
    } else {
      const containerRect = this.container.getBoundingClientRect();
      const contentRect = this.content.getBoundingClientRect();
      this._containerHeight = containerRect.height;
      this._contentHeight = contentRect.height;
    }
  }

  @autobind
  handleScroll(e) {
    const scrollTop = this.props.useWindowScroll ? window.scrollY : e.target.scrollTop;
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
    this.props.handleFiltersChange({ search: value });
  }

  @autobind
  handleLoadNext() {
    const ordered = this.props.orderedImages.default;
    if (ordered.next && !ordered.loading) {
      this.props.imagesRequest(Object.assign({}, ordered.next));
    }
  }

  render() {
    const { mode } = this.state;
    const { imagesById, selected, onImageClick, filters } = this.props;
    const ids = this.getSearchedImages();
    return (
      <div
        className={classNames('image-browser', { 'scroll-container': !this.props.useWindowScroll })}
        onScroll={this.handleScroll}
        styleName='styles.browser'
        ref={(c) => { this.browser = c; }}
      >

        <div styleName='styles.filters'>
          <Input
            name='s'
            label='Search'
            getValue={() => filters.search || null}
            setValue={this.handleSearchInputChange}
          />
        </div>

        <div styleName='styles.images' ref={(c) => { this.container = c; }}>

          { mode === MODES.GRID ?
            <Grid
              ids={ids}
              imagesById={imagesById}
              getLink={this.props.getLink}
              selected={selected}
              onImageClick={onImageClick}
              onLoadNext={this.handleLoadNext}
              contentRef={(c) => { this.content = c; }}
            />
          : null }

        </div>

      </div>
    );
  }
}

export default ImageBrowser;
