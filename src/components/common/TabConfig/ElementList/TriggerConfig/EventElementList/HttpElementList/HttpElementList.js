/*
 * @Author: Fus
 * @Date:   2019-08-15 13:49:53
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-05 11:55:28
 * @Desc: 受控元素列表
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { BaseContext } from '@/constants/global';
import { Form, Checkbox, Select, Col, Row, Icon, Modal } from 'antd';
import { CTable, CInput, CSelect, CMessage, CButton } from '@/components/common/BasicWidgets';
import { delTrigger } from '@/services/pageConfig';
import { TRIGGER_CONDITION, QUERY_METHOD_TYPES } from '@/constants/triggerState';
import { getDefaultConfirmProps } from '@/utils/common';
import styles from './HttpElementList.less';

const { Option } = Select;

// 匹配条件
const condOptions = Object.keys(TRIGGER_CONDITION).map(item => <Option key={`condType-${item}`} value={+item}>{TRIGGER_CONDITION[item]}</Option>);

// 请求方式下拉数据
const queryMethodOptions = Object.keys(QUERY_METHOD_TYPES).map(item => <Option key={`queryMethod-${item}`} value={+item}>{QUERY_METHOD_TYPES[item]}</Option>);

@connect(state => ({
  triggerState: state.triggerState,
}))
class HttpElementList extends Component {
  static contextType = BaseContext
  state = {
  }
  // 更新触发器事件内元素属性
  setElementData = ({ key, value, index, subKey = '', subValue = '' }) => {
    const { httpRequestInfo = {} } = this.props.triggerState;
    const { httpRequestInfoList = [] } = httpRequestInfo;
    const newList = [...httpRequestInfoList];
    newList.splice(index, 1, {
      ...httpRequestInfoList[index],
      [key]: value,
    });
    this.context.dispatch({
      type: 'triggerState/updateState',
      payload: {
        httpRequestInfo: {
          ...httpRequestInfo,
          httpRequestInfoList: newList,
        },
      },
    });
  }
  // 更新触发器层属性
  setEventData = (key, val) => {
    const { httpRequestInfo } = this.props.triggerState;
    this.context.dispatch({
      type: 'triggerState/updateState',
      payload: { httpRequestInfo: {
        ...httpRequestInfo,
        [key]: val,
      } },
    });
  }
  // 删除数据行
  handleDel = (record, index) => {
    const { httpRequestInfo = {} } = this.props.triggerState;
    const { httpRequestInfoList = [] } = httpRequestInfo;
    const newList = [...httpRequestInfoList];
    newList.splice(index, 1);
    this.context.dispatch({
      type: 'triggerState/updateState',
      payload: {
        httpRequestInfo: {
          ...httpRequestInfo,
          httpRequestInfoList: newList,
        },
      },
    });
  }
  // 新增数据行
  handleAddData = () => {
    const { eventData, activeEventId } = this.props.triggerState;
    const activeEventIndex = eventData.findIndex(item => item.id === activeEventId);
    const { triggerDtoList = [] } = eventData[activeEventIndex] || {};
    const newEventData = [...eventData];
    newEventData.splice(activeEventIndex, 1, {
      ...eventData[activeEventIndex],
      triggerDtoList: [
        ...triggerDtoList,
        { index: 1 },
      ],
    });
    this.context.dispatch({
      type: 'triggerState/updateState',
      payload: { eventData: newEventData },
    });
  }
  // 生成列名
  getColumns = () => {
    const { triggerEventConfig = {}, tabElementList = [] } = this.props.triggerState;
    return [
      {
        title: <FormattedMessage id="global.index"/>,
        dataIndex: 'index',
        width: 100,
        render: (text, record, index) => index + 1,
      }, {
        title: <FormattedMessage id="triggerEvent.col.param"/>,
        dataIndex: 'param',
        render: (text, record, index) => {
          return (
            <CInput
              value={text}
              onChange={e => this.setElementData({
                key: 'param',
                value: e.target.value,
                index,
              })}
            />
          );
        },
      }, {
        title: <FormattedMessage id="global.value"/>,
        dataIndex: 'paramValue',
        render: (text, record, index) => {
          return (
            <CInput
              value={text}
              onChange={e => this.setElementData({
                key: 'paramValue',
                value: e.target.value,
                index,
              })}
            />
          );
        },
      }, {
        title: <FormattedMessage id="global.operator"/>,
        dataIndex: 'operator',
        width: 80,
        render: (text, record, index) => <span className="iconfont icon-del custom-color" onClick={() => this.handleDel(record, index)} />,
      },
    ];
  }
  render() {
    const { triggerState } = this.props;
    const { activeEventId, eventData, httpRequestInfo } = triggerState;
    const { getFieldDecorator } = this.props.form;
    return (
      <Fragment>
        <Row>
          <Col span={8} className={styles.valueRow}>
            <Form.Item label={<FormattedMessage id="triggerEvent.queryMethod" />}>
              {getFieldDecorator('requestMode', {
                initialValue: httpRequestInfo.requestMode,
              })(
                <CSelect
                  onChange={val => this.setEventData('requestMode', val)}
                >
                  {queryMethodOptions}
                </CSelect>
              )}
            </Form.Item>
          </Col>
          <Col span={16} className={styles.valueRow}>
            <Form.Item label={<FormattedMessage id="triggerEvent.url" />}>
              {getFieldDecorator('url', {
                initialValue: httpRequestInfo.url,
              })(
                <CInput className={styles.input} onChange={e => this.setEventData('url', e.target.value)} />
              )}
            </Form.Item>
          </Col>
          {/* <CButton className={styles.addBtn} onClick={this.handleAddData}>
            <i className="iconfont custom-color icon-add-border" />
            <FormattedMessage id="global.add" />
          </CButton> */}
        </Row>
        <div className={styles.table}>
          <CTable
            columns={this.getColumns()}
            dataSource={httpRequestInfo.httpRequestInfoList || []}
            pagination={false}
            rowKey="relationElementId"
          />
        </div>
      </Fragment>
    );
  }
}
export default Form.create()(HttpElementList);