import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import classNames from 'classnames';

import CloseButton from 'Components/CloseButton';

import AddBlock from '../AddBlock';

import './styles.scss';


const BlockWrapper = ({ children, index, deleteBlock, blocks, onAddClick, onMoveUp, onMoveDown, className }) => (
  <div className={classNames('block', className)} styleName='block'>

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
  className: PropTypes.string,
};

BlockWrapper.defaultProps = {
  className: null,
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

    constructor(props, context) {
      super(props, context);
      this.state = {
        wrapperClassName: null,
      };
    }

    shouldComponentUpdate(nextProps) {
      const { blockChanging } = nextProps;
      if (blockChanging === null) return true;
      return blockChanging;
    }

    getAPIValue() {
      return this.wrappedComponent.getAPIValue();
    }

    @autobind
    setWrapperClassName(wrapperClassName) {
      this.setState({ wrapperClassName });
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
          className={this.state.wrapperClassName}
        >
          <WrappedComponent
            ref={(c) => { this.wrappedComponent = c; }}
            setWrapperClassName={this.setWrapperClassName}
            {...props}
          />
        </BlockWrapper>
      );
    }
  };
}

export default Block;
