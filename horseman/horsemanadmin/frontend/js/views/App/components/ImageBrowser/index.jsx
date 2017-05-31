/* globals window document */

import React, { Component, PropTypes } from 'react';
import { autobind } from 'core-decorators';
import { isEqual } from 'lodash';
import classNames from 'classnames';

import { Input } from '../Forms/Input';

import Grid from './Grid';
import Filters from './Filters';
import Ordering from './Ordering';

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
    defaultOrder: PropTypes.string,
  };

  static defaultProps = {
    filters: {},
    handleFiltersChange: () => {},
    defaultOrder: '-created_at',
  };

  constructor(props, context) {
    super(props, context);
    const filtersWithoutSearchAndOrder = Object.assign({}, props.filters);
    delete filtersWithoutSearchAndOrder.search;
    delete filtersWithoutSearchAndOrder.ordering;
    this.state = {
      mode: MODES.GRID,
      showFilters: !!Object.keys(filtersWithoutSearchAndOrder).length,
    };
    this.pastThreshold = false;
    this.scrollThreshold = 300;
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
    const { imagesRequest, filters, defaultOrder, useWindowScroll } = props || this.props;
    const node = this.getOrderedNode(props);
    let limit = null;
    if (useWindowScroll) {
      const rows = Math.ceil((window.innerHeight - 150) / 150);
      limit = rows * 8;
    } else {
      const rows = Math.ceil((window.innerHeight - 400) / 140);
      limit = rows * 8;
    }
    if (!(node && node.ids) || (node && node.needsUpdate) || (filters.search && node.next)) {
      imagesRequest(Object.assign({}, { ordering: defaultOrder }, filters, limit && { limit }));
    }
  }

  getActiveFilter(props) {
    const { filters, defaultOrder } = props || this.props;
    const searchLessFilters = Object.assign({}, { ordering: defaultOrder }, filters);
    delete searchLessFilters.search;
    return (
      Object.keys(searchLessFilters).map(key => `${key}=${searchLessFilters[key]}`).join('&') ||
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
    const { selected } = props || this.props;
    const node = this.getOrderedNode(props);
    const ids = ((node && node.ids) || []).slice(0);
    (selected || []).forEach((id) => {
      if (id && ids.indexOf(id) === -1) {
        ids.unshift(id);
      }
    });
    return ids;
  }

  getSearchedImages(props) {
    const { imagesById, filters } = props || this.props;
    const ids = this.getOrderedImages(props);
    const searchStr = filters.search;
    if (!searchStr) return ids;
    const re = new RegExp(`(?:^|\s|-|_|>)${searchStr}`, 'ig');
    return ids.filter((id) => {
      const image = imagesById[id];
      return (
        image && (
          (image.title && image.title.match(re)) ||
          (image.original_filename && image.original_filename.match(re))
        )
      );
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
    const delta = (this._contentHeight - this._containerHeight) - scrollTop;
    if (delta <= this.scrollThreshold && !this.pastThreshold) {
      this.pastThreshold = true;
      this.handleLoadNext();
    } else if (delta > this.scrollThreshold) {
      this.pastThreshold = false;
    }
  }

  @autobind
  handleSearchInputChange(value) {
    this.props.handleFiltersChange({ search: value });
  }

  @autobind
  handleLoadNext() {
    const ordered = this.getOrderedNode();
    if (ordered.next && !ordered.loading) {
      this.props.imagesRequest(Object.assign(
        {},
        { ordering: this.props.defaultOrder },
        this.props.filters,
        ordered.next,
      ));
    }
  }

  render() {
    const { mode, showFilters } = this.state;
    const { imagesById, selected, onImageClick, filters, handleFiltersChange } = this.props;
    const ids = this.getSearchedImages();
    return (
      <div
        className={classNames('image-browser', { 'scroll-container': !this.props.useWindowScroll })}
        onScroll={this.handleScroll}
        styleName='styles.browser'
        ref={(c) => { this.browser = c; }}
      >

        <div styleName='styles.filters'>
          <div styleName='search-ordering'>
            <Input
              name='s'
              label='Search'
              getValue={() => filters.search || null}
              setValue={this.handleSearchInputChange}
            />
            <Ordering
              ordering={filters.ordering}
              onChange={ordering => handleFiltersChange({ ordering })}
              defaultOrder='-created_at'
            />
          </div>
          <Filters
            filters={filters}
            handleFiltersChange={handleFiltersChange}
            display={showFilters}
            toggleDisplay={() => this.setState({ showFilters: !showFilters })}
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
