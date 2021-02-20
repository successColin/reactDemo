/*
 * @Author: Fus
 * @Date:   2019-09-16 10:15:52
 * @Desc: 左侧用户设计组选择tab
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs, Modal, Tooltip } from 'antd';
import { connect } from 'dva';
import { CSpin, CMessage } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import CreateTree from '@/components/common/CreateTree/CreateTree';
import CopyUserDesignerMenu from '@/components/common/CopyUserDesignerMenu/CopyUserDesignerMenu';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';
import { getDefaultConfirmProps } from '@/utils/common';
import {
  getMobileFrameUserDesignerList,
  getBundleFrameDetail,
  insertOrUpdateMobileFrames,
  deleteMobileFrames,
} from '@/services/bundleConfig';
import { getUserDesignerTree } from '@/services/userDesigner';
import { BaseContext } from '@/constants/global';
import { copyUserDesignerData } from '@/services/framePage';
import styles from './UserDesignerTabs.less';

const { TabPane } = Tabs;

@connect(state => ({
  appHomeConfig: state.appHomeConfig,
  functionData: state.tabs.activeTabData.functionData,
}))
class UserDesignerTabs extends Component {
  static contextType = BaseContext;
  state = {
    visibleModal: false, // 弹框显示状态
    visibleCopy: false, // 复制设计组菜单弹框显示状态
    treeData: [], // 用户设计组树
    activeUserDesignerTabKey: '', // 当前用户组tabkey
    mobileFrameList: [], // 用户设计组列表
    activeTreeNodeDetail: {}, // 需要新增的用户设计组
    oldUserDesignerId: 0, // 当前用户设计组id
    targetFunctionId: 0, // 目标bundleId
    targetUserDesignerId: 0, // 目标用户设计组id
    loadingStatus: {
      tree: false, // 用户设计组树
      list: false, // 获取用户设计组
      save: false, // 新增用户设计组
      copy: false, // 复制
    },
  };

  componentDidMount() {
    this.fetchMobileFrameList(true);
  }

  // 获取页面数据
  fetchMobileFrameList = (firstLoad) => {
    const { activeBundle } = this.props.appHomeConfig;
    const params = {
      bundleId: activeBundle.id,
      planned: 10,
    };
    this.setLoadingStatus('list', true);
    getMobileFrameUserDesignerList(params).then(res => {
      const { mobileFrameList } = res;
      this.setState({ mobileFrameList });
      if (firstLoad && mobileFrameList.length) {
        // 进来默认选中第一个设计组
        this.setActiveFrame(`userDesigner_${mobileFrameList[0].id}`);
      } else if ( firstLoad && !mobileFrameList.length) { // 如果没有数据，把设计组详情值为空
        this.context.dispatch({
          type: 'bundleConfig/updateState',
          payload: {
            frameDetail: {},
          },
        });
      }
      this.setLoadingStatus('list', false);
    }, err => this.setLoadingStatus('list', false));
  };
  // 新增用户设计组
  handleAddUserDesigner = () => {
    const { activeTreeNodeDetail, mobileFrameList } = this.state;
    const { langLib } = this.context;
    const { activeBundle } = this.props.appHomeConfig;
    const { mobileFrameTypeId, id: bundleId } = activeBundle;
    const { id: userDesignerId } = activeTreeNodeDetail;
    if (mobileFrameList.filter(item => item.userDesignerId === userDesignerId).length) {
      CMessage(langLib['message.error.hasUserDesigner'], 'error');
      return;
    }
    const params = {
      mobileFrameTypeId,
      bundleId,
      name: '',
      userDesignerId,
      planned: 10,
    };
    this.setLoadingStatus('save', true);
    insertOrUpdateMobileFrames(params).then(res => {
      this.setLoadingStatus('save', false);
      this.fetchMobileFrameList();
      this.setState({ visibleModal: false });
    }, err => this.setLoadingStatus('save', false));
  };
  // 打开用户设计组窗口
  handleOpenUserDesigner = () => {
    this.setState({ visibleModal: true });
    this.setLoadingStatus('tree', true);
    getUserDesignerTree({}).then(treeData => {
      this.setLoadingStatus('tree', false);
      this.setState({ treeData });
    }, err => this.setLoadingStatus('tree', false));
  };
  // 更新当前用户设计组
  setActiveFrame = (activeUserDesignerTabKey) => {
    this.setState({ activeUserDesignerTabKey });
    const { mobileFrameList } = this.state;
    const frameId = +(activeUserDesignerTabKey.split('userDesigner_')[1]);
    const frameDetail = mobileFrameList.find(item => item.id === frameId) || {};
    // 切换设计组后，右侧面板默认切换至框架配置
    this.context.dispatch({
      type: 'bundleConfig/updateState',
      payload: {
        activeTabKey: 'frameConfig',
      },
    });
    this.fetchFrameData(frameDetail);
  };
  // 删除设计组
  handleDel = (frameDetail) => {
    const { langLib } = this.context;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      onOk: () => {
        const { appHomeConfig } = this.props;
        const { activeBundle } = appHomeConfig;
        const userDesignerId = frameDetail.userDesignerId;
        const params = {
          bundleId: activeBundle.id,
          userDesignerId,
          id: frameDetail.id,
          planned: 10,
        };
        deleteMobileFrames(params).then(res => {
          closeModal();
          CMessage(langLib['message.del.success']);
          this.fetchMobileFrameList(true);
        });
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
    // Modal.confirm({
    //   className: 'customConfirmColor',
    //   ...getDefaultConfirmProps(langLib),
    //   onOk: () => {
    //     const { appHomeConfig } = this.props;
    //     const { activeBundle } = appHomeConfig;
    //     const userDesignerId = frameDetail.userDesignerId;
    //     const params = {
    //       bundleId: activeBundle.id,
    //       userDesignerId,
    //       id: frameDetail.id,
    //       planned: 10,
    //     };
    //     return deleteMobileFrames(params).then(res => {
    //       CMessage(langLib['message.del.success']);
    //       this.fetchMobileFrameList(true);
    //     });
    //   },
    // });
  };
  // 获取界面数据（包括frame和tabList)
  fetchFrameData = (frameDetail) => {
    const { setPageConfigState, appHomeConfig } = this.props;
    const { activeBundle } = appHomeConfig;
    const planned = 10;
    const userDesignerId = frameDetail.userDesignerId;
    const params = {
      bundleId: activeBundle.id,
      planned,
      userDesignerId,
    };
    setPageConfigState({ loadingFrame: true });
    getBundleFrameDetail(params).then(res => {
      const { elementListMap = {}, mobileTabList = [], mobileFrameList = [], queryListMap = {} } = res;
      // Object.keys(queryListMap).forEach(item => {
      //   const queryLen = queryListMap[item].length;
      //   if (queryLen === 0) {
      //     queryListMap[item] = [{ index: 0, asqlWholeCondition: 'test' }, { index: 1, asqlWholeCondition: 'test' }];
      //   } else if (queryLen === 1) {
      //     queryListMap[item] = [{ index: 0, asqlWholeCondition: 'test' }];
      //   }
      // });
      setPageConfigState({ loadingFrame: false });
      this.context.dispatch({
        type: 'bundleConfig/updateState',
        payload: {
          mobileFrameList,
          mobileTabList,
          elementListMap,
          queryListMap,
          frameDetail,
          systemParams: {
            planned,
            userDesignerId,
          },
        },
      });
    }, err => setPageConfigState({ loadingFrame: false }));
  };
  // 点击复制
  handleOpenCopy = (userDesignerFrame) => {
    const { userDesignerId } = userDesignerFrame;
    this.setState({ visibleCopy: true, oldUserDesignerId: userDesignerId });
  };
  // 保存复制确定
  handleSaveCopy = () => {
    const { appHomeConfig } = this.props;
    const { activeBundle } = appHomeConfig;
    const { langLib } = this.context;
    const { targetFunctionId: bundleId, targetUserDesignerId: userDesignerId, oldUserDesignerId } = this.state;
    const { bundleId: oldBundleId } = activeBundle;
    const params = {
      oldUserDesignerId,
      oldBundleId,
      bundleId,
      userDesignerId,
    };
    if (!bundleId) {
      CMessage(langLib['message.error.noTargetFunction'], 'error');
      return;
    } else if (!userDesignerId) {
      CMessage(langLib['message.error.noTargetUserDesigner'], 'error');
      return;
    }
    this.setLoadingStatus('copy', true);
    copyUserDesignerData(params).then(res => {
      CMessage(langLib['message.success.copy']);
      this.setState({ visibleCopy: false });
      this.fetchMobileFrameList();
      this.setLoadingStatus('copy', false);
    }, err => this.setLoadingStatus('copy', false));
  };
  // 更新loading状态
  setLoadingStatus = (type, loading) => {
    const { loadingStatus } = this.state;
    this.setState({
      loadingStatus: {
        ...loadingStatus,
        [type]: loading,
      },
    });
  };
  setWrapState = itemObj => {
    this.setState(itemObj);
  };

  render() {
    const { loadingStatus, activeUserDesignerTabKey, mobileFrameList, visibleModal, treeData, activeTreeNodeDetail, visibleCopy } = this.state;
    const { functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    const renderUserDesigner = mobileFrameList && mobileFrameList.map(item => {
      const tabTit = (
        <div className={styles.tabTit}>
          <span className={styles.name}>
            {item.userDesignerName}
          </span>
          <div className={styles.iconWrap}>
            {candelete ? <Tooltip title={<FormattedMessage id="global.del"/>}>
              <i className="iconfont icon-del" onClick={() => this.handleDel(item)}/>
            </Tooltip> : null}
            {canmodify ? <Tooltip title={<FormattedMessage id="framePageConfig.copyMenu.title"/>}>
              <i className="iconfont icon-copy custom-color" onClick={() => this.handleOpenCopy(item)}/>
            </Tooltip> : null}
          </div>
        </div>
      );
      return (
        <TabPane tab={tabTit} key={`userDesigner_${item.id}`}/>
      );
    });
    return (
      <div className={styles.wrap}>
        <h1>
          <FormattedMessage id="appHomeConfig.userDesigner.title"/>
          {canadd ? <i className="iconfont icon-add-border custom-color" onClick={this.handleOpenUserDesigner}/> : null}
        </h1>
        <CSpin spinning={loadingStatus.list}>
          <Tabs
            activeKey={activeUserDesignerTabKey}
            tabPosition="left"
            className={`${styles.tabs} custom-vertical-tab`}
            onChange={activeTabKey => this.setActiveFrame(activeTabKey)}
          >
            {renderUserDesigner}
          </Tabs>
        </CSpin>
        <CreateModal
          title={<FormattedMessage id="appHomeConfig.select.userDesigner"/>}
          visible={visibleModal}
          onOk={this.handleAddUserDesigner}
          onCancel={() => this.setState({ visibleModal: false })}
          mask={false}
          okButtonProps={{
            disabled: activeTreeNodeDetail.isGroup || !activeTreeNodeDetail.id,
          }}
          confirmLoading={loadingStatus.save}
        >
          <CreateTree
            dataType="userDesigner"
            treeData={treeData}
            checkable={true}
            needGetDetail={false}
            loading={loadingStatus.tree}
            updateFrameState={this.setWrapState}
            activeTreeNodeDetail={activeTreeNodeDetail}
          />
        </CreateModal>
        <CreateModal
          visible={visibleCopy}
          title={<FormattedMessage id="framePageConfig.copyMenu.title"/>}
          onCancel={() => this.setState({ visibleCopy: false })}
          onOk={this.handleSaveCopy}
          confirmLoading={loadingStatus.copy}
        >
          <CopyUserDesignerMenu
            fromType="APP"
            setRootWrapState={this.setWrapState}
          />
        </CreateModal>
      </div>
    );
  }
}

export default UserDesignerTabs;
