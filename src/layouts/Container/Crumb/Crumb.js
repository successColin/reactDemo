/*
 * @Author: Fus
 * @Date:   2019-06-18 15:40:39
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-02-19 09:47:08
 * @Desc: 面包屑
 */
import { Component } from 'react';
import { connect } from 'dva';
import { FormattedMessage } from 'react-intl';
import { BaseContext, NEED_CLEAR_SATATE_TABS } from '@/constants/global';
import styles from './Crumb.less';

@connect(state => ({
  tabs: state.tabs,
  functionData: state.tabs.activeTabData.functionData,
  functionList: state.user.functionList, // 所有菜单数据
}))
class Crumb extends Component {
  static contextType = BaseContext;
  getCrumbPath = () => {
    const { langLib } = this.context;
    const { tabs = {}, functionData = {}, functionList } = this.props;
    let activeName = functionData.id && functionData.name;
    if (tabs.activeTabKey === 'HomePage') { // 主页
      activeName = langLib['tab.HomePage'];
    }
    const result = activeName ? [activeName] : [];
    // 找到父节点名称
    const findPidName = (list, data) => {
      list.forEach(item => {
        if (item.nodeKey === data.pid) {
          result.unshift(item.name);
          return;
        } else if (item.children) {
          findPidName(item.children, item);
        }
      });
    };
    findPidName(functionList, functionData);
    return result;
  };
  // 刷新面板
  handleRefresh = () => {
    const { tabs } = this.props;
    const { activeTabKey: tabKey } = tabs;
    const setRefresh = isRefreshing => {
      if (isRefreshing) {
        const comName = tabKey.split('_')[0];
        const modelName = NEED_CLEAR_SATATE_TABS[comName];
        modelName && this.context.dispatch({
          type: `${modelName}/clearState`,
        });
      }
      this.context.dispatch({
        type: 'tabs/updateTabInfo',
        payload: {
          tabKey,
          isRefreshing,
        },
      });
    };
    setRefresh(true);
    setTimeout(() => setRefresh(false), 0);
  };

  render() {
    const { langLib } = this.context;
    const crumbPath = this.getCrumbPath().join('/');
    const path = langLib['global.crumbPath'] + crumbPath;
    return (
      <div className={styles.wrap}>
        <span className="refresh" onClick={this.handleRefresh}>
          <span className="iconfont icon-refresh"/>
          <span><FormattedMessage id="global.refresh"/></span>
        </span>
        {/* <span title={path} className={styles.path}>
          {path}
        </span> */}
      </div>
    );
  }
}

export default Crumb;
