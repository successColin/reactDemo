/*
 * @Author: Fus
 * @Date:   2019-04-24 14:16:58
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-20 09:52:13
 * @Desc: 侧边栏
 */
import React, { Fragment } from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { Layout, Menu, Icon, Tooltip } from 'antd';
import { BaseContext } from '../../constants/global';
import styles from './Sidebar.less';
import avatar from '@/assets/avatar.png';

const { Sider } = Layout;
const { SubMenu } = Menu;

const mockData = [{
  tabKey: 'basic',
  level: 1,
  title: '基础档案',
  iconName: 'icon-menu-basic',
  children: [{
    tabKey: 'AboutMeList-1',
    comKey: 'AboutMeList',
    title: '全部',
    pid: 'basic',
    level: 2,
    data: {
      pageType: 'all',
    },
  }, {
    tabKey: 'AboutMeList-2',
    comKey: 'AboutMeList',
    title: '菜单二',
    pid: 'basic',
    level: 2,
    data: {
      pageType: 'all',
    },
  }],
}, {
  tabKey: 'sub2',
  level: 1,
  title: '数据档案',
  iconName: 'icon-menu-line',
}, {
  tabKey: 'sub3',
  level: 1,
  title: '基础管理',
  iconName: 'icon-menu-fix',
  children: [{
    tabKey: 'AboutMeList-menu',
    comKey: 'menuManager',
    title: '菜单库管理',
    pid: 'basic',
    level: 2,
    data: {
      pageType: 'all',
    },
  }, {
    tabKey: 'AboutMeList-javaBean',
    comKey: 'javaBean',
    title: '实体管理',
    pid: 'basic',
    level: 2,
    data: {
      pageType: 'all',
    },
  }, {
    tabKey: 'AboutMeList-menuL',
    comKey: 'fileManage',
    title: '菜单管理',
    pid: 'basic',
    level: 2,
    data: {
      pageType: 'all',
    },
  }],
}];

@connect(state => ({ global: state.global }))
class Sidebar extends React.Component {
  static contextType = BaseContext;
  state = {
    showCompany: true,
    activeMainKey: '', // 打开的第一级菜单
    openKeys: ['sub1'], // 已经打开的菜单栏
  };
  rootSubmenuKeys = ['sub1']; // 一级菜单
  // 点击增加tab
  addTab = (e) => {
    const { config = {} } = e.item.props;
    this.context.dispatch({
      type: 'tabs/addTab',
      payload: { ...config },
    });
  };
  // 打开菜单
  onOpenChange = (openKeys) => {
    const latestOpenKey = openKeys.find(key => !this.state.openKeys.includes(key));
    if (!this.rootSubmenuKeys.includes(latestOpenKey)) {
      this.setState({ openKeys });
    } else {
      this.setState({ openKeys: latestOpenKey ? [latestOpenKey] : [] });
    }
  };
  // 选中菜单
  onSelectMenu = ({ item, key, selectedKeys }) => {
    const { config: { pid = '' } } = item.props;
    this.setState({ openKeys: selectedKeys, activeMainKey: pid });
  };
  // 折叠sidebar
  handleCollapse = () => {
    const { showCompany } = this.state;
    const { showSidebar } = this.props.global;
    this.context.dispatch({
      type: 'global/updateShowSidebar',
      payload: { showSidebar: !showSidebar },
    });
    this.setState({ showCompany: !showCompany });
  };

  render() {
    const { showCompany, openKeys, activeMainKey } = this.state;
    const { showSidebar } = this.props.global;
    // 生成菜单节点
    const loopMenu = (data) => {
      return data.map(item => {
        // 菜单项前置按钮
        const menuIconCls = classNames({
          'iconfont': true,
          'custon-menu-icon': true,
          [styles.menuIcon]: true,
          [item.iconName]: true,
        });
        // 菜单项后置按钮
        const arrowIconCls = classNames({
          'iconfont': true,
          'icon-arrow-right': true,
          'custon-menuArrow-icon': true,
          [styles.arrow]: true,
        });
        const title = item.iconName ? (
          <Fragment>
            <span className={menuIconCls}/>
            <span className={styles.menuName}>{item.title}</span>
            {item.children && item.children.length && <span className={arrowIconCls}/>}
          </Fragment>
        ) : item.title;
        if (item.children && item.children.length) {
          const activeMainMenuCls = classNames({
            'custom-active-main-menu': activeMainKey === item.tabKey,
          });
          return (
            <SubMenu
              key={item.tabKey}
              level={item.level}
              config={item}
              className={activeMainMenuCls}
              title={<Tooltip title={item.title} placement="right">{title}</Tooltip>}
            >
              {item.children && loopMenu(item.children)}
            </SubMenu>
          );
        } else {
          return (
            <Menu.Item
              key={item.tabKey}
              config={item}
              title={item.title}
              onClick={this.addTab}
            >
              {title}
            </Menu.Item>
          );
        }
      });
    };
    const sidebarCls = classNames({
      [styles.sideWrap]: true,
      [styles.show]: !!showSidebar,
      [styles.hide]: !!!showSidebar,
      'custom-sidebar-menu-show': !!showSidebar,
      'custom-sidebar-menu-hide': !!!showSidebar,
    });
    return (
      <Fragment>
        <Sider
          className={sidebarCls}
          collapsed={!showSidebar}
          collapsible
          trigger={null}
          onCollapse={this.handleCollapse}
        >
          <div className={styles.avatarWrap}>
            <div className={`custom-avatar ${styles.avatar}`}>
              <img src={avatar} />
            </div>
            <div className={styles.userName}>
            </div>
          </div>
          <Menu
            mode="vertical"
            theme="light"
            openKeys={openKeys}
            // openKeys={showSidebar ? openKeys : []}
            onOpenChange={this.onOpenChange}
            onSelect={this.onSelectMenu}
            style={{ height: '100%', borderRight: 0 }}
            className={`custom-sidebar-menu ${styles.menuWrap}`}
          >
            {mockData && loopMenu(mockData)}
          </Menu>
        </Sider>
      </Fragment>
    );
  }
};

export default Sidebar;
