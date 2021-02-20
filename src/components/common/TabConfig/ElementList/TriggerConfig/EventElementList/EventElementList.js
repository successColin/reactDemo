/*
 * @Author: Fus
 * @Date:   2019-08-15 10:31:25
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-04-03 10:47:30
 * @Desc: 事件及字段
 */
import { Component, Fragment } from 'react';
import { Select, Tabs, Icon, Modal } from 'antd';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { connect } from 'dva';
import _ from 'lodash';
import { BaseContext } from '@/constants/global';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import { CSelect, CSpin, CMessage } from '@/components/common/BasicWidgets';
import { TRIGGER_EVENT_TYPE } from '@/constants/triggerState';
import { TRIGGER_ELEMENT_TYPE, BTN_ELEMENT_TYPE } from '@/constants/element';
import { insertTriggerEvent, delTriggerEvent } from '@/services/pageConfig';
import {
  getProcedureDetail,
  deleteProcedure,
  getHttpRequestTriggerDetail,
  getJsTriggerDetail,
} from '@/services/triggerEvent';
import { updateTriggerEvent } from '@/services/pageConfig';
import { getDefaultConfirmProps } from '@/utils/common';
import DomElementList from './DomElementList/DomElementList';
import DataElementList from './DataElementList/DataElementList';
import SqlElementList from './SqlElementList/SqlElementList';
import JsElementList from './JsElementList/JsElementList';
import HttpElementList from './HttpElementList/HttpElementList';
import AddElement from './AddElement/AddElement';
import styles from './EventElementList.less';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const { Option } = Select;
const { TabPane } = Tabs;

// 事件标识符
const EVENT_PREFIX = 'event_';
// 删除事件标识符
const DEL_EVENT_PREFIX = 'delEvent';
// 新增事件标识符
const ADD_ELEMENT_EVENT_PREFIX = 'addElementEvent';

// 点击次数
let clickNum = 0;

@connect(state => ({
  triggerState: state.triggerState,
}))
class EventElementList extends Component {
  static contextType = BaseContext;
  state = {
    // activeEventTabKey: '', // 当前触发器事件key
    visibleAddModal: false, // 新增控件弹窗
    // activeEventId: {}, // 当前事件id
    selectedElementList: [], // 选中的控件列表
    loadingStatus: { // 加载状态
      addEvent: false, // 新增事件中
      addElement: false, // 新增控件
      loadingProocedure: false, // 加载存储过程详情
      loadingJsFunction: false, // 加载js触发器详情
      // `delEvent${id}`: false, // 删除事件
      // `addElementEvent${id}`: false, // 新增控件事件
    },
  };

  componentWillUnmount() {
    clickNum = 0;
  }

  // 新增触发器事件
  handleAddEvent = (option) => {
    const { value, name } = option.props;
    const { fetchData, triggerState } = this.props;
    const { eventData, triggerEventConfig, triggerType } = triggerState;
    const { elementData = {} } = triggerEventConfig;
    // 相同事件需要加标识符
    const sameEventIndex = eventData ? eventData.filter(item => item.basetype === +value).length + 1 : 1;
    this.setLoadingStatus('addEvent', true);
    insertTriggerEvent({
      basetype: +value,
      name: `${name} - ${sameEventIndex}`,
      elementId: elementData.id,
      triggerType,
    }).then(res => {
      this.setLoadingStatus('addEvent', false);
      fetchData();
    }, err => this.setLoadingStatus('addEvent', false));
  };
  // 删除触发器事件
  handleDelEvent = (e, activeEventData) => {
    e.stopPropagation();
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(this.context.langLib),
      onOk: () => {
        const { langLib } = this.context;
        const { fetchData } = this.props;
        const { id, triggerType } = activeEventData;
        // 删除存储过程
        if (triggerType === 3) {
          this.handleDeleteProcedure(activeEventData);
          closeModal();
          return;
        }
        this.setLoadingStatus(`${DEL_EVENT_PREFIX}${id}`, true);
        delTriggerEvent({ id, triggerType }).then(res => {
          CMessage(langLib['message.del.success']);
          fetchData();
          closeModal();
          this.setLoadingStatus(`${DEL_EVENT_PREFIX}${id}`, false);
        }, err => this.setLoadingStatus(`${DEL_EVENT_PREFIX}${id}`, false));
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
    //     const { langLib } = this.context;
    //     const { fetchData } = this.props;
    //     const { id, triggerType } = activeEventData;
    //     // 删除存储过程
    //     if (triggerType === 3) {
    //       this.handleDeleteProcedure(activeEventData);
    //       return;
    //     }
    //     this.setLoadingStatus(`${DEL_EVENT_PREFIX}${id}`, true);
    //     delTriggerEvent({ id, triggerType }).then(res => {
    //       CMessage(langLib['message.del.success']);
    //       fetchData();
    //       this.setLoadingStatus(`${DEL_EVENT_PREFIX}${id}`, false);
    //     }, err => this.setLoadingStatus(`${DEL_EVENT_PREFIX}${id}`, false));
    //   },
    // });
  };
  // 删除存储过程
  handleDeleteProcedure = (activeEventData) => {
    const { langLib } = this.context;
    const { fetchData } = this.props;
    const { id: eventId } = activeEventData;
    const { procedureDetail } = this.props.triggerState;
    const { id } = procedureDetail;
    const _obj = activeEventData.triggerDtoList[0] || {};
    const params = {
      id,
      // triggerType: 3,
      eventId,
      triggersId: _obj.id,
    };
    this.setLoadingStatus(`${DEL_EVENT_PREFIX}${eventId}`, true);
    deleteProcedure(params).then(res => {
      CMessage(langLib['message.del.success']);
      fetchData();
      this.setLoadingStatus(`${DEL_EVENT_PREFIX}${eventId}`, false);
    }, err => this.setLoadingStatus(`${DEL_EVENT_PREFIX}${eventId}`, false));
  };
  // 点击事件的新增控件
  handleAddElement = (e, activeEvent) => {
    e.stopPropagation();
    const { triggerType, selectedElement, eventData, activeEventId } = this.props.triggerState;
    const eventId = activeEventId || activeEvent.id;
    // 前端触发器(选择控件)
    if (triggerType === 1) {
      this.context.dispatch({
        type: 'triggerState/updateState',
        payload: {
          activeEventId: eventId,
          selectedElement: [],
        },
      });
      this.setState({ visibleAddModal: true });
    } else if (triggerType === 2) { // 后端触发器（新增数据行）
      const newSelectedData = [...activeEvent.triggerDtoList];
      const activeEventData = eventData.find(item => item.id === eventId);
      newSelectedData.push({
        index: activeEventData.triggerDtoList.length + 1,
        applyToQuery: 0,
      });
      this.context.dispatch({
        type: 'triggerState/updateState',
        payload: {
          activeEventId: eventId,
          selectedElement: [{
            index: activeEventData.triggerDtoList.length + 1,
            applyToQuery: 0,
          }],
        },
      });
      setTimeout(() => {
        this.handleSaveAddElement(`${ADD_ELEMENT_EVENT_PREFIX}${eventId}`);
      }, 0);
    } else if (triggerType === 5) { // http触发器（新增数据行）
      const { httpRequestInfo } = this.props.triggerState;
      const { httpRequestInfoList = [] } = httpRequestInfo;
      this.context.dispatch({
        type: 'triggerState/updateState',
        payload: {
          httpRequestInfo: {
            ...httpRequestInfo,
            httpRequestInfoList: [
              ...httpRequestInfoList,
              { index: httpRequestInfoList.length + 1 },
            ],
          },
        },
      });
    }
  };
  // 点击事件名
  handleClickEventName = (item) => {
    clickNum++;
    const { triggerType, elementId, id: eventId, basetype } = item;
    if (triggerType === 3) { // 存储过程
      this.fetchSQLDetail(item);
    } else if (triggerType === 5) { // http触发器
      this.fetchHttpDetail(item);
    } else if (triggerType === 4) {
      this.fetchJsDetail(item);
    }
  };
  // 获取存储过程详情
  fetchSQLDetail = (item) => {
    const _obj = item.triggerDtoList[0] || {};
    const triggersId = _obj.id;
    // 没有保存过的触发器
    if (!triggersId) {
      this.context.dispatch({
        type: 'triggerState/updateState',
        payload: { procedureDetail: {} },
      });
      return;
    }
    ;
    this.setLoadingStatus('loadingProocedure', true);
    this.context.dispatch({
      type: 'triggerState/updateState',
      payload: { procedureDetail: {} },
    });
    getProcedureDetail({ triggersId }).then(procedureDetail => {
      this.setLoadingStatus('loadingProocedure', false);
      this.context.dispatch({
        type: 'triggerState/updateState',
        payload: { procedureDetail },
      });
    }, err => this.setLoadingStatus('loadingProocedure', false));
  };
  // 获取http触发器详情
  fetchHttpDetail = (item) => {
    const { triggerType, elementId, id: eventId, basetype } = item;
    const { httpRequestInfo } = this.props.triggerState;
    const _obj = item.triggerDtoList[0] || {};
    const triggersId = _obj.id;
    // 没有保存过的触发器
    if (!triggersId) {
      // const isBeforeTrigger = triggersId === httpRequestInfo.triggersId;
      this.context.dispatch({
        type: 'triggerState/updateState',
        payload: {
          httpRequestInfo: {
            // triggersId: isBeforeTrigger ? httpRequestInfo.triggersId : '',
            elementId,
            triggerType,
            eventBaseType: basetype,
            eventId,
            // httpRequestInfoList: isBeforeTrigger ? httpRequestInfo.httpRequestInfoList : [],
            httpRequestInfoList: [],
          },
        },
      });
      return;
    }
    ;
    this.setLoadingStatus('loadingProocedure', true);
    getHttpRequestTriggerDetail({ triggersId }).then(httpRequestInfo => {
      this.setLoadingStatus('loadingProocedure', false);
      this.context.dispatch({
        type: 'triggerState/updateState',
        payload: {
          httpRequestInfo: {
            ...httpRequestInfo,
            triggersId,
            elementId,
            triggerType,
            eventBaseType: basetype,
            eventId,
            httpRequestInfoList: httpRequestInfo.httpRequestInfoList || [],
          },
        },
      });
    }, err => this.setLoadingStatus('loadingProocedure', false));
  };
  // 获取js触发器详情
  fetchJsDetail = (item) => {
    const { triggerType, elementId, id: eventId, basetype } = item;
    const _obj = item.triggerDtoList[0] || {};
    const triggersId = _obj.id;
    // 没有保存过的触发器
    if (!triggersId) {
      this.context.dispatch({
        type: 'triggerState/updateState',
        payload: {
          jsFunctionInfo: {
            elementId,
            triggerType,
            eventBaseType: basetype,
            eventId,
            jsFunctionList: [],
          },
        },
      });
      return;
    }
    this.setLoadingStatus('loadingJsFunction', true);
    getJsTriggerDetail({ triggersId }).then(res => {
      this.setLoadingStatus('loadingJsFunction', false);
      const { jsFunctionInfo } = this.props.triggerState;
      this.context.dispatch({
        type: 'triggerState/updateState',
        payload: {
          jsFunctionInfo: {
            ...jsFunctionInfo,
            triggersId,
            elementId,
            triggerType,
            eventBaseType: basetype,
            eventId,
            jsFunctionList: res || [],
          },
        },
      });
    }, err => this.setLoadingStatus('loadingJsFunction', false));
  };
  // 保存选择的控件
  handleSaveAddElement = (loadingType = 'addElement') => {
    const { eventData, selectedElement, activeEventId } = this.props.triggerState;
    const newList = _.cloneDeep(eventData);
    newList[0].triggerDtoList = selectedElement;
    this.setLoadingStatus(loadingType, true);
    updateTriggerEvent({ triggerEventPramDtoList: newList }).then(res => {
      this.setLoadingStatus(loadingType, false);
      this.setState({ visibleAddModal: false });
      const { triggerEventPramDtoList = [] } = res;
      const newEles = triggerEventPramDtoList[0].triggerDtoList;
      const newEventData = _.cloneDeep(eventData);
      newEventData.find(item => item.id === activeEventId).triggerDtoList.push(...newEles);
      this.context.dispatch({
        type: 'triggerState/updateState',
        payload: {
          eventData: newEventData,
        },
      });
    }, err => this.setLoadingStatus(loadingType, false));
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
  setListState = itemObj => {
    this.setState(itemObj);
  };
  // 更新当前触发器id
  setActiveEventId = (activeEventTabKey) => {
    // this.setState({ activeEventTabKey });
    const activeEventId = +(activeEventTabKey.split(EVENT_PREFIX)[1]);
    this.context.dispatch({
      type: 'triggerState/updateState',
      payload: {
        activeEventId,
      },
    });
  };
  // 已建的事件列表
  getEventList = () => {
    const { loadingStatus } = this.state;
    const { triggerState, fetchData } = this.props;
    const { eventData, triggerType } = triggerState;
    return eventData && eventData.map(item => {
      const showAdddIconType = [1, 2, 5];
      const isShowAddIcon = showAdddIconType.includes(item.triggerType);
      const renderAddIcon = () => {
        return loadingStatus[`${ADD_ELEMENT_EVENT_PREFIX}${item.id}`] ? <Icon type="loading"/> : (
          <i
            className="iconfont icon-add-border"
            onClick={(e) => this.handleAddElement(e, item)}
          />
        );
      };
      // 事件名
      const tabTit = (
        <div className={styles.tabTit} onClick={() => this.handleClickEventName(item)}>
          <span className={styles.name} title={item.name}>{item.name}</span>
          <div className={styles.iconBox}>
            {isShowAddIcon && renderAddIcon()}
            {loadingStatus[`${DEL_EVENT_PREFIX}${item.id}`] ? <Icon type="loading"/> :
              <i className="iconfont icon-del" onClick={(e) => this.handleDelEvent(e, item)}/>}
          </div>
        </div>
      );
      // 表格组件
      const renderTable = () => {
        const publicProps = {
          key: `${EVENT_PREFIX}${item.id}`,
          // key: new Date().getTime(),
          activeEventData: item,
          fetchData,
        };
        switch (triggerType) {
          case 1:
            return <DomElementList {...publicProps} />;
          case 2:
            return <DataElementList {...publicProps} />;
          case 3:
            return (
              <CSpin spinning={loadingStatus.loadingProocedure}>
                <SqlElementList {...publicProps} />
              </CSpin>
            );
          case 4:
            return (
              <CSpin spinning={loadingStatus.loadingJsFunction}>
                <JsElementList {...publicProps} />
              </CSpin>
            );
          case 5:
            return <HttpElementList {...publicProps} />;
          default:
            return null;
        }
      };
      return (
        <TabPane tab={tabTit} key={`${EVENT_PREFIX}${item.id}`}>
          {renderTable()}
        </TabPane>
      );
    });
  };
  // 事件类型下拉项(下拉框对应事件【数据变化】，数据选择框对应事件【赋值】，按钮对应事件【点击】)
  // 获取控件类型对应的触发器事件
  getEventType = () => {
    const { langLib } = this.context;
    const { triggerState, loading, fetchData } = this.props;
    const { eventData, triggerType, triggerEventConfig, activeEventId } = triggerState;
    const { elementData = {} } = triggerEventConfig;
    const { basetype } = elementData;
    const eventList = []; // 前端触发器有【加载】
    if (triggerType === 4) { // 【js触发器】
      if (TRIGGER_ELEMENT_TYPE.calculateProps.includes(basetype)) {
        eventList.push(5);
      }
    } else {
      if (TRIGGER_ELEMENT_TYPE.dataChange.includes(basetype)) { // 下拉框=【数据变化】
        eventList.push(2);
        triggerType === 1 && eventList.push(4); // 加载
      } else if (TRIGGER_ELEMENT_TYPE.assignValue.includes(basetype)) { // 选择框/扫描选择框/扫描=【赋值】
        eventList.push(3);
        triggerType === 1 && eventList.push(4); // 加载
      } else if (TRIGGER_ELEMENT_TYPE.click.includes(basetype)) { // 按钮=【点击】
        eventList.push(1);
        triggerType === 1 && eventList.push(4); // 加载
      }
    }
    return eventList.map(item => <Option key={`eventType_${item}`} value={item}
                                         name={langLib[TRIGGER_EVENT_TYPE[item]]}>{langLib[TRIGGER_EVENT_TYPE[item]]}</Option>);
  };

  render() {
    const { langLib } = this.context;
    const { loadingStatus, visibleAddModal } = this.state;
    const { triggerState, loading, loadingAdd } = this.props;
    const { eventData, triggerType, activeEventId, triggerEventConfig } = triggerState;
    const { elementData = {} } = triggerEventConfig;
    const { basetype } = elementData;
    const wrapCls = classNames({
      [styles.wrap]: true,
      'custom-triggerEvent': true,
    });
    const showSelectTypes = [1, 2, 3, 4, 5];
    const activeEventTabKey = `${EVENT_PREFIX}${activeEventId}`;
    const isBtnShowHttp = triggerType === 5 && BTN_ELEMENT_TYPE.includes(basetype);
    return (
      <div className={wrapCls}>
        {(showSelectTypes.includes(triggerType) || isBtnShowHttp) && <div className={styles.select}>
          <CSpin spinning={loadingStatus.addEvent || loading}>
            <CSelect
              value={langLib['triggerEvent.placeholder']}
              placeholder={langLib['triggerEvent.event.placeholder']}
              onSelect={(val, option) => this.handleAddEvent(option)}
            >
              {this.getEventType()}
            </CSelect>
          </CSpin>
        </div>}
        {(eventData && eventData.length) ? (
          <CSpin spinning={loading || loadingStatus.loadingProocedure}>
            <Tabs
              activeKey={activeEventTabKey}
              tabPosition="left"
              className={`${styles.tabs} custom-vertical-tab`}
              onChange={activeTabKey => this.setActiveEventId(activeTabKey)}
            >
              {this.getEventList()}
            </Tabs>
          </CSpin>
        ) : null}
        <CreateModal
          title={<FormattedMessage id="connect.element"/>}
          visible={visibleAddModal}
          onCancel={() => this.setState({ visibleAddModal: false })}
          onOk={() => this.handleSaveAddElement('addElement')}
          className={styles.addModal}
          confirmLoading={loadingStatus.addElement}
        >
          <AddElement/>
        </CreateModal>
      </div>
    );
  }
}

export default EventElementList;
