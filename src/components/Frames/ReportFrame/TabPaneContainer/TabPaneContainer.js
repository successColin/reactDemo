/*
 * @Author: Fus
 * @Date:   2019-10-17 11:08:18
 * @Desc: tabs容器
 */
import { Component, Fragment } from 'react';
import { Tabs } from 'antd';
import { connect } from 'dva';
import Iframe from 'react-iframe';
import qsStringify from 'qs-stringify';
import ExportBtns from '../ExportBtns/ExportBtns';
import SearchFilter from '../SearchFilter/SearchFilter';
import query from '@/constants/query';
import styles from './TabPaneContainer.less';

const { TabPane } = Tabs;
const TAB_KEY_PREFIX = 'tab_';

@connect(state => ({
  reportDomain: state.global.reportDomain,
  tabs: state.tabs,
}))
class TabPaneContainer extends Component {
  state = {
    activeTabListKey: '', // 当前tabkey
    searchResult: {// 搜索的表单内容map
      // [tabId]: 11,
    },
  };
  // 面板内容
  setSingleTab = (tab) => {
    // 没有面板信息，或面板类型不为报表面板时不渲染
    if (!tab.id || tab.basetype !== 4) return null;
    const { searchResult } = this.state;
    const { pageConfig, reportDomain, tabs } = this.props;
    const { fileData } = tabs.activeTabData;
    const { elementMap = {} } = pageConfig;
    const elementList = elementMap[tab.id];
    const { pathname, origin } = window.location;
    let fileDateLen = fileData && Object.keys(fileData).length;
    let searchParams = searchResult[tab.id] || {};
    if (JSON.stringify(searchParams) === '{}' && fileDateLen > 1) {
      elementList.forEach(item => {
        const { parameter, basetype } = item;
        if (fileData[`@@${parameter}`]) {
          const itemData = fileData[`@@${parameter}`];
          searchParams[`${parameter}`] = itemData.value;
        }
      });
    }
    // 拼接url不转码
    let paramStr = '';
    Object.keys(searchParams).forEach(item => {
      paramStr += `&${item}=${searchParams[item]}`;
    });
    // 转码
    // const paramStr = qsStringify(searchParams);
    const { areportFileName } = tab;
    const url = `${reportDomain}${query.REPORT_PREVIEW}?_u=file:${areportFileName}&_t=0${paramStr}`;
    return (
      <div className={styles.content}>
        <ExportBtns fileName={areportFileName} paramStr={paramStr}/>
        <SearchFilter
          pageConfig={pageConfig}
          tabInfo={tab}
          setSearchResult={this.setSearchResult}
        />
        <div className={styles.iframeWrap}>
          <iframe
            src={url}
            width="100%"
            height="100%"
            id="myId"
            className="myClassname"
            display="initial"
            position="relative"
          />
        </div>
      </div>
    );
  };
  // 渲染标签页
  renderTabs = () => {
    const { pageConfig = {} } = this.props;
    const { tabList = [] } = pageConfig;
    return tabList.map(tab => {
      return (
        <TabPane tab={tab.name} key={`${TAB_KEY_PREFIX}${tab.id}`}>
          {this.setSingleTab(tab)}
        </TabPane>
      );
    });
  };
  // 获取当前tabkey
  getActiveTabKey = () => {
    const { activeTabListKey } = this.state;
    const { pageConfig = {} } = this.props;
    const { tabList = [] } = pageConfig;
    let activeKey = activeTabListKey;
    const tabLength = tabList.length;
    if (tabLength < 2) {
      activeKey = '';
    } else if (tabLength >= 2 && !activeTabListKey) {
      activeKey = `${TAB_KEY_PREFIX}${tabList[0].id}`;
    }
    return activeKey;
  };
  // 更新搜索条件状态
  setSearchResult = (tabInfo, searchParams) => {
    const { searchResult } = this.state;
    this.setState({
      searchResult: {
        ...searchResult,
        [tabInfo.id]: searchParams,
      },
    });
  };

  render() {
    const activeKey = this.getActiveTabKey();
    const { pageConfig = {}, tabs } = this.props;
    const { tabList = [] } = pageConfig;
    if (tabList.length < 2) {
      return this.setSingleTab(tabList[0] || {});
    }
    return (
      <Tabs
        activeKey={activeKey}
        onChange={activeTabListKey => this.setState({ activeTabListKey })}
        animated={false}
        className="custom-pageConfig-tabs"
      >
        {this.renderTabs()}
      </Tabs>
    );
  }
}

export default TabPaneContainer;
