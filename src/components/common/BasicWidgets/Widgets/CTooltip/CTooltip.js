/*
 * @Author: Fus
 * @Date:   2019-08-10 15:07:03
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-10 16:07:43
 * @Desc: 提示框、半透明组件等
 */
import { Component } from 'react';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import styles from '../../index.less';

const initProps = {
  placement: 'top', // 弹出方向
  trigger: 'hover', // 触发动作
  getPopupContainer: () => document.getElementById('main-container'), // 挂载父节点
};
class CTooltip extends Component {
  static defaultProps = {
    ...initProps,
  }
  render() {
    const overlayClassName = classNames({
      [styles.cTooltip]: true,
      [this.props.className]: true,
    });
    const tooltipProps = {
      ...initProps,
      ...this.props,
      overlayClassName,
    };
    return (
      <Tooltip {...tooltipProps}>
        {this.props.children}
      </Tooltip>
    );
  }
}

export default CTooltip;
