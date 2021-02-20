/*
 * @Author: Fus
 * @Date:   2019-08-15 13:49:53
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-17 12:01:38
 * @Desc: 受控元素列表
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { BaseContext } from '@/constants/global';
import { Form, Checkbox, Select, Col, Row, Icon, Modal } from 'antd';
import { TRIGGER_VALUE_TYPE, DATA_TRIGGER_TYPE, METHOD_TYPE } from '@/constants/triggerState';
import { CTable, CInput, CSelect, CMessage, SearchSelect } from '@/components/common/BasicWidgets';
import { getDefaultConfirmProps } from '@/utils/common';
import { delTrigger } from '@/services/pageConfig';
import { jsFunctions, JS_FUNCTION_MAP } from '@/constants/jsTriggerFunctions';
import styles from './JsElementList.less';

const { Option } = Select;
// 下拉选项
const valueTypeOption = Object.keys(TRIGGER_VALUE_TYPE).map(item => <Option key={`colSpan-${item}`} value={+item}><FormattedMessage id={TRIGGER_VALUE_TYPE[item]} /></Option>);

@connect(state => ({
  triggerState: state.triggerState,
}))
class JsElementList extends Component {
  static contextType = BaseContext
  state = {
  }
  // 更新触发器事件内元素属性
  setElementData = (key, val, index) => {
    const { jsFunctionInfo, activeEventId } = this.props.triggerState;
    const jsFunctionList = jsFunctionInfo.jsFunctionList || [];
    const newList = [...jsFunctionList];
    newList.splice(index, 1, {
      ...newList[index],
      [key]: val,
    });
    this.context.dispatch({
      type: 'triggerState/updateState',
      payload: {
        jsFunctionInfo: {
          ...jsFunctionInfo,
          jsFunctionList: newList,
        },
      },
    });
  }

  // 更新函数类型
  setFunctionType = (val, option) => {
    const { jsFunctionInfo } = this.props.triggerState;
    const { dataObj } = option.props;
    let jsFunctionList = [];
    if (dataObj) {
      const { params } = dataObj;
      jsFunctionList = params.map((item, i) => ({
        sno: i + 1,
        triggersId: jsFunctionInfo.triggersId,
        valueType: '',
        functionType: val,
        param: item.paramName,
        paramValue: '',
      }));
    }
    this.context.dispatch({
      type: 'triggerState/updateState',
      payload: {
        jsFunctionInfo: {
          ...jsFunctionInfo,
          jsFunctionList,
        },
      },
    });
  }
  // 生成列名
  getColumns = () => {
    const { triggerState } = this.props;
    const { activeEventId, eventData } = triggerState;
    const { getFieldDecorator } = this.props.form;
    const activeEventData = eventData.find(item => item.id === activeEventId) || {};
    const { jsFunctionList = [] } = activeEventData;
    return [
      {
        title: <FormattedMessage id="global.index"/>,
        dataIndex: 'index',
        width: 100,
        render: (text, record, index) => index + 1,
      }, {
        title: <FormattedMessage id="triggerEvent.col.param"/>,
        dataIndex: 'param',
        // width: 200,
      }, {
        title: <FormattedMessage id="triggerEvent.col.paramDesc"/>,
        dataIndex: 'paramDesc',
        // width: 200,
        render: (text, record, index) => (
          record.param && <FormattedMessage id={`jsFunction.paramDesc.${JS_FUNCTION_MAP[record.functionType].key}.${record.param}`} />
        ),
      }, {
        title: <FormattedMessage id="triggerEvent.col.valueType"/>,
        dataIndex: 'valueType',
        // width: 120,
        render: (text, record, index) => (
          <CSelect
            value={text}
            style={{ width: '100%' }}
            onChange={val => this.setElementData('valueType', +val, index)}
          >
            {valueTypeOption}
          </CSelect>
        ),
      }, {
        title: <FormattedMessage id="global.value"/>,
        dataIndex: 'paramValue',
        render: (text, record, index) => (
          <CInput
            value={text}
            onChange={e => this.setElementData('paramValue', e.target.value, index)}
          />
        ),
      },
    ];
  }
  render() {
    const { triggerState } = this.props;
    const { jsFunctionInfo } = triggerState;
    const { getFieldDecorator } = this.props.form;
    const { jsFunctionList = [] } = jsFunctionInfo;
    const jsFunctionOptions = Object.keys(JS_FUNCTION_MAP).map(item => <Option key={item} value={+item} dataObj={JS_FUNCTION_MAP[item]}><FormattedMessage id={`jsFunction.${JS_FUNCTION_MAP[item].key}`} /></Option>);
    return (
      <Fragment>
        <Row>
          <Col span={8} className={styles.valueRow}>
            <Form.Item label={<FormattedMessage id="jsFunction.type" />}>
              {getFieldDecorator('functionType', {
                initialValue: jsFunctionList.length && jsFunctionList[0].functionType || '',
              })(
                <CSelect
                  className={styles.select}
                  onChange={(val, option) => this.setFunctionType(val, option)}
                >
                  <Option value=""><FormattedMessage id="global.null" /></Option>
                  {jsFunctionOptions}
                </CSelect>
              )}
            </Form.Item>
          </Col>
        </Row>
        <div className={styles.table}>
          <CTable
            columns={this.getColumns()}
            dataSource={jsFunctionList}
            pagination={false}
            rowKey="index"
          />
        </div>
      </Fragment>
    );
  }
}
export default Form.create()(JsElementList);