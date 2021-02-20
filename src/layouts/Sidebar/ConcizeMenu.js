/*
 * @Author: Fus
 * @Date:   2020-02-18 13:53:37
 * @Desc: 简约菜单
 */
import { Component } from 'react';
import { Layout, Menu, Breadcrumb, Icon } from 'antd';
import classNames from 'classnames';
import { BaseContext } from '@/constants/global';
import styles from './ConcizeMenu.less';

const { Sider } = Layout;
const { SubMenu } = Menu;
class ConcizeMenu extends Component {
  static contextType = BaseContext;
  state = {
    collapsed: false,
  };
  // 菜单列表
  getMenuItem = (data) => {
    const { collapsed } = this.state;
    const { handleClickMenu } = this.props;
    return data.map(item => {
      const { children, id, name, iconName, frameBaseType, rootpath } = item;
      const level = rootpath.match(/\//ig).length;
      const functionIconName = (!iconName || iconName.indexOf('_function') === -1) ? 'basic_function' : iconName;
      const iconCls = classNames({
        'iconfont': true,
        'custom-color': true,
        [`icon-${functionIconName}`]: true,
      });
      const nameCls = classNames({
        [styles.name]: true,
        [styles.rootHideName]: level === 2 && collapsed,
      });
      if (children.length) {
        return (
          <SubMenu
            key={`menu_${id}`}
            title={
              <span
                title={name}
                onClick={() => frameBaseType !== 7 && handleClickMenu(item)} // 7 为仅作为父级，点击不打开tab
              >
                <i className={iconCls} />
                <span className={nameCls}>{name}</span>
                {/* {((!collapsed && level === 2) || (collapsed && level !== 2)) && <span>{name}</span>} */}
              </span>
            }
          >
            {this.getMenuItem(children)}
          </SubMenu>
        );
      }
      return (
        <Menu.Item
          key={`menu_${id}`}
          onClick={(e) => handleClickMenu(item)}
          title={name}
        >
          {level === 2 && <i className={iconCls} />}
          <span className={nameCls}>{name}</span>
          {/* {((!collapsed && level === 2) || (collapsed && level !== 2)) && <span title={name}>{name}</span>} */}
        </Menu.Item>
      );
    });
  }
  // 展开折叠菜单
  onCollapse = () => {
    this.setState({ collapsed: !this.state.collapsed });
  };
  render() {
    const { functionList = [] } = this.props;
    const { collapsed } = this.state;
    const wrapCls = classNames({
      [styles.wrap]: true,
      'custom-concize-menu': true,
    });
    const triggerCls = classNames({
      [styles.trigger]: true,
      [styles.collapsed]: collapsed,
    });
    const triggerIconCls = classNames({
      'iconfont': true,
      'icon-menu-collapsed': collapsed,
      'icon-menu-uncollapsed': !collapsed,
    });
    return (
      <Sider
        className={wrapCls}
        collapsible
        collapsed={collapsed}
        onCollapse={this.onCollapse}
        trigger={null}
      >
        <div
          className={triggerCls}
          onClick={this.onCollapse}
        >
          <i className={triggerIconCls} />
        </div>
        <Menu
          defaultSelectedKeys={['1']}
          mode="inline"
          className={styles.menu}
        >
          {this.getMenuItem(functionList)}
        </Menu>
      </Sider>
    );
  }
}

export default ConcizeMenu;
