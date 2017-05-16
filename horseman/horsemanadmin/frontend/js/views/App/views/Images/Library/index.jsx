import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { routerShape } from 'react-router/lib/PropTypes';
import { autobind } from 'core-decorators';
import Helmet from 'react-helmet';

import { images as imagesAction } from '../../../../../actions';

import ImageBrowser from '../../../components/ImageBrowser';


class ImageLibrary extends Component {

  static contextTypes = {
    router: routerShape.isRequired,
  };

  @autobind
  handleFiltersChange(changedFilters) {
    const { router } = this.context;
    const filters = Object.assign({}, router.location.query);
    Object.keys(changedFilters).forEach((key) => {
      const value = changedFilters[key];
      if (value) {
        filters[key] = encodeURIComponent(value);
      } else {
        delete filters[key];
      }
    });
    router.replace(Object.assign({}, router.location, {
      query: filters,
    }));
  }

  getFilters() {
    const query = this.context.router.location.query;
    const filters = {};
    Object.keys(query).forEach((key) => {
      const value = query[key];
      filters[key] = decodeURIComponent(value);
    });
    return filters;
  }

  render() {
    const { imagesById, orderedImages } = this.props;
    return (
      <div>

        <Helmet title='Image library' />

        <ImageBrowser
          orderedImages={orderedImages}
          imagesById={imagesById}
          imagesRequest={this.props.imagesRequest}
          getLink={image => `${this.props.adminBase}images/${image.pk}/`}
          filters={this.getFilters()}
          handleFiltersChange={this.handleFiltersChange}
          useWindowScroll
        />

      </div>
    );
  }
}

const mapStateToProps = state => ({
  orderedImages: state.images.ordered,
  imagesById: state.images.byId,
  adminBase: state.config.adminURLBase,
});

const imagesRequest = imagesAction.request;

export default connect(
  mapStateToProps, {
    imagesRequest,
  })(ImageLibrary);
