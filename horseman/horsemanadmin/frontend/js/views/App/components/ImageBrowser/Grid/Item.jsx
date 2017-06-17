import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { Link } from 'react-router';

import Image from 'Components/Image';

import styles from './styles.scss';


const Item = ({ image, getLink, onClick, selected }) => {
  const inner = <Image image={image} srcSize='thumbnail_150' />;

  const linkProps = { className: styles.action };
  if (onClick) {
    linkProps.onClick = e => onClick(image.pk, e);
  }

  let link;
  if (getLink) {
    link = (
      <Link to={getLink(image)} {...linkProps}>
        { inner }
      </Link>
    );
  } else if (onClick) {
    link = (
      <button {...linkProps} type='button'>
        { inner }
      </button>
    );
  } else {
    link = (
      <span {...linkProps}>
        { inner }
      </span>
    );
  }

  return (
    <div className={classNames('image', { selected, [styles.selected]: selected })} styleName='styles.item'>
      <div>
        { link }
      </div>
    </div>
  );
};

export default Item;
