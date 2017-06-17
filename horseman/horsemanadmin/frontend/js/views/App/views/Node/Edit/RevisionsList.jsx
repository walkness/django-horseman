import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { routerShape } from 'react-router/lib/PropTypes';
import { FormattedMessage, FormattedRelative } from 'react-intl';
import classNames from 'classnames';

import Dropdown, { DropdownMenu, DropdownToggle } from 'Components/Dropdown';

import './styles.scss';


class RevisionsList extends Component {

  static propTypes = {
    revisions: PropTypes.arrayOf(PropTypes.string).isRequired,
    revisionsById: PropTypes.object.isRequired,
    current: PropTypes.string,
    usersById: PropTypes.object.isRequired,
    saving: PropTypes.bool,
  };

  static contextTypes = {
    router: routerShape.isRequired,
  };

  render() {
    const { revisions, revisionsById, current, latest, usersById, saving } = this.props;
    const currentRevision = revisionsById && revisionsById[current];
    const currentRevisionUser = currentRevision && usersById[currentRevision.revision.created_by];
    return (
      <div styleName='revisions'>

        { currentRevision ?
          <div styleName='current-revision'>
            { saving ?
              <FormattedMessage id='node.edit.saving' defaultMessage='Saving…' />
            :
              <FormattedMessage
                id='node.edit.revisions.current'
                values={{
                  latest: latest === current ? 'yes' : 'no',
                  revisionDateRelative: (
                    <FormattedRelative value={new Date(currentRevision.revision.created_at)}>
                      { formatted => (
                        <time dateTime={currentRevision.revision.created_at}>{ formatted }</time>
                      ) }
                    </FormattedRelative>
                  ),
                  revisedBy: currentRevisionUser && currentRevisionUser.first_name,
                }}
                defaultMessage='{latest, select,
                  yes {Last modified {revisionDateRelative} by {revisedBy}}
                  no {Revision created {revisionDateRelative} by {revisedBy}}
                }'
              />
            }
          </div>
        : null }

        <Dropdown>
          <DropdownToggle>▲</DropdownToggle>
          <DropdownMenu styleName='revisions-list'>
            { (revisions || []).map((id) => {
              const revision = revisionsById[id];
              const revisionUser = revision && usersById[revision.revision.created_by];
              const active = id === current;
              return (
                <li key={id}>
                  <Link
                    to={{
                      pathname: this.context.router.location.pathname,
                      query: id !== latest && { revision: id },
                    }}
                    className={classNames({ active })}
                    styleName='revision'
                  >
                    { revisionUser ?
                      <img src={revisionUser.gravatar} role='presentation' />
                    : null }
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
                    { revision.revision.active ?
                      <span styleName='tag'>Live</span>
                    : null }
                  </Link>
                </li>
              );
            }) }
          </DropdownMenu>
        </Dropdown>

      </div>
    );
  }
}

export default RevisionsList;
