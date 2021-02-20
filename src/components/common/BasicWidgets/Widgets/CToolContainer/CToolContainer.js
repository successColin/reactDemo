/*
 * @Author: Fus
 * @Date:   2019-08-10 15:07:03
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-12 10:37:04
 * @Desc: 半透明组件，类似于Tooltip
 */
import { Component } from 'react';
import classNames from 'classnames';
import styles from '../../index.less';

const initProps = {
  type: 'container', // 使用类型 container-容器使用
  placement: 'top', // 弹出方向
  visible: false, // 是否显示
  onClose: () => {}, // 关闭弹框
  getPopupContainer: () => document.getElementById('main-container'), // 挂载父节点
};
class CToolContainer extends Component {
  static defaultProps = {
    ...initProps,
  }
  render() {
    const { visible, onClose } = this.props;
    const className = classNames({
      [styles.cToolContainer]: true,
      [styles.hide]: !!!visible,
      'custom-cToolContainer': true,
      [this.props.className]: true,
    });
    return (
      <div className={className}>
        <div className={styles.mask} onClick={onClose} />
        <div className={styles.arrow} />
        <div className={styles.inner}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default CToolContainer;
