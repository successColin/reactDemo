/*
 * @Author: Fus
 * @Date:   2019-08-08 08:59:21
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-09-11 14:01:20
 * @Desc: 创建抽屉组件
 */
import { Component } from 'react';
import { Drawer } from 'antd';
import classNames from 'classnames';
import styles from './CreateDrawer.less';

const initProps = {
  destroyOnClose: true, // 关闭即销毁
  getContainer: document.getElementById('main-container'), // 挂载的html节点
  maskClosable: true, // 点击遮罩即关闭
  // maskTransparent: true, // 显示透明遮罩
  mask: true, // 遮罩显示
  // fromType: 'moduleLib', // 调用处 moduleLib组件库 menuCenter 菜单中心 mainMenu主菜单
  placement: 'right', // 方向
  width: 580,
};

class CreateDrawer extends Component {
  static defaultProps = initProps
  render() {
    const { maskTransparent = true, fromType = 'moduleLib' } = this.props;
    const className = classNames({
      [styles.drawer]: true,
      [this.props.className]: true,
    });
    const wrapCls = classNames({
      [styles.wrap]: true,
      [styles[`from_${fromType}`]]: !!fromType,
      [styles.maskTransparent]: !!maskTransparent,
    });
    const props = {
      ...initProps,
      ...this.props,
      className,
    };
    return (
      <div className={wrapCls}>
        <Drawer {...props}>
          {this.props.children}
        </Drawer>
      </div>
    );
  }
}
export default CreateDrawer;
