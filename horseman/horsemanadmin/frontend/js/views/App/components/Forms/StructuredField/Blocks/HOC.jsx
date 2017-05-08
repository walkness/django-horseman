import React, { Component, PropTypes } from 'react';

import CloseButton from '../../../CloseButton';

import AddBlock from '../AddBlock';

import './styles.scss';


const BlockWrapper = ({ children, index, deleteBlock, blocks, onAddClick, onMoveUp, onMoveDown }) => (
  <div className='block' styleName='block'>

    <div styleName='add-block'>
      <AddBlock blocks={blocks} onClick={onAddClick} />
    </div>

    <div styleName='block-actions'>
      <button className='btn' onClick={onMoveUp} type='button'>▲</button>
      <button className='btn' onClick={onMoveDown} type='button'>▼</button>
      <CloseButton className='btn' onClick={() => deleteBlock(index)} title='Delete' />
    </div>

    { children }

  </div>
);

BlockWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  index: PropTypes.number.isRequired,
  deleteBlock: PropTypes.func.isRequired,
  blocks: PropTypes.array.isRequired,
  onAddClick: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
};


export function Block(WrappedComponent) {
  return class extends Component {

    static propTypes = {
      index: PropTypes.number.isRequired,
      deleteBlock: PropTypes.func.isRequired,
      blocks: PropTypes.array.isRequired,
      onAddBeforeClick: PropTypes.func.isRequired,
      onMoveUp: PropTypes.func.isRequired,
      onMoveDown: PropTypes.func.isRequired,
    };

    shouldComponentUpdate(nextProps) {
      const { blockChanging } = nextProps;
      if (blockChanging === null) return true;
      return blockChanging;
    }

    getAPIValue() {
      return this.wrappedComponent.getAPIValue();
    }

    render() {
      const { blocks, blockChanging, ...props } = this.props;
      return (
        <BlockWrapper
          index={this.props.index}
          deleteBlock={this.props.deleteBlock}
          blocks={blocks}
          onAddClick={this.props.onAddBeforeClick}
          onMoveUp={this.props.onMoveUp}
          onMoveDown={this.props.onMoveDown}
        >
          <WrappedComponent
            ref={(c) => { this.wrappedComponent = c; }}
            {...props}
          />
        </BlockWrapper>
      );
    }
  };
}

export default Block;
