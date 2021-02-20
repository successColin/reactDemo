/*
 * @Author: Fus
 * @Date:   2019-05-24 11:57:34
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-10-23 16:41:48
 * @Desc: tab的容器
 */
import React from 'react';
import { connect } from 'dva';
import { Tabs } from 'antd';
import classNames from 'classnames';
import ElementConfig from '@/components/ElementConfig/ElementConfig';
import PageConfig from '@/components/PageConfig/PageConfig';
import MobilePageConfig from '@/components/MobilePageConfig/MobilePageConfig';
import MenuManger from '@/components/MenuManager/index/MenuManager';
import FramePageConfig from '@/components/FramePageConfig/FramePageConfig';
import JavaBean from '@/components/JavaBean/javaBean';
import FileManger from '@/components/FileManage/FileConfig';
import RoleManger from '@/components/RoleManager/RoleConfig';
import UserManager from '@/components/userManager/userConfig';
import CodingManger from '@/components/CodingManager/CodingManger';
import CodingConfig from '@/components/CodingSettings/CodingConfig';
import UserDesigner from '@/components/UserDesigner/UserDesigner';
import TreeFrame from '@/components/Frames/TreeFrame/TreeFrame';
import BoardFrame from '@/components/Frames/BoardFrame/BoardFrame';
import TemplateFiles from '@/components/TemplateFiles/TemplateFiles';
import ImportTemplate from '@/components/ImportTemplate/ImportTemplate';
import GlobalCenter from '@/components/GlobalCenter/GlobalCenter';
import BundleConfig from '@/components/BundleConfig/BundleConfig';
import LeftListFrame from '@/components/Frames/LeftListFrame/LeftListFrame';
import FullListFrame from '@/components/Frames/FullListFrame/FullListFrame';
import ReportFrame from '@/components/Frames/ReportFrame/ReportFrame';
import ExplorerFrame from '@/components/Frames/ExplorerFrame/ExplorerFrame';
import OutlookFrame from '@/components/Frames/OutlookFrame/OutlookFrame';
import AppLibrary from '@/components/AppLibrary/AppLibrary';
import HomePage from '@/components/HomePage/HomePage';
import Empty from '@/components/HomePage/Empty';
import KnowledgeBase from '@/components/knowledgeBase/knowledgeBase';
import { BaseContext, NEED_CLEAR_SATATE_TABS } from '@/constants/global';
import StateManager from '@/components/StateManager/StateConfig';
import TypeManager from '@/components/TypeManager/TypeConfig';
import PriorityManager from '@/components/PriorityManager/PriorityConfig';
import LicenseManager from '@/components/LicenseManager/LicenseManager';
import OrganizationFile from '@/components/OrganizationFile/OrganizationFile';
import ErrorCode from '@/components/ErrorCode/ErrorCode';
import Test from '@/components/Test/Test';
import ExternalLinks from '@/components/ExternalLinks/ExternalLinks';
import ScheduledTasks from '@/components/ScheduledTasks/ScheduledTasks';
import MainPageConfig from '@/components/MainPageConfig/MainPageConfig';
import VersionConfig from '@/components/VersionConfig/VersionConfig';
import HomeChartFrame from '@/components/Frames/HomeChartFrame/HomeChartFrame';
import Languages from '@/components/Languages/Languages';
import BatchLanguageSetting from '@/components/BatchLanguageSetting/BatchLanguageSetting';
import LanguageGroupType from '@/components/LanguageGroupType/LanguageGroupType';
import VisualMap from '@/components/VisualMap/VisualMap';
import VisualMapConfig from '@/components/VisualMapConfig/VisualMapConfig';
import SanjiuReport from '@/components/SanjiuReport/SanjiuReport';
import VideoManagement from '@/components/VideoManagement/VideoManagement';


import styles from './TabContainer.less';
import Explorer from '@/components/Explorer/Explorer';

const { TabPane } = Tabs;

@connect(state => ({
  tabs: state.tabs,
  theme: state.global.theme,
  functionList: state.user.functionList, // 所有菜单数据
}))
class TabContainer extends React.Component {
  static contextType = BaseContext;
  state = {};
  onChange = (activeTabKey) => {
    this.context.dispatch({
      type: 'tabs/setActiveTabKey',
      payload: {
        activeTabKey,
      },
    });
  };
  onEdit = (targetKey, action) => {
    // 关闭tab
    if (action === 'remove') {
      this.removeTab(targetKey);
    }
  };
  // 根据comKey获取tab内容组件
  getTabContentComponnet = (comKey) => {
    const baseProps = {};
    if (comKey.indexOf('http://') > -1 || comKey.indexOf('https://') > -1) {
      return <ExternalLinks {...baseProps} url={comKey}/>;
    }

    switch (comKey) {
      case 'VideoManagement':
        return <VideoManagement/>;
      case 'ScheduledTasks':
        return <ScheduledTasks/>;
      case 'LanguageGroupType':
        return <LanguageGroupType/>;
      case 'BatchLanguageSetting':
        return <BatchLanguageSetting/>;
      case 'Languages':
        return <Languages/>;
      case 'SanjiuReport':
        return <SanjiuReport/>;
      case 'MainPageConfig':
        return <MainPageConfig/>;
      case 'VersionConfig':
        return <VersionConfig/>;
      case 'ExplorerFrame':
        return <ExplorerFrame/>;
      case 'BoardFrame':
        return <BoardFrame/>;
      case 'OutlookFrame':
        return <OutlookFrame/>;
      case 'TreeFrame':
        return <TreeFrame/>;
      case 'HomeChartFrame':
        return <HomeChartFrame/>;
      case 'ReportFrame':
        return <ReportFrame/>;
      case 'ListFrame':
        return <LeftListFrame/>;
      case 'FullListFrame':
        return <FullListFrame {...baseProps} />;
      case 'MobilePageConfig':
        return <MobilePageConfig/>;
      case 'BundleConfig':
        return <BundleConfig/>;
      case 'AppLibrary':
        return <AppLibrary/>;
      case 'UserDesigner':
        return <UserDesigner/>;
      case 'PageConfig':
        return <PageConfig/>;
      case 'MenuManager':
        return <MenuManger {...baseProps} />;
      case 'JavaBean':
        return <JavaBean {...baseProps} />;
      case 'FramePageConfig':
        return <FramePageConfig {...baseProps} />;
      case 'FileManage':
        return <FileManger {...baseProps} />;
      case 'RoleManager':
        return <RoleManger {...baseProps} />;
      case 'UserManager':
        return <UserManager {...baseProps} />;
      case 'CodingManager':
        return <CodingManger {...baseProps} />;
      case 'CodingSettings':
        return <CodingConfig {...baseProps} />;
      case 'TemplateFiles':
        return <TemplateFiles {...baseProps} />;
      case 'ImportTemplate':
        return <ImportTemplate {...baseProps} />;
      case 'GlobalCenter':
        return <GlobalCenter {...baseProps} />;
      case 'ElementConfig':
        return <ElementConfig {...baseProps} />;
      case 'HomePage':
        return <HomeChartFrame {...baseProps} />;
      case 'KnowledgeBase':
        return <KnowledgeBase {...baseProps} />;
      case 'Explorer':
        return <Explorer {...baseProps} />;
      case 'StateManager':
        return <StateManager {...baseProps} />;
      case 'TypeManager':
        return <TypeManager {...baseProps} />;
      case 'PriorityManager':
        return <PriorityManager {...baseProps} />;
      case 'LicenseManager':
        return <LicenseManager {...baseProps} />;
      case 'OrganizationFile':
        return <OrganizationFile {...baseProps} />;
      case 'ErrorCode':
        return <ErrorCode {...baseProps} />;
      case 'Test':
        return <Test {...baseProps} />;
      case 'VisualMap':
        return <VisualMap/>;
      case 'VisualMapConfig':
        return <VisualMapConfig/>;
      default:
        return null;
    }
  };
  removeTab = (tabKey) => {
    this.context.dispatch({
      type: 'tabs/removeTab',
      payload: {
        tabKey,
      },
    });
    // 若有对应绑定model数据，则清空model里的状态数据
    const comName = tabKey.split('_')[0];
    const modelName = NEED_CLEAR_SATATE_TABS[comName];
    modelName && this.context.dispatch({
      type: `${modelName}/clearState`,
    });
  };
  handleRefresh = ({ tabKey }) => {
    this.context.dispatch({
      type: 'tabs/updateTabInfo',
      payload: {
        tabKey,
        isRefreshing: true,
      },
    });
  };

  getCrumbPath = (tab) => {
    const { langLib } = this.context;
    const { tabs = {}, functionList } = this.props;
    const { functionData } = tab
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

  render() {
    const { openedTabs, activeTabKey } = this.props.tabs;
    const { langLib } = this.context;
    console.log(openedTabs)
    return (
      <Tabs
        hideAdd
        onChange={this.onChange}
        activeKey={activeTabKey}
        onEdit={this.onEdit}
        type="editable-card"
        className={`custom-main-tab ${styles.wrap}`}
      >
        {openedTabs.map(tab => {
          const crumbPath = tab.tabKey === 'HomePage' ? langLib['tab.HomePage'] : this.getCrumbPath(tab).join('/');
          const path = langLib['global.crumbPath'] + crumbPath;
          const title = tab.tabKey === 'HomePage' ? langLib['tab.HomePage'] : tab.title;
          return (
            <TabPane
              tab={
                tab.tabKey === 'HomePage' ? <span className="iconfont icon-homepage" title={path}></span> : <div><span className={styles.tabTitle} title={path}>{title}</span><span className="iconfont icon-close"></span></div>
              }
              closable={tab.closable}
              // closable={false}
              key={tab.tabKey}
            >
              {!tab.isRefreshing && this.getTabContentComponnet(tab.comKey)}
            </TabPane>
          );
        })}
      </Tabs>
    );
  }
}

export default TabContainer;
