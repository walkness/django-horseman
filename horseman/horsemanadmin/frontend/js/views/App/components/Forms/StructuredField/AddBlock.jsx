import React from 'react';
import PropTypes from 'prop-types';

import './styles.scss';


const AddBlock = ({ blocks, onClick }) => (
  <div styleName='add-block'>

    { (blocks || []).map(({ type, verbose_name }) => (
      <button key={type} type='button' className='btn' onClick={() => onClick(type)}>
        { verbose_name }
      </button>
    )) }

  </div>
);

export default AddBlock;
