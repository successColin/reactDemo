/*
 * @Author: Fus
 * @Date:   2019-09-10 21:05:53
 * @Desc: APP主页配置
 */
import { Component } from 'react';
import { connect } from 'dva';
import { Form } from 'antd';
import { CSpin } from '@/components/common/BasicWidgets';
import ModuleLib from './ModuleLib/ModuleLib';
import HomeModel from './HomeModel/HomeModel';
import GroupForm from './GroupForm/GroupForm';
import BundleDetail from './BundleDetail/BundleDetail';
import BannerConfig from './BannerConfig/BannerConfig';
import UserCenterStaticBlock from './UserCenterStaticBlock/UserCenterStaticBlock';
import { getAppHomePage } from '@/services/appLibrary';
import { BaseContext } from '@/constants/global';
import styles from './AppHomeConfig.less';

@connect(state => ({
  appHomeConfig: state.appHomeConfig,
  functionData: state.tabs.activeTabData.functionData,
}))
class AppHomeConfig extends Component {
  static contextType = BaseContext;
  state = {
    loading: false,
  };

  componentDidMount() {
    this.fetchAppData();
  }

  // 获取APP数据
  fetchAppData = () => {
    const { appData, appHomeConfig } = this.props;
    const { groupData: oldGroupData, mainTabKey } = appHomeConfig;
    this.setState({ loading: true });
    getAppHomePage({ appId: appData.id, basetype: mainTabKey }).then(res => {
      const { leftList, rightList, topCoreList, workSpaceList, myWorkSpaceList, bottomList, figureList } = res;
      this.setState({ loading: false });
      let spacList = mainTabKey === 1 ? workSpaceList : myWorkSpaceList;
      let groupData = oldGroupData.id ? spacList.find(item => item.id === oldGroupData.id) || {} : {};
      this.context.dispatch({
        type: 'appHomeConfig/updateState',
        payload: {
          appData,
          groupData,
          leftList, rightList, topCoreList, workSpaceList, bottomList, figureList, myWorkSpaceList,
        },
      });
    }, err => this.setState({ loading: false }));
  };
  hideDropDown = () => {
    this.refs && this.refs.homeModel.hideChangeGroup();
  };

  render() {
    const { form, appHomeConfig, functionData } = this.props;
    const { loading } = this.state;
    const { actionType, areaCode } = appHomeConfig;
    const publicProps = {
      fetchAppData: this.fetchAppData,
      form,
      functionData,
      appHomeConfig,
    };
    const renderDetailForm = () => {
      if (areaCode === 'banner') { // banner区域
        return <BannerConfig/>;
      } else if (areaCode === 'staticBlock') { // 个人中心的固定模块
        return <UserCenterStaticBlock/>;
      } else if (actionType === 'editGroup' || actionType === 'addGroup') {
        return <GroupForm {...publicProps} />;
      } else if (actionType === 'bundleDetail') {
        return <BundleDetail {...publicProps} />;
      }
    };
    return (
      <div className={styles.wrap}>
        <div className={styles.borderWrap} onClick={() => this.hideDropDown()}>
          <Form layout="vertical">
            <CSpin spinning={loading}>
              <div className={styles.moduleWrap}>
                <ModuleLib {...publicProps} />
              </div>
              <div className={styles.showWrap}>
                <HomeModel ref="homeModel" {...publicProps} />
              </div>
              <div className={styles.detailWrap}>
                {renderDetailForm()}
              </div>
            </CSpin>
          </Form>
        </div>
      </div>
    );
  }
}

export default Form.create()(AppHomeConfig);
