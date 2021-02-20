/*
 * @Author: Fus
 * @Date:   2019-08-15 13:49:53
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-11-28 10:07:01
 * @Desc: MSQL脚本触发器
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { BaseContext } from '@/constants/global';
import { Form, Checkbox, Select, Col, Row, Icon, Modal } from 'antd';
import { TRIGGER_VALUE_TYPE, DATA_TRIGGER_TYPE, METHOD_TYPE } from '@/constants/triggerState';
import { CTable, CInput, CSelect, CMessage, SearchSelect } from '@/components/common/BasicWidgets';
import { getProceduresType } from '@/services/triggerEvent';
import { VALID_REQUIRED_MESSAGE } from '@/constants/global';
import { getDefaultConfirmProps } from '@/utils/common';
import { delTrigger } from '@/services/pageConfig';
import styles from './SqlElementList.less';

const { Option } = Select;

@connect(state => ({
  triggerState: state.triggerState,
}))
class DataElementList extends Component {
  static contextType = BaseContext
  state = {
    // procedureDetail: {}, // 当前存储过程数据
  }
  // 切换存储过程类型
  handleChangeType = (val, option) => {
    const { data } = option.props;
    // this.setState({ procedureDetail: data });
    const { procedureDetail, eventData, triggerEventConfig, triggerType, activeEventId } = this.props.triggerState;
    const { elementData = {} } = triggerEventConfig;
    this.context.dispatch({
      type: 'triggerState/updateState',
      payload: {
        procedureDetail: {
        },
      },
    });
    setTimeout(() => {
      this.context.dispatch({
        type: 'triggerState/updateState',
        payload: {
          procedureDetail: {
            ...data,
            id: procedureDetail.id ? procedureDetail.id : null,
            procedureId: data.id,
            triggerType: 3,
            elementId: elementData.id,
            eventBaseType: eventData.find(item => item.id === activeEventId).basetype,
            eventId: activeEventId,
          },
        },
      });
    },200);
  }
  // 更新数据
  setProcedureDetail = (key, value) => {
    const { procedureDetail } = this.props.triggerState;
    this.context.dispatch({
      type: 'triggerState/updateState',
      payload: {
        procedureDetail: {
          ...procedureDetail,
          [key]: value,
        },
      },
    });
  }
  // 渲染详情表单
  renderDetailForm = () => {
    const { procedureDetail } = this.props.triggerState;
    const { getFieldDecorator } = this.props.form;
    const { paramNum = 0, keycode, name } = procedureDetail;
    const result = [];
    for (let i = 1; i <= paramNum; i++) {
      result.push((
        <Fragment key={`$Fragment-${keycode + name + paramNum + i}`}>
          <Col span={9} key={`col-${paramNum + i}`}>
            <Form.Item
              label={(
                <Fragment>
                  <FormattedMessage id="triggerEvent.col.param" />
                  {i}
                </Fragment>
              )}
            >
              <CInput key={`${procedureDetail[`param${i}`] + i + paramNum}`} defaultValue={procedureDetail[`param${i}`]} readOnly={true} />
            </Form.Item>
          </Col>
          <Col span={9} key={`Col-${keycode + name + paramNum + i + procedureDetail[`value${i}`]}`}>
            <Form.Item
              label={(
                <Fragment>
                  <FormattedMessage id="global.value" />
                  {i}
                </Fragment>
              )}
            >
              {getFieldDecorator(`value${i}`, {
                initialValue: procedureDetail[`value${i}`] || '',
                // rules: [{
                //   required: true,
                //   message: VALID_REQUIRED_MESSAGE,
                // }],
              })(
                <CInput key={`$Fragment-${keycode + name + paramNum + i + procedureDetail[`value${i}`]}`} onBlur={e => this.setProcedureDetail(`value${i}`, e.target.value)} />
              )}
            </Form.Item>
          </Col>
        </Fragment>
      ));
    }
    return result;
  }
  render() {
    const { triggerState } = this.props;
    const { activeEventId, eventData, procedureDetail, procedureTypeList } = triggerState;
    const { getFieldDecorator } = this.props.form;
    const activeEventData = eventData.find(item => item.id === activeEventId) || {};
    const { triggerDtoList = [] } = activeEventData;
    const typeOptions = procedureTypeList.map(item => <Option key={item.id} value={item.id} data={item}>{item.memo}</Option>);
    return (
      <div className={styles.wrap}>
        <Row className={styles.headerWrap}>
          <Col span={8} className={styles.valueRow}>
            <Form.Item label={<FormattedMessage id="triggerEvent.col.procedures" />}>
              <CSelect
                value={procedureDetail.procedureId}
                className={styles.select}
                onChange={this.handleChangeType}
              >
                {typeOptions}
              </CSelect>
            </Form.Item>
          </Col>
        </Row>
        <Row className={styles.detailWrap}>
          {this.renderDetailForm()}
        </Row>
      </div>
    );
  }
}
export default Form.create()(DataElementList);
