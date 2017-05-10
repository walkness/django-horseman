import React, { Component, PropTypes } from 'react';

import './styles.scss';


class Duplicates extends Component {

  static propTypes = {
    ids: PropTypes.arrayOf(PropTypes.string).isRequired,
    imagesById: PropTypes.object.isRequired,
    imagesRequest: PropTypes.func.isRequired,
  };

  componentWillMount() {
    const { ids, imagesRequest } = this.props;
    if (ids && ids.length > 0) {
      imagesRequest({ pk__in: ids });
    }
  }

  render() {
    return (
      <div styleName='root' />
    );
  }
}

export default Duplicates;
