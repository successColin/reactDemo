/*
 * @Author: Fus
 * @Date:   2019-08-10 14:29:14
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-10 10:24:17
 * @Desc: tab容器
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs, Modal } from 'antd';

import { connect } from 'dva';
import classNames from 'classnames';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import { CButton, CSpin, CMessage, CSearch } from '@/components/common/BasicWidgets';
import SelectPageTab from '@/components/common/SelectPageTab/SelectPageTab';
import FrameConfig from './FrameConfig/FrameConfig';
import ParameterSetting from './ParameterSetting/ParameterSetting';
import TabConfig from '@/components/common/TabConfig/TabConfig';
import {
  getFrameDetail,
  doUpdateTabBasicData,
  doUpdateTabElementData,
  deleteUserDesignerTab,
  updateUserDesignerFilterCond,
  copyTabData,
} from '@/services/framePage';
import { updateFrameDetail } from '@/services/frame';
import { getDefaultConfirmProps } from '@/utils/common';
import { BaseContext } from '@/constants/global';
import styles from './TabPaneConTainer.less';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const { TabPane } = Tabs;

const TAB_KEY_PREFIX = 'tab_';

@connect(state => ({
  framePage: state.framePage,
}))
class TabPaneConTainer extends Component {
  static contextType = BaseContext;
  state = {
    selectedTabNodeInfo: {}, // 选择面板的面板信息（树节点）
    visibleAddModal: false, // 新增面板窗口是否可见
    childBlankKey: 'basicProps', // 面板下当前模块（用于切换面板自动做保存）
    addType: 'empty', // 新增面板方式（addNew导入面板、empty空面板）
    loadingStatus: {
      addTab: false, // 新增有数据面板
      emptyTab: false, // 新增空面板
      saveFrame: false, // 保存框架数据
    },
    keywords: '', // 复制菜单的模糊查询
    visibleParamKey: false, // 输入参数控制
  };
  // 获取界面数据（包括frame和tabList)
  fetchFrameData = (setLast = true, callback) => {
    const { functionId, userDesignerId } = this.props.framePage;
    const params = {
      functionId,
      planned: 10,
      userDesignerId,
    };
    getFrameDetail(params).then(res => {
      const { activeTabListKey } = this.props;
      const { frame = {}, tabList = [] } = res;
      const activeTabId = +(activeTabListKey.split(TAB_KEY_PREFIX)[1]);
      let activeTab = tabList.find(item => item.id === activeTabId) || {};
      // 设置第一个面板为当前面板
      if (setLast) {
        const activeTabId = tabList.id;
        const activeTabListKey = activeTabId ? `${TAB_KEY_PREFIX}${activeTab.id}` : 'frameConfig';
        this.props.updateFrameState({ activeTabListKey });
      }
      const { elementList = [], advancedQueryList = [] } = activeTab;
      let tabFilterCond = advancedQueryList;
      this.context.dispatch({
        type: 'framePage/updateState',
        payload: {
          frame: frame || {},
          tabList: tabList || [],
          tabBasicData: activeTab || {},
          tabElementList: elementList || [],
          tabFilterCond,
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
        const { functionId, userDesignerId } = this.props.framePage;
        const { id } = tab;
        const params = { id, functionId, userDesignerId, planned: 10 };
        deleteUserDesignerTab(params).then(res => {
          CMessage(this.context.langLib['message.del.success']);
          this.fetchFrameData();
          closeModal();
        });
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
    // Modal.confirm({
    //   className: 'customConfirmColor',
    //   ...getDefaultConfirmProps(this.context.langLib),
    //   onOk: () => {
    //     const { functionId, userDesignerId } = this.props.framePage;
    //     const { id } = tab;
    //     const params = { id, functionId, userDesignerId, planned: 10 };
    //     return deleteUserDesignerTab(params).then(res => {
    //       CMessage(this.context.langLib['message.del.success']);
    //       this.fetchFrameData();
    //     });
    //   },
    // });
  };
  // 切换面板
  handelChangeTab = (activeKey) => {
    const { tabList } = this.props.framePage;
    const { childBlankKey } = this.state;
    this.props.form.resetFields();
    const tabId = +(activeKey.split(TAB_KEY_PREFIX)[1]);
    const tabBasicData = tabList.find(item => item.id === tabId) || {};
    this.props.updateFrameState({ activeTabListKey: activeKey });
    this.saveChildBlank(childBlankKey);
    const { elementList = [], advancedQueryList = [] } = tabBasicData;
    let tabFilterCond = advancedQueryList;
    // if (!advancedQueryList || !advancedQueryList.length) {
    //   tabFilterCond = [
    //     { index: 0, asqlWholeCondition: 'test' }, { index: 1, asqlWholeCondition: 'test' },
    //   ]; // 默认两条数据
    // }
    this.context.dispatch({
      type: 'framePage/updateState',
      payload: {
        tabBasicData,
        tabElementList: elementList || [],
        tabFilterCond,
      },
    });
  };
  // 保存当前面板当前模块下的数据
  saveChildBlank = (blankKey) => {
    const { tabBasicData, tabElementList, tabEditStatus, tabFilterCond } = this.props.framePage;
    const { functionId, userDesignerId } = tabBasicData;
    const { activeTabListKey } = this.props;
    const id = +(activeTabListKey.split(TAB_KEY_PREFIX)[1]);
    if (activeTabListKey === 'frameConfig' || !tabEditStatus[id] || !tabEditStatus[id][blankKey]) return;
    // 重新获取面板信息并更新数据
    const reGetFrameData = () => {
      getFrameDetail({ functionId, userDesignerId, planned: 10 }).then(res => {
        const { frame, tabList } = res;
        this.context.dispatch({
          type: 'framePage/updateState',
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
      doUpdateTabBasicData({ ...tabBasicData }).then(reGetFrameData);
    } else if (blankKey === 'elementList') { // 保存控件
      doUpdateTabElementData({ elementList: tabElementList, id, functionId, userDesignerId }).then(reGetFrameData);
    } else if (blankKey === 'filterCond') { // 保存过滤条件
      updateUserDesignerFilterCond({
        advancedQueryList: tabFilterCond,
        id,
        functionId,
        userDesignerId,
      }).then(reGetFrameData);
    }
  };
  // 保存框架信息
  handleSaveFrame = () => {
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      const { frame, selectedUserDesignerDetail, activeTreeNodeDetail } = this.props.framePage;
      const { langLib } = this.context;
      const reqParams = {
        ...frame,
        ...values,
        userDesignerId: selectedUserDesignerDetail.id,
        functionId: activeTreeNodeDetail.id,
      };
      this.setLoadingStatus('saveFrame', true);
      updateFrameDetail(reqParams).then(frame => {
        this.setLoadingStatus('saveFrame', false);
        CMessage(langLib['message.save.success']);
        this.context.dispatch({
          type: 'framePage/updateState',
          payload: { frame },
        });
      }, err => this.setLoadingStatus('saveFrame', false));
    });
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
    const { framePage } = this.props;
    const { frame } = framePage;
    const { langLib } = this.context;
    if (!frame.id) {
      CMessage(langLib['message.warn.noFrameData'], 'warn');
      return;
    }
    this.setState({ visibleAddModal: true });
  };
  // 更新当前菜单框架面板信息
  updateTabList = ({ tabList }) => {
    this.context.dispatch({
      type: 'framePage/updateTabList',
      payload: {
        tabList,
      },
    });
  };
  // 选择面板后走接口保存面板基础信息及控件信息
  handleAddTab = (addType = 'addTab') => {
    const { langLib } = this.context;
    const { functionId, userDesignerId, addTabDetail, activeTreeNodeDetail, tabList } = this.props.framePage;
    const snoList = tabList.map(item => item.sno).filter(item => typeof item === 'number');
    const maxSno = snoList.length ? Math.max(...snoList) : 0;
    const { ignore_type } = addTabDetail;
    let basicParams = addType === 'emptyTab' ? {} : { ...addTabDetail };
    basicParams = {
      ...basicParams,
      mainTab: 0,
      visiabled: 1,
      planned: 10,
      dataSourceType: 1,
      functionId,
      userDesignerId,
      groupId: null,
      sno: maxSno ? maxSno + 1 : 1,
      name: addType === 'emptyTab' ? `${activeTreeNodeDetail.name}-${tabList.length + 1}` : addTabDetail.name,
    };
    // 保存成功后
    const afterSave = (tab) => {
      CMessage(langLib['message.save.success']);
      this.fetchFrameData(false, () => {
        this.handelChangeTab(`${TAB_KEY_PREFIX}${tab.id}`);
      });
      this.setLoadingStatus(addType, false);
      this.handleCloseModal();

    };
    this.setLoadingStatus(addType, true);
    // 从菜单库中选择面板
    if (addType === 'addTab' && ignore_type === 'menuTree') {
      this.doAddMenuTab(maxSno + 1, addType, afterSave);
      return;
    }
    // 保存基础信息
    doUpdateTabBasicData(basicParams).then(res => {
      // 若是新增空面板或没有控件列表，则不用绑定控件
      if (addType === 'emptyTab' || !addTabDetail.elementList || !addTabDetail.elementList.length) {
        afterSave(res);
        return;
      }
      const elementParams = {
        userDesignerId,
        id: res.id,
        functionId,
        elementList: addTabDetail.elementList || [],
      };
      // 根据id保存对应控件列表
      doUpdateTabElementData(elementParams).then(eleRes => {
        afterSave(res);
      }, err => this.setLoadingStatus(addType, false));
    }, err => this.setLoadingStatus(addType, false));
  };
  // 从菜单库中选择添加面板
  doAddMenuTab = (sno, addType, afterSave) => {
    const { functionId, userDesignerId, addTabDetail } = this.props.framePage;
    const { ignore_id: tabId, userDesignerId: oldUserDesignerId, pid } = addTabDetail;
    const params = {
      oldFunctionId: +pid.split('-')[0],
      oldUserDesignerId,
      tabId,
      sno,
      userDesignerId,
      functionId,
    };
    copyTabData(params).then(res => {
      afterSave(res);
    }, err => this.setLoadingStatus(addType, false));
  };
  // 新增控件后
  addEleCallback = addEle => {
    const { tabElementList } = this.props.framePage;
    const newList = [...tabElementList];
    newList.push(addEle);
    this.context.dispatch({
      type: 'framePage/updateState',
      payload: {
        tabElementList: newList,
      },
    });
  };
  // 关闭弹框 设置activetabkey
  handleCloseModal = () => {
    this.setState({ visibleAddModal: false, selectedTabNodeInfo: {}, keywords: '' });
  };
  // 更新state
  setContainerState = (itemObj) => {
    this.setState(itemObj);
  };
  // 展开设置
  showSettingModal = () => {
    this.setState({ visibleParamKey: true });
  };
  // 展开组件库按钮
  ModuleBtn = () => {
    return <div className={`${styles.paramsBox} custom-color`} onClick={() => this.showSettingModal()}><span
      className={`custom-color iconfont icon-menu-fold ${styles.iconSty}`}></span><FormattedMessage
      id="framePageConfig.parameter.settings"/></div>;
  };
  // 点击输入参数时保存
  addParamSetting = () => {
    this.ParameterSetting && this.ParameterSetting.insertOrUpdateParamList(() => {
      console.log('保存成功');
    });
  };

  render() {
    const { visibleAddModal, selectedTabNodeInfo, loadingStatus, visibleParamKey, keywords } = this.state;
    const { form, loading, activeTabListKey, functionData } = this.props;
    const { framePage } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    const { tabList = [] } = framePage;
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
    const addTabBtn = canadd ?
      <div className={styles.addBtnWrap} onClick={this.handleOpenAddTab}><span className={addIconCls}/>
      </div> : null;
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
      return tabList.map((tab, index) => {
        const closeIcon = <span className="iconfont icon-close" onClick={(e) => this.handleCloseTab(e, tab)}/>;
        const tabTit = (
          <div className={styles.tabTit}>
            {tab.name}
            {candelete ? closeIcon : null}
          </div>
        );
        return (
          <TabPane tab={tabTit} key={`${TAB_KEY_PREFIX}${tab.id}`}>
            <TabConfig
              functionData={functionData}
              modelName="framePage"
              isPC={true}
              setContainerState={this.setContainerState}
              saveChildBlank={this.saveChildBlank}
              // eleLength={tab.elementList.length}
              fetchFrameData={() => this.fetchFrameData(false)}
              addEleCallback={this.addEleCallback}
              tabInfo={tab}
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
      <div className={styles.wrap}>
        <CSpin spinning={loading}>
          <Tabs
            activeKey={activeTabListKey}
            onChange={this.handelChangeTab}
            animated={false}
            className="custom-pageConfig-tabs pageConfig"
            tabBarExtraContent={this.ModuleBtn()}
          >
            <TabPane tab={<span className={frameIconCls}/>} key="frameConfig" className={styles.frameTab}>
              <FrameConfig functionData={functionData} handleSaveFrame={this.handleSaveFrame} form={form}
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
          onCancel={this.handleCloseModal}
          // title={<FormattedMessage id="framePageConfig.selectPageTab.title"/>}
          title={title}
          footer={footer}
        >
          <SelectPageTab
            keywords={keywords}
            setContainerState={this.setContainerState}
            selectedTabNodeInfo={selectedTabNodeInfo}
          />
        </CreateModal>
        {/* 菜单输入参数设置 */}
        <CreateModal
          visible={visibleParamKey}
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
            functionData={functionData}
            framePage={this.props.framePage}
          />
        </CreateModal>
      </div>
    );
  }
}

export default TabPaneConTainer;
