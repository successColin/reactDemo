/*
 * @Author: Fus
 * @Date:   2019-08-10 14:29:14
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-10 16:19:41
 * @Desc: tab 容器
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs, Modal, Form } from 'antd';
import { connect } from 'dva';
import classNames from 'classnames';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import { CButton, CSpin, CMessage, CSearch } from '@/components/common/BasicWidgets';
import SelectPageTab from '../common/SelectPageTab/SelectPageTab';
import FrameConfig from './FrameConfig/FrameConfig';
import TabConfig from '@/components/common/TabConfig/TabConfig';
import {
  getBundleFrameDetail,
  insertOrUpdateUserDesignerMobileTabAdvancedQuery,
  insertOrUpdateMobileFrames,
  insertOrUpdateUserDesignerMobileTab,
  insertOrUpdateUserDesignerMobileTabElement,
} from '@/services/bundleConfig';
import { deleteMobileTab, copyUserDesignerMobileTab } from '@/services/mobileConfig';
import { copyTabData, getThirdinterface } from '@/services/framePage';
import { getDefaultConfirmProps } from '@/utils/common';
import { BaseContext } from '@/constants/global';
import styles from './MobileTabPaneConTainer.less';
import BundleConfig from '../BundleConfig/BundleConfig';
import ParameterSetting from '@/components/FramePageConfig/TabPaneConTainer/ParameterSetting/ParameterSetting';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const { TabPane } = Tabs;

const TAB_KEY_PREFIX = 'tab_';

@connect(state => ({
  bundleConfig: state.bundleConfig,
  functionData: state.tabs.activeTabData.functionData,
}))
class MobileTabPaneContainer extends Component {
  static contextType = BaseContext;
  static defaultProps = {
    fromType: 'bundleConfig', // 调用处类型（bundleConfig-预设界面  pageConfig-界面配置）
  };
  state = {
    // activeTabKey: 'frameConfig',
    selectedTabNodeInfo: {}, // 选择面板的面板信息（树节点）
    visibleAddModal: false, // 新增面板窗口是否可见
    childBlankKey: 'basicProps', // 面板下当前模块（用于切换面板自动做保存）
    addType: 'empty', // 新增面板方式（addNew导入面板、empty空面板）
    loadingStatus: {
      addTab: false, // 新增有数据面板
      emptyTab: false, // 新增空面板
      saveFrame: false, // 保存框架数据
    },
    keywords: '',
  };

  componentDidMount() {
    this.props.fromType === 'bundleConfig' && this.fetchFrameData();
    this.getServerList();
  }

  getServerList = () => {
    getThirdinterface({}).then(data => {
      this.context.dispatch({
        type: 'bundleConfig/updateState',
        payload: {
          apiList: data || [],
        },
      });
    });
  };

  // 获取界面数据（包括frame和tabList)
  fetchFrameData = (callback) => {
    const { bundleConfig, fromType } = this.props;
    const { bundleData, frameDetail } = bundleConfig;
    const planned = fromType === 'pageConfig' ? 10 : 1;
    const userDesignerId = fromType === 'pageConfig' ? frameDetail.userDesignerId : 1;
    const params = {
      bundleId: bundleData.id,
      planned,
      userDesignerId,
    };
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
      this.context.dispatch({
        type: 'bundleConfig/updateState',
        payload: {
          mobileFrameList,
          mobileTabList,
          elementListMap,
          queryListMap,
          frameDetail: fromType === 'bundleConfig' ? mobileFrameList[0] : frameDetail,
          systemParams: {
            planned,
            userDesignerId,
          },
        },
      });
      callback && callback(res);
    });
  };
  // 删除面板
  handleCloseTab = (e, tab) => {
    e.stopPropagation();
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(this.context.langLib),
      onOk: () => {
        const { bundleData, systemParams, mobileTabList } = this.props.bundleConfig;
        const { planned, userDesignerId } = systemParams;
        const params = {
          id: tab.id,
          bundleId: bundleData.id,
          userDesignerId,
          planned,
        };
        // 删除之前先过滤出要删掉的面板之后还哪些面板
        let restTabList = mobileTabList.filter(item => item.id !== tab.id) || [];
        let restLabListLen = restTabList.length;
        // 删除后跳到第一个面板或者框架信息
        deleteMobileTab(params).then(res => {
          CMessage(this.context.langLib['message.del.success']);
          closeModal();
          this.fetchFrameData();
          this.context.dispatch({
            type: 'bundleConfig/updateState',
            payload: {
              tabBasicData: restTabList.find(item => item.id === restTabList[restLabListLen - 1].id) || {},
              activeTabKey: restLabListLen ? `${TAB_KEY_PREFIX}${mobileTabList[restLabListLen - 1].id}` : 'frameConfig',
            },
          });
        });
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
  };
  // 切换面板
  handelChangeTab = (activeKey) => {
    const { mobileTabList } = this.props.bundleConfig;
    const { childBlankKey } = this.state;
    // this.context.dispatch({
    //   type: 'bundleConfig/updateState',
    //   payload: {
    //     activeTabKey: activeKey,
    //   },
    // });
    if (activeKey === 'frameConfig') {
      return;
    }
    const tabId = +(activeKey.split(TAB_KEY_PREFIX)[1]) || mobileTabList[0].id;
    const tabBasicData = mobileTabList.find(item => item.id === tabId) || {};
    // this.setState({ activeTabKey: activeKey });
    this.saveChildBlank(childBlankKey);
    const { elementList = [], advancedQueryList = [] } = tabBasicData;
    let tabFilterCond = advancedQueryList;
    // if (!advancedQueryList || !advancedQueryList.length) {
    //   tabFilterCond = [
    //     { index: 0, asqlWholeCondition: 'test' }, { index: 1, asqlWholeCondition: 'test' },
    //   ]; // 默认两条数据
    // }
    this.context.dispatch({
      type: 'bundleConfig/updateState',
      payload: {
        tabBasicData,
        activeTabKey: `${TAB_KEY_PREFIX}${tabId}`,
        // tabElementList: elementList || [],
        // tabFilterCond,
      },
    });
  };
  // 保存当前面板当前模块下的数据
  saveChildBlank = (blankKey) => {
    const { tabBasicData, tabElementList, tabEditStatus, tabFilterCond, activeTabKey } = this.props.bundleConfig;
    const { functionId, userDesignerId } = tabBasicData;
    // const { activeTabKey } = this.state;
    const id = +(activeTabKey.split(TAB_KEY_PREFIX)[1]);
    if (activeTabKey === 'frameConfig' || !tabEditStatus[id] || !tabEditStatus[id][blankKey]) return;
    // 重新获取面板信息并更新数据
    const reGetFrameData = () => {
      getBundleFrameDetail({ functionId, userDesignerId, planned: 10 }).then(res => {
        const { frame, tabList } = res;
        this.context.dispatch({
          type: 'bundleConfig/updateState',
          payload: {
            frame,
            tabList,
            tabEditStatus: {
              ...tabEditStatus,
              [id]: {
                ...tabEditStatus[id],
                [blankKey]: false, // 编辑状态改为false
              },
            },
          },
        });
      });
    };
    if (blankKey === 'frameConfig') {
      this.handleSaveFrame();
    } else if (blankKey === 'basicProps') { // 保存基本信息
      insertOrUpdateUserDesignerMobileTab({ ...tabBasicData }).then(this.fetchFrameData);
    } else if (blankKey === 'elementList') { // 保存控件
      this.handleSaveElement();
    } else if (blankKey === 'filterCond') { // 保存过滤条件
      insertOrUpdateUserDesignerMobileTabAdvancedQuery({
        advancedQueryList: tabFilterCond,
        id,
        functionId,
        userDesignerId,
      }).then(this.fetchFrameData);
    }
  };
  // 保存框架信息
  handleSaveFrame = (callback) => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const { bundleData, mobileFrameList, frameDetail = {}, systemParams } = this.props.bundleConfig;
      const { mobileFrameTypeId, id, sno } = bundleData;
      const { planned, userDesignerId } = systemParams;
      const { langLib } = this.context;
      const reqParams = {
        ...values,
        mobileFrameTypeId,
        bundleId: id,
        name: '',
        id: frameDetail.id,
        userDesignerId,
        planned,
        sno,
      };
      this.setLoadingStatus('saveFrame', true);
      insertOrUpdateMobileFrames(reqParams).then(frame => {
        this.setLoadingStatus('saveFrame', false);
        CMessage(langLib['message.save.success']);
        const frameIndex = mobileFrameList.findIndex(item => item.id === frame.id);
        const newMobileFrameList = mobileFrameList.splice(frameIndex, 1, frame);
        this.context.dispatch({
          type: 'bundleConfig/updateState',
          payload: { newMobileFrameList },
        });
        this.fetchFrameData();
        callback && callback();
      }, err => this.setLoadingStatus('saveFrame', false));
    });
  };
  // 保存控件列表
  handleSaveElement = () => {
    const { elementListMap, tabBasicData, bundleData, systemParams } = this.props.bundleConfig;
    const { userDesignerId, planned } = systemParams;
    const params = {
      id: tabBasicData.id,
      elementList: elementListMap[tabBasicData.id],
      bundleId: bundleData.id,
      userDesignerId,
      planned,
    };
    insertOrUpdateUserDesignerMobileTabElement(params).then(res => {
      // this.clearEditStatus();
      this.fetchFrameData();
    }, err => this.setState({ loadingSave: false }));
  };
  // 更新loading状态
  setLoadingStatus = (type, loading) => {
    this.setState({
      loadingStatus: {
        ...this.state.loadingStatus,
        [type]: loading,
      },
    });
  };
  // 打开新建面板窗口
  handleOpenAddTab = () => {
    const { bundleConfig } = this.props;
    const { mobileFrameList } = bundleConfig;
    const { langLib } = this.context;
    if (!mobileFrameList.length) {
      CMessage(langLib['message.warn.saveFrameing'], 'warn');
      this.handleSaveFrame(() => {
        this.setState({ visibleAddModal: true });
      });
      return;
    }
    this.setState({ visibleAddModal: true });
  };
  // 选择面板后走接口保存面板基础信息及控件信息
  handleAddTab = (addType = 'addTab') => {
    const { langLib } = this.context;
    const { fromType } = this.props;
    const { bundleData, addTabDetail, mobileTabList, systemParams } = this.props.bundleConfig;
    const { planned, userDesignerId } = systemParams;
    const { id: bundleId } = bundleData;
    const { ignore_type } = addTabDetail;
    const namePrefix = fromType === 'bundleConfig' ? bundleData.name : bundleData.bundleName;
    const snoList = mobileTabList.map(item => item.sno).filter(item => typeof item === 'number');
    const maxSno = snoList.length ? Math.max(...snoList) : 0;
    const basicParams = {
      ...addTabDetail,
      mainTab: 0,
      visiabled: 1,
      planned,
      bundleId,
      groupId: null,
      userDesignerId,
      sno: maxSno ? maxSno + 1 : 1,
      name: addType === 'emptyTab' ? `${namePrefix}-${mobileTabList.length + 1}` : addTabDetail.name,
    };
    // 保存成功后
    const afterSave = (tab) => {
      CMessage(langLib['message.save.success']);
      this.setLoadingStatus(addType, false);
      this.handleCloseAddTabModal();
      this.fetchFrameData(() => {
        this.handelChangeTab(`${TAB_KEY_PREFIX}${tab.id}`);
      });

    };
    this.setLoadingStatus(addType, true);
    // 从菜单库中选择面板
    if (addType === 'addTab' && ignore_type === 'menuTree') {
      this.doAddMenuTab(maxSno + 1, addType, afterSave);
      return;
    }
    // 保存基础信息
    insertOrUpdateUserDesignerMobileTab(basicParams).then(res => {
      // 若是新增空面板或没有控件列表，则不用绑定控件
      if (addType === 'emptyTab' || !addTabDetail.elementList || !addTabDetail.elementList.length) {
        afterSave(res);
        return;
      }
      const elementParams = {
        userDesignerId,
        id: res.id,
        bundleId,
        planned,
        elementList: addTabDetail.elementList || [],
      };
      // 根据id保存对应控件列表
      insertOrUpdateUserDesignerMobileTabElement(elementParams).then(eleRes => {
        afterSave(res);
      }, err => this.setLoadingStatus(addType, false));
    }, err => this.setLoadingStatus(addType, false));
  };
  // 从菜单库中选择添加面板
  doAddMenuTab = (sno, addType, afterSave) => {
    const { bundleData, addTabDetail, systemParams } = this.props.bundleConfig;
    const { ignore_id: mobileTabId, userDesignerId: oldUserDesignerId, pid } = addTabDetail;
    const { userDesignerId } = systemParams;
    const params = {
      oldBundleId: +pid.split('-')[0],
      oldUserDesignerId,
      bundleId: bundleData.id,
      userDesignerId,
      mobileTabId,
      sno,
    };
    copyTabData(params).then(res => {
      afterSave(res);
    }, err => this.setLoadingStatus(addType, false));
  };
  // 新增控件后
  addEleCallback = addEle => {
    const { elementListMap, tabBasicData } = this.props.bundleConfig;
    const { id: tabId } = tabBasicData;
    this.context.dispatch({
      type: 'bundleConfig/updateState',
      payload: {
        elementListMap: {
          ...elementListMap,
          [tabId]: [
            ...elementListMap[tabId],
            addEle,
          ],
        },
      },
    });
  };
  // 关闭弹框 设置activetabkey
  handleCloseAddTabModal = () => {
    this.setState({ visibleAddModal: false, selectedTabNodeInfo: {}, keywords: '' });
    this.context.dispatch({
      type: 'bundleConfig/updateState',
      payload: {
        addTabDetail: {},
      },
    });
  };
  // 更新state
  setContainerState = (itemObj) => {
    this.setState(itemObj);
  };
  // 展开组件库按钮
  ModuleBtn = () => {
    return <div className={`${styles.paramsBox} custom-color`} onClick={() => this.showSettingModal()}><span
      className={`iconfont icon-menu-fold custom-color ${styles.iconSty}`}></span><FormattedMessage
      id="framePageConfig.parameter.settings"/></div>;
  };
  // 展开设置
  showSettingModal = () => {
    this.setState({ visibleParamKey: true });
  };
  // 点击输入参数时保存
  addParamSetting = () => {
    this.ParameterSetting && this.ParameterSetting.insertOrUpdateParamList(() => {
      console.log('保存成功');
    });
  };

  render() {
    const { visibleAddModal, selectedTabNodeInfo, loadingStatus, visibleParamKey, keywords } = this.state;
    const { form, fromType, bundleConfig, functionData } = this.props;
    const { mobileTabList = [], elementListMap = {}, activeTabKey } = bundleConfig;
    const { canmodify, canadd, candelete } = functionData.attributes;
    const frameIconCls = classNames({
      'iconfont': true,
      'icon-frame-tab': true,
    });
    // 添加按钮class
    const addIconCls = classNames({
      'iconfont': true,
      'icon-add-tab': true,
    });
    // 新增面板按钮
    const addTabBtn = canadd ? (
      <div className={styles.addBtnWrap} onClick={this.handleOpenAddTab}><span className={addIconCls}/></div>) : null;
    const footer = (
      <Fragment>
        <CButton
          type="yellow"
          onClick={() => this.handleAddTab('emptyTab')}
          loading={loadingStatus.emptyTab}
        >
          <FormattedMessage id="framePageConfig.button.emptyTab"/>
        </CButton>
        <CButton
          type="primary"
          onClick={() => this.handleAddTab('addTab')}
          disabled={!selectedTabNodeInfo.nodeKey || selectedTabNodeInfo.isGroup}
          loading={loadingStatus.addTab}
        >
          <FormattedMessage id="framePageConfig.button.pick"/>
        </CButton>
      </Fragment>
    );
    // 渲染面板
    const renderTabs = () => {
      return mobileTabList.map((tab, index) => {
        const closeIcon = candelete ?
          <span className="iconfont icon-close" onClick={(e) => this.handleCloseTab(e, tab)}/> : null;
        const tabTit = (
          <div className={styles.tabTit}>
            {tab.name}
            {closeIcon}
          </div>
        );
        return (
          <TabPane tab={tabTit} key={`${TAB_KEY_PREFIX}${tab.id}`}>
            <TabConfig
              modelName="bundleConfig"
              isPC={false}
              setContainerState={this.setContainerState}
              // saveChildBlank={this.saveChildBlank}
              elementList={elementListMap[tab.id]}
              fetchFrameData={() => this.fetchFrameData(false)}
              addEleCallback={this.addEleCallback}
              fromType={fromType === 'bundleConfig' ? 'appBundleConfig' : 'appPageConfig'}
              tabInfo={tab}
              functionData={functionData}
            />
          </TabPane>
        );
      });
    };
    // 标题
    const modalSearchCls = classNames({
      [styles.modalSearch]: true,
      // [styles.showInput]: !!headerKeywords,
      [styles.showInput]: true,
    });
    const title = (
      <Fragment>
        <FormattedMessage id="framePageConfig.selectPageTab.title"/>
        <CSearch
          allowClear={false}
          className={modalSearchCls}
          onSearch={keywords => this.setState({ keywords })}
          onChange={e => !e.target.value && this.setState({ keywords: null })}
        />
        {/* <span className={`${styles.split} split-line`}>|</span> */}
      </Fragment>
    );
    return (
      <div className={styles.wrap} id="mobile-tab-container">
        <CSpin spinning={false}>
          <Tabs
            activeKey={activeTabKey}
            onChange={this.handelChangeTab}
            animated={false}
            className="custom-pageConfig-tabs pageConfig"
            tabBarExtraContent={this.ModuleBtn()}
          >
            <TabPane tab={<span className={frameIconCls}/>} key="frameConfig" className={styles.frameTab}>
              <FrameConfig handleSaveFrame={() => this.handleSaveFrame()} form={form}
                           saveLoading={loadingStatus.saveFrame}/>
            </TabPane>
            {renderTabs()}
            <TabPane key="addTab" tab={addTabBtn} disabled/>
          </Tabs>
        </CSpin>
        {/* 新建面板 */}
        <CreateModal
          visible={visibleAddModal}
          mask={false}
          maskClosable={false}
          className={styles.modal}
          onCancel={this.handleCloseAddTabModal}
          title={title}
          getContainer={document.getElementById('mobile-tab-container')}
          footer={footer}
        >
          <SelectPageTab
            fromType="APP"
            keywords={keywords}
            setContainerState={this.setContainerState}
            selectedTabNodeInfo={selectedTabNodeInfo}
          />
        </CreateModal>
        {/* 菜单输入参数设置 */}
        <CreateModal
          visible={visibleParamKey}
          // mask={false}
          // maskClosable={false}
          onCancel={() => {
            this.setState({ visibleParamKey: false });
          }}
          onOk={() => {
            if (canmodify || canadd || candelete) {
              this.addParamSetting();
            } else {
              this.setState({ visibleParamKey: false });
            }
          }}
          title={<FormattedMessage id="framePageConfig.parameter.settings"/>}
        >
          <ParameterSetting
            ref={(ref) => {
              this.ParameterSetting = ref;
            }}
            isApp={true}
            functionData={functionData}
            framePage={this.props.bundleConfig}
          />
        </CreateModal>
      </div>
    );
  }
}

export default Form.create()(MobileTabPaneContainer);
