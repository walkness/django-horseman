import React, { Component, PropTypes } from 'react';

import CloseButton from '../../../CloseButton';


const BlockWrapper = ({ children, index, deleteBlock }) => (
  <div className='block'>

    <div className='block-actions'>
      <CloseButton onClick={() => deleteBlock(index)} title='Delete' />
    </div>

    { children }

  </div>
);

BlockWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.number.isRequired,
  deleteBlock: PropTypes.func.isRequired,
};


export function Block(WrappedComponent) {
  return class extends Component {

    static propTypes = {
      index: PropTypes.number.isRequired,
      deleteBlock: PropTypes.func.isRequired,
    };

    getAPIValue() {
      return this.wrappedComponent.getAPIValue();
    }

    render() {
      return (
        <BlockWrapper
          index={this.props.index}
          deleteBlock={this.props.deleteBlock}
        >
          <WrappedComponent
            ref={(c) => { this.wrappedComponent = c; }}
            {...this.props}
          />
        </BlockWrapper>
      );
    }
  };
}

export default Block;
