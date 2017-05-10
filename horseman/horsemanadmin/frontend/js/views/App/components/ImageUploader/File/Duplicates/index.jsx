import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { autobind } from 'core-decorators';

import Duplicate from './Duplicate';

import './styles.scss';


class Duplicates extends Component {

  static propTypes = {
    ids: PropTypes.arrayOf(PropTypes.string).isRequired,
    imagesById: PropTypes.object.isRequired,
    imagesRequest: PropTypes.func.isRequired,
    replaceIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    toggleReplaceIds: PropTypes.func.isRequired,
    uploadAndReplace: PropTypes.func.isRequired,
    uploadAnyway: PropTypes.func.isRequired,
    viewOnly: PropTypes.bool,
  };

  static defaultProps = {
    viewOnly: false,
  };

  componentWillMount() {
    const { ids, imagesRequest } = this.props;
    if (ids && ids.length > 0) {
      imagesRequest({ pk__in: ids });
    }
  }

  _toggleIds(all = true) {
    const toggled = [];
    const { ids, replaceIds } = this.props;
    ids.forEach((id) => {
      const index = replaceIds.indexOf(id);
      if (all && index === -1) {
        toggled.push(id);
      } else if (!all && index !== -1) {
        toggled.push(id);
      }
    });
    this.props.toggleReplaceIds(toggled);
  }

  @autobind
  handleSelectAll() {
    this._toggleIds(true);
  }

  @autobind
  handleSelectNone() {
    this._toggleIds(false);
  }

  render() {
    const { ids, replaceIds, viewOnly } = this.props;
    return (
      <div styleName='root'>

        { !viewOnly && ids && ids.length > 1 ?
          <div styleName='select-actions'>
            <button
              type='button'
              className='link'
              onClick={this.handleSelectAll}
            >
              <FormattedMessage
                id='imageUpload.file.duplicates.selectAll'
                defaultMessage='Select all'
              />
            </button>

            <button
              type='button'
              className='link'
              onClick={this.handleSelectNone}
            >
              <FormattedMessage
                id='imageUpload.file.duplicates.selectNone'
                defaultMessage='Select none'
              />
            </button>
          </div>
        : null }

        <ul styleName='list'>
          { (ids || []).map((id) => {
            const image = this.props.imagesById[id];
            if (!image) return null;
            return (
              <Duplicate
                key={id}
                image={image}
                replace={replaceIds.indexOf(id) !== -1}
                toggleReplace={() => this.props.toggleReplaceIds(id)}
                viewOnly={viewOnly}
              />
            );
          }) }
        </ul>

        { !viewOnly ?
          <div styleName='actions'>

            <button
              type='button'
              className='btn btn-primary'
              disabled={!(replaceIds.length > 0)}
              onClick={this.props.uploadAndReplace}
            >
              <FormattedMessage
                id='imageUpload.file.duplicates.replace'
                values={{ numReplacements: replaceIds.length }}
                defaultMessage='{numReplacements, plural,
                  =0 {Select images to replace}
                  one {Replace image}
                  other {Replace {numReplacements, number} images}
                }'
              />
            </button>

            <button
              type='button'
              className='btn btn-secondary'
              onClick={this.props.uploadAnyway}
            >
              <FormattedMessage
                id='imageUpload.file.duplicates.uploadAnyway'
                defaultMessage='Upload duplicate anyway'
              />
            </button>

          </div>
        : null }

      </div>
    );
  }
}

export default Duplicates;
