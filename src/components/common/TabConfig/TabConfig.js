/*
 * @Author: Fus
 * @Date:   2019-08-21 10:58:48
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-26 11:00:08
 * @Desc: 面板配置（预设界面、设计组菜单等处调用）
 */
import { Component, Fragment } from 'react';
import { Tabs, Form } from 'antd';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { connect } from 'dva';
import { CButton, CMessage } from '@/components/common/BasicWidgets';
import CreateDrawer from '@/components/common/CreateDrawer/CreateDrawer';
import IconLibBlank from '@/components/common/IconLibBlank/IconLibBlank';
import BasicForm from './BasicForm/BasicForm';
import ElementList from './ElementList/ElementList';
import FilterCond from './FilterCond/FilterCond';
import SortConfig from './SortConfig/SortConfig';
import GinsengConfig from './GinsengConfig/GinsengConfig';
import SeniorFilterList from './SeniorFilterList/SeniorFilterList';
import { BaseContext } from '@/constants/global';
import {
  doUpdateTabBasicData,
  doUpdateTabElementData,
  updateUserDesignerFilterCond,
  insertOrUpdateTabSeniorFilter,
  insertOrUpdateParams,
} from '@/services/framePage';
import {
  insertOrUpdateUserDesignerMobileTab,
  insertOrUpdateUserDesignerMobileTabElement,
  insertOrUpdateUserDesignerMobileTabAdvancedQuery,
} from '@/services/bundleConfig';
import { insertOrUpdateTabSort, getFiledRelation } from '@/services/pageConfig';
import styles from './TabConfig.less';

const { TabPane } = Tabs;

@connect(state => ({
  framePage: state.framePage,
  bundleConfig: state.bundleConfig,
}))
class TabConfig extends Component {
  static contextType = BaseContext;
  static defaultProps = {
    modelName: 'framePage',
    isPC: true,
  };
  state = {
    visibleModuleLib: false, // 组件库窗口是否可见
    tabBlankKey: 'basicProps', // 当前tabkey（基本信息、包含元素、过滤条件）
    loadingSave: false, // 保存按钮loading状态
  };
  // 切换tab
  handleChangeTab = (activeKey) => {
    const { tabBlankKey } = this.state;
    this.setState({ tabBlankKey: activeKey }, () => {
      // this.props.saveChildBlank(tabBlankKey);
      this.props.setContainerState({ childBlankKey: activeKey });
    });
  };
  // 设置编辑状态
  setEditStatus = (editModule) => {
    const { modelName } = this.props;
    const { tabBasicData, tabEditStatus } = this.props[modelName];
    const { id } = tabBasicData;
    let willSetState = { [editModule]: true };
    // 没有该tab的数据
    if (!tabEditStatus[id]) {
      willSetState = {
        ...tabEditStatus,
        [id]: willSetState,
      };
    } else if (!tabEditStatus[id][editModule]) { // 有该tab的数据且editModule为false，更新对应editModule的状态
      willSetState = {
        ...tabEditStatus,
        [id]: {
          ...tabEditStatus[id],
          [editModule]: true,
        },
      };
    } else { // 若该tab及module已设置为编辑状态，则无需更新
      return false;
    }
    this.context.dispatch({ type: `${modelName}/updateState`, payload: { tabEditStatus: willSetState } });
  };
  // 从组件库中加入
  addActiveModule = ({ selectedRows }) => {
    const { modelName } = this.props;
    const { tabElementList } = this.props[modelName];
    const newList = [...tabElementList];
    newList.push({
      ...selectedRows[0],
      // sno: tabElementList.length + 1,
    });
    this.context.dispatch({
      type: `${modelName}/updateState`,
      payload: { tabElementList: newList },
    });
  };
  // 点击确定保存
  handleSave = () => {
    const { tabBlankKey } = this.state;
    switch (tabBlankKey) {
      case 'basicProps':
        this.saveBasicProps();
        break;
      case 'elementList':
        this.setState({ loadingSave: true });
        this.saveElement();
        break;
      case 'filterCond':
        this.setState({ loadingSave: true });
        this.saveFilterCond();
        break;
      case 'sortConfig':
        this.setState({ loadingSave: true });
        this.saveSortConfig();
        break;
      case 'seniorFilterList':
        this.setState({ loadingSave: true });
        this.saveSeniorFilterList();
        break;
      case 'Ginseng':
        this.setState({ loadingSave: true });
        this.saveGinsengList();
        break;
      default:
        return;
    }
  };
  // 保存基本信息
  saveBasicProps = () => {
    const { modelName, isPC } = this.props;
    const { tabBasicData } = this.props[modelName];
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (err) return;
      this.setState({ loadingSave: true });
      const params = {
        ...tabBasicData,
        ...values,
        name: tabBasicData.name,
      };
      const api = isPC ? doUpdateTabBasicData : insertOrUpdateUserDesignerMobileTab;
      api(params).then(res => {
        this.clearEditStatus();
        // this.props.fetchFrameData();
      }, err => this.setState({ loadingSave: false }));
    });
  };

  // 保存控件列表
  async saveElement() {
    const { isPC } = this.props;
    let params = {};
    if (isPC) {
      const { tabElementList, tabBasicData, functionId, userDesignerId } = this.props.framePage;
      let newList = tabElementList.map(item => {
        if (item.basetype === 43 || item.basetype === 44) {
          item.jumpType = 2;
        }
        return item;
      });
      params = {
        id: tabBasicData.id,
        elementList: newList,
        functionId,
        userDesignerId,
      };
    } else {
      const { elementListMap, tabBasicData, bundleData, systemParams } = this.props.bundleConfig;
      const { userDesignerId, planned } = systemParams;
      let elementList = elementListMap[tabBasicData.id] || [];
      let newList = elementList.map(item => {
        if (item.basetype === 43 || item.basetype === 44) {
          item.jumpType = 2;
        }
        return item;
      });

      params = {
        id: tabBasicData.id,
        elementList: newList,
        bundleId: bundleData.id,
        userDesignerId,
        planned,
      };
    }
    // 保存控件信息的时候，需要判断控件里面有没有配置多选框，没有配置，则正常保存，并且是有生成多条数据的，如果有生成多条数据的，就要
    // 判断该控件中的有没有配置关联关系
    const checkMultiChoiceIsExist = params.elementList.find(item => item.basetype === 45 && item.elementFormat === 1);
    let isTrue = true;
    if (checkMultiChoiceIsExist) {
      let FiledRelationList = await getFiledRelation({ elementId: checkMultiChoiceIsExist.id });
      isTrue = !!FiledRelationList.length;
    }
    if (!isTrue) {
      CMessage(this.context.langLib['message.save.error'], 'error');
      this.setState({ loadingSave: false });
      return;
    }
    const api = isPC ? doUpdateTabElementData : insertOrUpdateUserDesignerMobileTabElement;
    api(params).then(res => {
      this.clearEditStatus();
      // this.props.fetchFrameData();
    }, err => this.setState({ loadingSave: false }));
  };


  // 保存过滤条件
  saveFilterCond = () => {
    const { isPC } = this.props;
    let params = {};
    let advancedQueryList = [];
    if (isPC) {
      const { tabFilterCond, tabBasicData } = this.props.framePage;
      const { id, functionId, userDesignerId } = tabBasicData;
      advancedQueryList = tabFilterCond.map(item => ({ ...item, id: null }));
      params = { id, functionId, userDesignerId };
    } else {
      const { queryListMap, tabBasicData, bundleData, systemParams } = this.props.bundleConfig;
      const { userDesignerId, planned } = systemParams;
      const { id } = tabBasicData;
      advancedQueryList = queryListMap[tabBasicData.id].map(item => ({ ...item, id: null }));
      params = {
        advancedQueryList,
        id,
        planned,
        bundleId: bundleData.id,
        userDesignerId,
      };
    }
    const apiSql = this.props.form.getFieldValue('apiSql');
    let newList = [...advancedQueryList];
    const sqlIndex = newList.findIndex(item => item.basetype === 2);
    if (sqlIndex === -1) {
      newList.push({
        asqlWholeCondition: 'test',
        apiSql,
        basetype: 2,
        queryType: advancedQueryList.length ? advancedQueryList[0].queryType : 1,
      });
    } else {
      newList.splice(sqlIndex, 1, {
        ...advancedQueryList[sqlIndex],
        apiSql,
      });
    }
    params = {
      ...params,
      advancedQueryList: newList,
    };
    const api = isPC ? updateUserDesignerFilterCond : insertOrUpdateUserDesignerMobileTabAdvancedQuery;
    api(params).then(res => {
      this.clearEditStatus();
      // this.props.fetchFrameData();
    }, err => this.setState({ loadingSave: false }));
  };
  // 保存排序配置
  saveSortConfig = () => {
    const { langLib } = this.context;
    const { tabInfo, isPC } = this.props;
    const { id: tabId } = tabInfo;
    const tabSortList = this.sortConfigRef.state.listData;
    const params = { tabSortList };
    if (isPC) {
      params.tabId = tabId;
    } else {
      params.mobileTabId = tabId;
    }
    this.setState({ loadingSave: true });
    insertOrUpdateTabSort(params).then(res => {
      CMessage(langLib['message.save.success']);
      this.setState({ loadingSave: false });
    }, err => this.setState({ loadingSave: false }));
  };
  // 保存高级筛选
  saveSeniorFilterList = () => {
    const { langLib } = this.context;
    const { tabInfo, isPC } = this.props;
    const { seniorFilterList } = this.seniorFilterRef.state;
    const paramName = isPC ? 'tabId' : 'mobileTabId';
    const params = {
      seniorFilterList,
      [paramName]: tabInfo.id,
    };
    insertOrUpdateTabSeniorFilter(params).then(res => {
      CMessage(langLib['message.save.success']);
      this.setState({ loadingSave: false });
    }, err => this.setState({ loadingSave: false }));
  };
  // 保存入参列表
  saveGinsengList = () => {
    const { langLib } = this.context;
    const { tabInfo, isPC } = this.props;
    const { inParamsList } = this.GinsengRef.state;
    const paramName = isPC ? 'tabId' : 'mobileTabId';
    const params = {
      serviceParamPramDtoList: inParamsList,
      [paramName]: tabInfo.id,
      commonApiHeaderId: tabInfo.commonApiHeaderId,
    };
    insertOrUpdateParams(params).then(res => {
      CMessage(langLib['message.save.success']);
      this.setState({ loadingSave: false });
    }, err => this.setState({ loadingSave: false }));
  };
  // 保存后清除编辑状态
  clearEditStatus = () => {
    CMessage(this.context.langLib['message.save.success']);
    this.setState({ loadingSave: false });
    const { tabBlankKey } = this.state;
    const { modelName } = this.props;
    const { tabEditStatus, tabBasicData } = this.props[modelName];
    const { id } = tabBasicData;
    this.props.fetchFrameData();
    this.context.dispatch({
      type: `${modelName}/updateState`,
      payload: {
        tabEditStatus: {
          ...tabEditStatus,
          [id]: {
            ...tabEditStatus[id],
            [tabBlankKey]: false,
          },
        },
      },
    });
  };

  render() {
    const { functionData, isPC, modelName, form, fromType, addEleCallback, tabInfo = {}, framePage, bundleConfig } = this.props;
    const { tabBlankKey, visibleModuleLib, loadingSave } = this.state;
    const { tabBasicData, bundleData = {}, frameTypeDto } = this.props[modelName];
    const { dataSourceType } = tabBasicData;
    let newSno = 1;
    if (isPC) {
      const { tabElementList } = this.props.framePage;
      const eleLen = tabElementList.length;
      newSno = eleLen ? tabElementList[eleLen - 1].sno + 1 : 1;
    } else {
      const { elementList, bundleConfig } = this.props;
      const eleLen = elementList.length;
      newSno = eleLen ? elementList[eleLen - 1].sno + 1 : 1;
    }
    const wrapCls = classNames({
      [styles.tabWrap]: true,
      'custom-third-tab': true,
    });
    // 展开组件库按钮
    const ModuleBtn = tabBlankKey === 'elementList' && (
      <div className={styles.rightBtn}>
        <CButton className="custom-btn" onClick={() => this.setState({ visibleModuleLib: true })}>
          <span className="iconfont icon-to-open"/>
          <FormattedMessage id="to.open.eleLib"/>
        </CButton>
      </div>
    );
    const moduleLibDrawerProps = {
      title: <FormattedMessage id="global.moduleLib"/>,
      visible: visibleModuleLib,
      onClose: () => this.setState({ visibleModuleLib: false }),
    };
    const footerCls = classNames({
      [styles.footer]: true,
      [styles.PC]: isPC,
      [styles.APP]: !isPC,
    });
    const publicProps = {
      modelName,
      isPC,
      functionData,
    };
    const { canmodify, canadd, candelete } = functionData.attributes;
    return (
      <Fragment>
        <Tabs
          activeKey={tabBlankKey}
          type="card"
          className={wrapCls}
          onChange={this.handleChangeTab}
          tabBarExtraContent={ModuleBtn}
        >
          <TabPane tab={<FormattedMessage id="tab.module.basic"/>} key="basicProps">
            <BasicForm
              {...publicProps}
              form={form}
              setEditStatus={() => this.setEditStatus('basicProps')}
            />
          </TabPane>
          <TabPane tab={<FormattedMessage id="tab.module.element"/>} key="elementList">
            <ElementList
              {...publicProps}
              setEditStatus={() => this.setEditStatus('elementList')}
              doSaveFrameTab={this.saveElement}
            />
          </TabPane>
          {dataSourceType === 2 ? null : <TabPane tab={<FormattedMessage id="tab.module.filter"/>} key="filterCond">
            <FilterCond
              {...publicProps}
              form={form}
              setEditStatus={() => this.setEditStatus('filterCond')}
            />
          </TabPane>}
          {dataSourceType === 2 ? null : <TabPane tab={<FormattedMessage id="tab.module.sort"/>} key="sortConfig">
            <SortConfig
              {...publicProps}
              tabInfo={tabInfo}
              // elementList={tabElementList}
              ref={ref => this.sortConfigRef = ref}
            />
          </TabPane>}
          {dataSourceType === 2 ? null :
            <TabPane tab={<FormattedMessage id="tab.module.seniorFilterList"/>} key="seniorFilterList">
              <SeniorFilterList
                {...publicProps}
                tabInfo={tabInfo}
                bundleConfig={bundleConfig}
                framePage={framePage}
                wrappedComponentRef={ref => this.seniorFilterRef = ref}
              />
            </TabPane>}
          {!dataSourceType || dataSourceType === 1 ? null :
            <TabPane tab={<FormattedMessage id="tab.module.Ginseng"/>} key="Ginseng">
              <GinsengConfig
                {...publicProps}
                tabInfo={tabInfo}
                ref={ref => this.GinsengRef = ref}
              />
            </TabPane>}
        </Tabs>
        <div className={footerCls}>
          {canmodify || candelete ? <div className={styles.btnWrap}>
            <CButton type="primary" onClick={this.handleSave} loading={loadingSave}>
              <FormattedMessage id="global.ok"/>
            </CButton>
          </div> : null}
        </div>
        <CreateDrawer {...moduleLibDrawerProps}>
          <IconLibBlank
            fromType={fromType}
            setWrapState={this.addActiveModule}
            newSno={newSno}
            selectedRows={[]}
            preData={isPC ? { ...tabBasicData, framType: frameTypeDto.basetype } : {
              ...tabBasicData,
              bundleId: bundleData.id,
            }}
            elementType={isPC ? 1 : 10}
            addEleCallback={addEleCallback}
            dataType="relateTab"
            iconSize="large"
          />
        </CreateDrawer>
      </Fragment>
    );
  }
}

export default Form.create()(TabConfig);
