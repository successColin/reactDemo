/*
 * @Author: Fus
 * @Date:   2019-09-10 21:29:48
 * @Desc: 组件库
 */

import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs } from 'antd';
import { connect } from 'dva';
import classNames from 'classnames';
import IconLibBlank from '@/components/common/IconLibBlank/IconLibBlank';
import { BaseContext } from '@/constants/global';
import styles from './ModuleLib.less';

const { TabPane } = Tabs;

@connect(state => ({
  appHomeConfig: state.appHomeConfig,
}))
class ModuleLib extends Component {
  static contextType = BaseContext
  state = {
  }
  getFunctionalType = () => {
    const { groupData, areaCode, leftList, rightList, topCoreList, workSpaceList, bottomList } = this.props.appHomeConfig;
    const activeGroup = workSpaceList.find(item => item.id === groupData.id) || {};
    const groupBundleLength = activeGroup.list && activeGroup.list.length || 0;
    switch (areaCode) {
      case 11: return { functionalType: 10, functionalSubtype: 11, sno: leftList.length + 1 };
      case 12: return { functionalType: 10, functionalSubtype: 12, sno: rightList.length + 1 };
      case 20: return { functionalType: areaCode, functionalSubtype: '', sno: topCoreList.length + 1 };
      case 30: return { functionalType: areaCode, functionalSubtype: '', sno: groupBundleLength + 1 };
      case 40: return { functionalType: areaCode, functionalSubtype: '', sno: bottomList.length + 1 };
      default: return { functionalType: areaCode, functionalSubtype: '', sno: '' };
    }
  }
  // 替换成功后的bundle信息更新
  afterReplaceBundle = (activeBundle) => {
    this.context.dispatch({
      type: 'appHomeConfig/updateState',
      payload: {
        activeBundle: {},
        actionType: '',
      },
    });
    this.props.fetchAppData();
  }
  // 设置主面板key
  setMainTabKey = mainTabKey => {
    this.context.dispatch({
      type: 'appHomeConfig/updateState',
      payload: {
        mainTabKey,
        areaCode: null,
        activeBundle: {},
        actionType: '',
      },
    });
    setTimeout(() => {
      this.props.fetchAppData();
    }, 0);
  }
  render() {
    const { fetchAppData, appHomeConfig } = this.props;
    const { appData, groupData = {}, activeBundle, mainTabKey } = appHomeConfig;
    const { id: appId } = appData;
    const wrapCls = classNames({
      [styles.tabWrap]: true,
      'custom-pageConfig-tabs': true,
    });
    const { functionalType, functionalSubtype, sno } = this.getFunctionalType();
    const iconLibPreData = {
      appId,
      functionalType,
      functionalSubtype,
      groupId: groupData.id,
      sno,
      activeBundle,
      basetype: mainTabKey,
      // oldBundleId,
    };
    return (
      <Tabs
        activeKey={`${mainTabKey}`}
        animated={false}
        className={wrapCls}
        onChange={mainTabKey => this.setMainTabKey(+mainTabKey)}
      >
        <TabPane tab={<FormattedMessage id="appHomeConfig.tab.appHome" />} key="1">
          <IconLibBlank
            dataType="bundle"
            iconSize="large"
            preData={iconLibPreData}
            addEleCallback={this.afterReplaceBundle}
          />
        </TabPane>
        <TabPane tab={<FormattedMessage id="appHomeConfig.tab.userCenter" />} key="2">
          <IconLibBlank
            dataType="bundle"
            iconSize="large"
            preData={iconLibPreData}
            addEleCallback={this.afterReplaceBundle}
          />
        </TabPane>
      </Tabs>
    );
  }
}
export default ModuleLib;
