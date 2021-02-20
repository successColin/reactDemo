/*
 * @Author: Fus
 * @Date:   2019-12-17 10:25:55
 * @Desc: 可拖动调整宽度容器
 */
import { Component } from 'react';
import { Resizable, ResizableBox } from 'react-resizable';
import styles from './ResizableContainer.less';

class ResizableContainer extends Component {
  static defaultProps = {
    width: 236,
    axis: 'x',
    resizeHandles: ['e'],
  }
  render() {
    const { width } = this.props;
    return (
      <ResizableBox
        className={styles['custom-resizable-box']}
        {...this.props}
      >
        {this.props.children}
      </ResizableBox>
    );
  }
}
export default ResizableContainer;