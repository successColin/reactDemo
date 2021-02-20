/*
 * @Author: Fus
 * @Date:   2020-02-20 09:37:38
 * @Desc: 传统菜单
 */
import { Component } from 'react';
import classNames from 'classnames';
import { Menu } from 'antd';
import CreateDrawer from '@/components/common/CreateDrawer/CreateDrawer';
import styles from './TranditionalMenu.less';

class TranditionalMenu extends Component {
  render() {
    const { showSidebar, menuEntryEle, selectedKeys, handleSwitchSidebar } = this.props;
    // 传统菜单类名
    const menuEntryCls = classNames({
      [styles.menuEntry]: true,
      // [styles.show]: showSidebar,
      'custom-sidebar-menu': true,
    });
    return (
      <CreateDrawer
        visible={showSidebar}
        maskTransparent={false}
        className={styles.drawer}
        onClose={() => handleSwitchSidebar(false)}
        placement="left"
        width={260}
        fromType="mainMenu"
        title="fasdfad"
      >
        <div className={menuEntryCls}>
          <Menu
            style={{ width: 256 }}
            mode="vertical"
            selectedKeys={selectedKeys}
          // onClick={({ item, key }) => this.handleSelectMenu(item, key)}
          >
            {menuEntryEle}
          </Menu>
        </div>
      </CreateDrawer>
    );

  }
}

export default TranditionalMenu;