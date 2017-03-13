import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { routerShape } from 'react-router/lib/PropTypes';
import { FormattedMessage, FormattedRelative } from 'react-intl';

import styles from './styles.css';


class RevisionsList extends Component {

  static propTypes = {
    revisions: PropTypes.arrayOf(PropTypes.string).isRequired,
    revisionsById: PropTypes.object.isRequired,
    current: PropTypes.string,
    usersById: PropTypes.object.isRequired,
  };

  static contextTypes = {
    router: routerShape.isRequired,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      showList: false,
    };
  }

  render() {
    const { showList } = this.state;
    const { revisions, revisionsById, current, usersById } = this.props;
    const currentRevision = revisionsById[current];
    const currentRevisionUser = currentRevision && usersById[currentRevision.revision.created_by];
    return (
      <div styleName='styles.revisions'>

        { currentRevision ?
          <div styleName='styles.current-revision'>
            <FormattedMessage
              id='node.edit.revisions.current'
              values={{
                revisionDateRelative: (
                  <FormattedRelative value={new Date(currentRevision.revision.created_at)}>
                    { formatted => (
                      <time dateTime={currentRevision.revision.created_at}>{ formatted }</time>
                    ) }
                  </FormattedRelative>
                ),
                revisedBy: currentRevisionUser && currentRevisionUser.first_name,
              }}
              defaultMessage='Last modified {revisionDateRelative} by {revisedBy}'
            />
          </div>
        : null }

        <button type='button' onClick={() => this.setState({ showList: !showList })}>
          ▲
        </button>

        { showList ?
          <ul styleName='styles.revisions-list'>
            { (revisions || []).map((id) => {
              const revision = revisionsById[id];
              const revisionUser = revision && usersById[revision.revision.created_by];
              return (
                <li key={id}>
                  <Link
                    to={{
                      pathname: this.context.router.location.pathname,
                      query: { revision: id },
                    }}
                    styleName='styles.revision'
                  >
                    <FormattedMessage
                      id='node.edit.revisions.list.title'
                      values={{
                        revisionDateRelative: (
                          <FormattedRelative value={new Date(revision.revision.created_at)}>
                            { formatted => (
                              <time dateTime={revision.revision.created_at}>{ formatted }</time>
                            ) }
                          </FormattedRelative>
                        ),
                        revisedBy: revisionUser && revisionUser.first_name,
                      }}
                      defaultMessage='{revisionDateRelative} by {revisedBy}'
                    />
                  </Link>
                </li>
              );
            }) }
          </ul>
        : null }
      </div>
    );
  }
}

export default RevisionsList;
