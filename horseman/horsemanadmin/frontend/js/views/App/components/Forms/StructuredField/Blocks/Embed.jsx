import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import debounce from 'lodash/debounce';
import FormattedDuration from 'react-intl-formatted-duration';

import { getOEmbed } from 'services/api';

import { Input } from '../../Input';

import HOC from './HOC';

import './styles.scss';


const MaybeLink = ({ link, children }) => {
  if (!link) return children;
  return <a href={link} rel='noopener noreferrer' target='_blank'>{ children }</a>;
};

MaybeLink.propTypes = {
  link: PropTypes.string,
  children: PropTypes.node,
};

MaybeLink.defaultProps = {
  link: null,
  children: null,
};

const DetailItem = ({ label, children }) => {
  if (!children) return null;
  return (
    <li>
      <div styleName='embed-detail-label'>{ label }</div>
      <div>{ children }</div>
    </li>
  );
};

DetailItem.propTypes = {
  label: PropTypes.node.isRequired,
  children: PropTypes.node,
};

DetailItem.defaultProps = {
  children: null,
};


class EmbedBlock extends Component {
  static propTypes = {
    isNew: PropTypes.bool.isRequired,
    block: PropTypes.shape({
      type: PropTypes.string,
      value: PropTypes.oneOfType([
        PropTypes.string,
      ]),
    }).isRequired,
    onChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    value: null,
  };

  constructor(props, context) {
    super(props, context);
    this.state = { loading: false };
    this.debouncedGetOEmbedData = debounce(this.getOEmbedData, 500);
  }

  getBlock(url, data = null) {
    const { type } = this.props.block;
    return { type, url, data };
  }

  getAPIValue() {
    const { url, data } = this.props.block;
    return this.getBlock(url, data);
  }

  getOEmbedData(url) {
    getOEmbed(url).then(({ response }) => {
      this.props.onChange(this.getBlock(url, response));
      this.setState({ loading: false });
    });
  }

  @autobind
  handleChange(url) {
    this.props.onChange(this.getBlock(url));
    if (url) {
      this.setState({ loading: true }, () => {
        this.debouncedGetOEmbedData(url);
      });
    }
  }

  render() {
    const { block } = this.props;
    const { loading } = this.state;
    const { url, data } = block;
    return (
      <div styleName='embed'>
        <Input
          name='url'
          placeholder='URL'
          label='URL of Resource to Embed:'
          onChange={this.handleChange}
          value={url}
        />
        { data &&
          <div styleName='embed-content'>
            { data.html &&
              <div
                styleName='embed-preview'
                dangerouslySetInnerHTML={{ __html: data.html }} // eslint-disable-line react/no-danger, max-len
              />
            }
            <div styleName='embed-details'>
              <ul>
                <DetailItem label='Title'>{ data.title }</DetailItem>
                <DetailItem label='Description'>{ data.description }</DetailItem>
                { data.duration &&
                  <DetailItem label='Length'>
                    <FormattedDuration seconds={data.duration} />
                  </DetailItem>
                }
                <DetailItem label='Author'>
                  <MaybeLink link={data.author_url}>
                    { data.author_name || data.author_url }
                  </MaybeLink>
                </DetailItem>
                <DetailItem label='Provider'>
                  <MaybeLink link={url || data.provider_url}>
                    { data.provider_name || data.provider_url }
                  </MaybeLink>
                </DetailItem>
              </ul>
            </div>
          </div>
        }
        { loading && <div styleName='embed-loading'>Loading&hellip;</div> }
      </div>
    );
  }
}

export default HOC(EmbedBlock);
