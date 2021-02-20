/*
 * @Author: Fus
 * @Date:   2019-08-15 13:49:53
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-04-26 16:36:10
 * @Desc: 受控元素列表
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import copy from 'copy-to-clipboard';
import { BaseContext } from '@/constants/global';
import { Form, Checkbox, Select, Col, Row, Icon, Modal, Tooltip } from 'antd';
import { CTable, CInput, CTextArea, CSelect, CMessage, CInputNumber } from '@/components/common/BasicWidgets';
import { delTrigger } from '@/services/pageConfig';
import { TRIGGER_CONDITION, CUSTOM_FUNCTION_TYPE, JSON_TEMPLATE } from '@/constants/triggerState';
import { getDefaultConfirmProps } from '@/utils/common';
import styles from './DomElementList.less';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const { Option } = Select;

// 匹配条件
const condOptions = Object.keys(TRIGGER_CONDITION).map(item => <Option key={`condType-${item}`}
                                                                       value={+item}>{+item === 9 ?
  <FormattedMessage id={TRIGGER_CONDITION[item]}/> : TRIGGER_CONDITION[item]}</Option>);

// 自定义方法类型
const customFuncTypeOptions = Object.keys(CUSTOM_FUNCTION_TYPE).map(item => <Option key={`customFuncType-${item}`}
                                                                                    value={+item}>{CUSTOM_FUNCTION_TYPE[item]}</Option>);

@connect(state => ({
  triggerState: state.triggerState,
}))
class DomElementList extends Component {
  static contextType = BaseContext;
  state = {};
  // 更新触发器事件内元素属性
  setElementData = ({ key, value, index, subKey = '', subValue = '' }) => {
    const { eventData, activeEventId } = this.props.triggerState;
    const activeEventIndex = eventData.findIndex(item => item.id === activeEventId);
    const eventElement = eventData[activeEventIndex].triggerDtoList || [];
    const newEventElement = [...eventElement];
    const data = {
      ...newEventElement[index],
      [key]: value,
    };
    if (subKey) data[subKey] = subValue;
    newEventElement.splice(index, 1, data);
    const newEventData = [...eventData];
    newEventData.splice(activeEventIndex, 1, {
      ...eventData[activeEventIndex],
      triggerDtoList: newEventElement,
    });
    this.context.dispatch({
      type: 'triggerState/updateState',
      payload: { eventData: newEventData },
    });
  };

  // 修改必填校验
  handleChangeRequired = (checked, record, index) => {
    this.setElementData({
      key: 'relationElementRequisite',
      value: +checked,
      subKey: 'relationElementVisible',
      subValue: checked ? 1 : record.relationElementVisible,
      index,
    });
  };
  // 修改可见状态
  handleChangeVisible = (checked, record, index) => {
    this.setElementData({
      key: 'relationElementVisible',
      value: +checked,
      subKey: 'relationElementRequisite',
      subValue: !checked ? 0 : record.relationElementRequisite,
      index,
    });
  };

  // 更新触发器层属性
  setEventData = (key, val) => {
    const { eventData, activeEventId } = this.props.triggerState;
    const activeEventIndex = eventData.findIndex(item => item.id === activeEventId);
    const newEventData = [...eventData];
    newEventData.splice(activeEventIndex, 1, {
      ...eventData[activeEventIndex],
      [key]: val,
    });
    this.context.dispatch({
      type: 'triggerState/updateState',
      payload: { eventData: newEventData },
    });
  };
  // 删除数据行
  handleDel = (record, index) => {
    const removeData = () => {
      const { eventData, activeEventId } = this.props.triggerState;
      const activeEventIndex = eventData.findIndex(item => item.id === activeEventId);
      const newDataSource = [...eventData[activeEventIndex].triggerDtoList];
      newDataSource.splice(index, 1);
      const newEventData = [...eventData];
      newEventData.splice(activeEventIndex, 1, {
        ...eventData[activeEventIndex],
        triggerDtoList: newDataSource,
      });
      this.context.dispatch({
        type: 'triggerState/updateState',
        payload: { eventData: newEventData },
      });
    };
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(this.context.langLib),
      onOk: () => {
        const { id } = record;
        const { langLib } = this.context;
        // 已保存的控件需要走删除接口
        if (id) {
          delTrigger({ id }).then(res => {
            CMessage(langLib['message.del.success']);
            // this.props.fetchData();
            removeData();
            closeModal();
          });
        } else { // 未保存的控件删除直接前端删除
          removeData();
          closeModal();
        }
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
    //     const { id } = record;
    //     const { langLib } = this.context;
    //     // 已保存的控件需要走删除接口
    //     if (id) {
    //       return delTrigger({ id }).then(res => {
    //         CMessage(langLib['message.del.success']);
    //         // this.props.fetchData();
    //         removeData();
    //       });
    //     } else { // 未保存的控件删除直接前端删除
    //       removeData();
    //     }
    //   },
    // });
  };
  // 生成列名
  getColumns = () => {
    const { triggerEventConfig = {}, tabElementList = [] } = this.props.triggerState;
    return [
      {
        title: <FormattedMessage id="global.index"/>,
        dataIndex: 'index',
        width: 60,
        render: (text, record, index) => index + 1,
      }, {
        title: <FormattedMessage id="pageConfig.col.showName"/>,
        dataIndex: 'relationElementDisplayName',
        width: 200,
        render: (text, record) => {
          const matchEle = tabElementList.find(item => item.relationElementId === record.relationElementId) || {};
          return <span>{text || matchEle.displayName || ''}</span>;
        },
      }, {
        title: <FormattedMessage id="global.required"/>,
        dataIndex: 'relationElementRequisite',
        width: 60,
        render: (text, record, index) => (
          <Checkbox
            checked={!!text}
            onChange={e => this.handleChangeRequired(+e.target.checked, record, index)}
          />
        ),
      }, {
        title: <FormattedMessage id="global.readOnly"/>,
        dataIndex: 'relationElementReadonly',
        width: 60,
        render: (text, record, index) => (
          <Checkbox
            checked={!!text}
            onChange={e => this.setElementData({
              key: 'relationElementReadonly',
              value: +e.target.checked,
              index,
            })}
          />
        ),
      }, {
        title: <FormattedMessage id="global.visible"/>,
        dataIndex: 'relationElementVisible',
        width: 60,
        render: (text, record, index) => (
          <Checkbox
            checked={!!text}
            onChange={e => this.handleChangeVisible(e.target.checked, record, index)}
          />
        ),
      }, {
        title: <FormattedMessage id="triggerEvent.col.setValue"/>,
        dataIndex: 'relationElementValue',
        width: 300,
        render: (text, record, index) => (
          <CInput
            defaultValue={text}
            // style={{ width: 'calc(100% - 30px)', marginLeft: 10 }}
            onBlur={e => this.setElementData({
              key: 'relationElementValue',
              value: e.target.value,
              index,
            })}
          />
        ),
      }, {
        title: <FormattedMessage id="triggerEvent.col.reGet"/>,
        dataIndex: 'canModifyValue',
        width: 110,
        render: (text, record, index) => (
          <Checkbox
            checked={!!text}
            onChange={e => this.setElementData({
              key: 'canModifyValue',
              value: +e.target.checked,
              index,
            })}
          />
        ),
      }, {
        title: <FormattedMessage id="global.operator"/>,
        dataIndex: 'operator',
        width: 80,
        render: (text, record, index) => <span className="iconfont icon-del custom-color"
                                               onClick={() => this.handleDel(record, index)}/>,
      },
    ];
  };
  // 复制模板
  handleCopyTemplate = () => {
    const { langLib } = this.context;
    if (copy(JSON_TEMPLATE)) {
      CMessage(langLib['message.copy.success']);
    } else {
      CMessage(langLib['message.copy.error']);
    }
  };
  // 匹配条件为自定义方法时
  renderCustomFuntion = () => {
    const { triggerState } = this.props;
    const { activeEventId, eventData } = triggerState;
    const activeEventData = eventData.find(item => item.id === activeEventId) || {};
    return (
      <Fragment>
        <Col span={4} className={styles.valueRow}>
          <Form.Item label={<FormattedMessage id="triggerEvent.functionType"/>}>
            <CSelect
              defaultValue={activeEventData.methodType}
              onChange={val => this.setEventData('methodType', val)}
              key={`${activeEventData.id}_methodType`}
            >
              <Option value={null}><FormattedMessage id="global.null"/></Option>
              {customFuncTypeOptions}
            </CSelect>
          </Form.Item>
        </Col>
        <Col span={10} className={styles.valueRow}>
          <Form.Item label={(
            <Fragment>
              <Tooltip
                title={(
                  <Fragment>
                    <FormattedMessage id="global.template"/>
                    <span className={styles.copyEntry} onClick={this.handleCopyTemplate}>
                      <FormattedMessage id="global.clickToCopy"/>
                    </span>
                    {JSON_TEMPLATE}
                  </Fragment>
                )}
              >
                <div className={styles.tipTri}>
                  <FormattedMessage id="triggerEvent.endTriggerNum"/>
                  <Icon type="question-circle" style={{ marginLeft: 5 }}/>
                </div>
              </Tooltip>
            </Fragment>
          )}
          >
            <CTextArea
              defaultValue={activeEventData.endTriggerNum}
              onBlur={e => this.setEventData('endTriggerNum', e.target.value)}
              key={`${activeEventData.id}_endTriggerNum`}
            />
          </Form.Item>
        </Col>
      </Fragment>
    );
  };

  render() {
    const { triggerState } = this.props;
    const { activeEventId, eventData, triggerEventConfig = {} } = triggerState;
    const { elementData = {} } = triggerEventConfig;
    const { getFieldDecorator } = this.props.form;
    const activeEventData = eventData.find(item => item.id === activeEventId) || {};
    const { triggerDtoList = [], basetype } = activeEventData;
    return (
      <Fragment>
        <Row>
          {!!elementData.triggerSign && <Col span={4} className={styles.valueRow}>
            <Form.Item label={<FormattedMessage id="triggerEvent.executionOrder"/>}>
              <CInputNumber
                defaultValue={activeEventData.basepriority}
                onBlur={e => this.setEventData('basepriority', e.target.value)}
              />
            </Form.Item>
          </Col>}
          <Col span={5} className={styles.valueRow}>
            <Form.Item label={<FormattedMessage id="triggerEvent.cond"/>}>
              <CSelect
                defaultValue={activeEventData.conditionType}
                onChange={val => this.setEventData('conditionType', val)}
              >
                <Option value={0}><FormattedMessage id="global.null"/></Option>
                {condOptions}
              </CSelect>
            </Form.Item>
          </Col>
          {activeEventData.conditionType === 9 ? this.renderCustomFuntion() : (
            <Col span={8} className={styles.valueRow}>
              <Form.Item label={<FormattedMessage id="triggerEvent.endTriggerNum"/>}>
                <CInput
                  key={`${activeEventData.id}_endTriggerNum`}
                  defaultValue={activeEventData.endTriggerNum}
                  className={styles.input}
                  onBlur={e => this.setEventData('endTriggerNum', e.target.value)}
                />
              </Form.Item>
            </Col>
          )}
        </Row>
        <div className={styles.table}>
          <CTable
            columns={this.getColumns()}
            dataSource={triggerDtoList}
            pagination={false}
            rowKey="id"
          />
        </div>
      </Fragment>
    );
  }
}

export default Form.create()(DomElementList);
