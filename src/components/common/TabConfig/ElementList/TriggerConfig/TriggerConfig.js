/*
 * @Author: Fus
 * @Date:   2019-08-28 09:56:36
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-03-18 09:59:37
 * @Desc: 触发器配置
 */
import { Component } from 'react';
import { connect } from 'dva';
import { FormattedMessage } from 'react-intl';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import TriggerEvent from './TriggerEvent/TriggerEvent';
import { BaseContext } from '@/constants/global';
import { CMessage } from '@/components/common/BasicWidgets';
import { updateTriggerEvent } from '@/services/pageConfig';
import { insertOrUpdateProcedure, insertOrUpdateHttpTrigger, insertOrUpdateJsTrigger } from '@/services/triggerEvent';
import { getTriggerEventData } from '@/services/pageConfig';
import styles from './TriggerConfig.less';

@connect(state => ({
  triggerState: state.triggerState,
}))
class TriggerConfig extends Component {
  static contextType = BaseContext
  static defaultProps = {
    entry: null, // 入口组件
    selectConfig: { // 选择节点配置
      isMulti: true,
      rowKey: 'relationElementId',
    },
  }
  state = {
    visible: false, // 配置弹框是否新鲜事
    loadingSave: false, // 保存按钮loading状态
    loadingAdd: false, // 新增控件按钮loading状态
  }
  // 获取触发器内容
  fetchData = () => {
    const { triggerEventConfig = {}, activeEventId: beforeId, triggerType } = this.props.triggerState;
    const { elementData = {} } = triggerEventConfig;
    const reqParam = {
      elementId: elementData.id,
      triggerType,
    };
    this.setLoadingStatus('list', true);
    getTriggerEventData(reqParam).then(eventData => {
      const activeEventId = eventData.filter(item => item.id === beforeId).length ? beforeId : (eventData[0] && eventData[0].id || -1);
      this.context.dispatch({
        type: 'triggerState/updateState',
        payload: {
          eventData,
          // activeEventId: 0, // 因后台触发和http触发需要点击事件后单独获取详情，故不设默认选中
        },
      });
      this.setLoadingStatus('list', false);
    }, err => this.setLoadingStatus('list', false));
  }
  // 打开配置触发器入口
  handleOpenModal = () => {
    const { readOnly, elementData, tabInfo, doSaveFrameTab, selectConfig, tabElementList } = this.props;
    if (readOnly) return;
    this.setState({ visible: true });
    this.context.dispatch({
      type: 'triggerState/updateState',
      payload: {
        selectConfig,
        triggerEventConfig: {
          elementData, tabInfo, doSaveFrameTab,
        },
        tabElementList: tabElementList.map((item, index) => ({
          ...item,
          id: null,
          index: index + 1,
          relationElementDisplayName: item.displayName,
          relationElementId: item.id,
          relationElementRequisite: item.requisite,
          relationElementReadonly: item.readonly,
          relationElementVisible: item.visiabled,
        })),
      },
    });
  }
  // 保存触发器
  handleSaveTrigger = ({
    needReFetch = false,
    callback = null,
    loadingType = 'loadingSave',
  }) => {
    const { langLib } = this.context;
    const { eventData, triggerType } = this.props.triggerState;
    // 保存存储过程
    if (triggerType === 3) {
      this.doSaveSql();
      return;
    } else if (triggerType === 4) { // js触发器
      this.doSaveJs();
      return;
    } else if (triggerType === 5) {
      // 保存http触发器
      this.doSaveHttp();
      return;
    }
    this.setState({ [loadingType]: true });
    updateTriggerEvent({ triggerEventPramDtoList: eventData }).then(res => {
      loadingType === 'loadingSave' && CMessage(langLib['message.save.success']);
      this.setState({ [loadingType]: false });
      needReFetch && this.fetchData();
      callback && callback(res);
    }, err => this.setState({ [loadingType]: false }));
  }
  // 保存存储过程触发器
  doSaveSql = () => {
    const { langLib } = this.context;
    const { procedureDetail } = this.props.triggerState;
    this.setState({ loadingSave: true });
    insertOrUpdateProcedure({ ...procedureDetail }).then(res => {
      CMessage(langLib['message.save.success']);
      this.setState({ loadingSave: false });
      this.fetchData();
      this.context.dispatch({
        type: 'triggerState/updateState',
        payload: {
          procedureDetail: {
            ...procedureDetail,
            ...res,
          },
        },
      });
    }, err => this.setState({ loadingSave: false }));
  }
  // 保存http触发器
  doSaveHttp = () => {
    const { langLib } = this.context;
    const { httpRequestInfo } = this.props.triggerState;
    this.setState({ loadingSave: true });
    insertOrUpdateHttpTrigger(httpRequestInfo).then(res => {
      CMessage(langLib['message.save.success']);
      this.setState({ loadingSave: false });
      this.fetchData();
      const { triggersId } = res[0] || {};
      this.context.dispatch({
        type: 'triggerState/updateState',
        payload: {
          httpRequestInfo: {
            ...httpRequestInfo,
            triggersId,
          },
        },
      });
    }, err => this.setState({ loadingSave: false }));
  }
  // js触发器
  doSaveJs = () => {
    const { langLib } = this.context;
    const { jsFunctionInfo } = this.props.triggerState;
    this.setState({ loadingSave: true });
    insertOrUpdateJsTrigger(jsFunctionInfo).then(res => {
      CMessage(langLib['message.save.success']);
      this.setState({ loadingSave: false });
    }, err => this.setState({ loadingSave: false }));
  }
  handleCancel = () => {
    this.setState({
      visible: false,
    });
    this.context.dispatch({
      type: 'triggerState/clearState',
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
  }
  render() {
    const { visible, loadingSave, loadingAdd } = this.state;
    const { tabElementList } = this.props;
    const modalProps = {
      visible,
      onOk: () => this.handleSaveTrigger({ needReFetch: true }),
      onCancel: this.handleCancel,
      title: <FormattedMessage id="connect.triggerEvent" />,
      confirmLoading: loadingSave,
      className: styles.triggerEventModal,
      size: 'large',
    };
    return (
      <div className={styles.wrap}>
        <div onClick={this.handleOpenModal}>
          {this.props.children}
        </div>
        <CreateModal {...modalProps}>
          <TriggerEvent
            tabElementList={tabElementList}
            handleSaveTrigger={(callback) => this.handleSaveTrigger({
              needReFetch: false,
              callback,
              loadingType: 'loadingAdd',
            })}
            fetchData={this.fetchData}
            loadingAdd={loadingAdd}
          />
        </CreateModal>
      </div>
    );
  }
}
export default TriggerConfig;
