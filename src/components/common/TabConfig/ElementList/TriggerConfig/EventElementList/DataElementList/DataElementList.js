/*
 * @Author: Fus
 * @Date:   2019-08-15 13:49:53
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-27 11:03:26
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
import styles from './DataElementList.less';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const { Option } = Select;
// 下拉选项
const valueTypeOption = Object.keys(TRIGGER_VALUE_TYPE).map(item => <Option key={`colSpan-${item}`}
                                                                            value={+item}><FormattedMessage
  id={TRIGGER_VALUE_TYPE[item]}/></Option>);

// 类型下拉项
const typeOptions = Object.keys(DATA_TRIGGER_TYPE).map(item => <Option key={item} value={+item}><FormattedMessage
  id={DATA_TRIGGER_TYPE[item]}/></Option>);

// 方法下拉项
const methodOptions = Object.keys(METHOD_TYPE).map(item => <Option key={item} value={+item}><FormattedMessage
  id={METHOD_TYPE[item]}/></Option>);

@connect(state => ({
  triggerState: state.triggerState,
}))
class DataElementList extends Component {
  static contextType = BaseContext;
  state = {};
  // 更新触发器事件内元素属性
  setElementData = (key, val, index, otherParamObj) => {
    const { eventData, activeEventId } = this.props.triggerState;
    const activeEventIndex = eventData.findIndex(item => item.id === activeEventId);
    const eventElement = eventData[activeEventIndex].triggerDtoList || [];
    const newEventElement = [...eventElement];
    let newRecord = {
      ...newEventElement[index],
      [key]: val,
    };
    if (otherParamObj) {
      newRecord = {
        ...newRecord,
        ...otherParamObj,
      };
    }
    newEventElement.splice(index, 1, newRecord);
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
    //         removeData();
    //       });
    //     } else { // 未保存的控件删除直接前端删除
    //       removeData();
    //     }
    //   },
    // });
  };
  // 选择字段名后带出columnType
  handleChangeRelationColumn = (selected, index) => {
    const selectedRow = selected.length ? selected[0] : {};
    this.setElementData('relationColumn', selectedRow.columnName || '', index, {
      relationColumnType: selectedRow.columnType,
    });
  };
  // 生成列名
  getColumns = () => {
    const { triggerState } = this.props;
    const { activeEventId, eventData } = triggerState;
    const { getFieldDecorator } = this.props.form;
    const activeEventData = eventData.find(item => item.id === activeEventId) || {};
    const { triggerDtoList = [] } = activeEventData;
    return [
      {
        title: <FormattedMessage id="global.index"/>,
        dataIndex: 'index',
        width: 100,
        render: (text, record, index) => index + 1,
        // }, {
        //   title: <FormattedMessage id="triggerEvent.col.table"/>,
        //   dataIndex: 'relationTable',
        //   render: (text, record, index) => (
        //     <SearchSelect
        //       value={text}
        //       modalContentType="relateTable"
        //       showType="list"
        //       setSelected={(selected = []) => this.setElementData('relationTable', selected.length ? selected[0].tableName : '', index)}
        //     />
        //   ),
      }, {
        title: <FormattedMessage id="global.field"/>,
        dataIndex: 'relationColumn',
        render: (text, record, index) => (
          <SearchSelect
            value={text}
            modalContentType="tableColumn"
            showType="list"
            setSelected={(selected = []) => this.handleChangeRelationColumn(selected, index)}
            selectConfig={{
              isMulti: false,
              keyName: 'columnName',
            }}
            otherQueryParams={{ tableName: activeEventData.relationTable }}
          />
        ),
      }, {
        title: <FormattedMessage id="triggerEvent.col.valueType"/>,
        dataIndex: 'valueType',
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
        dataIndex: 'relationColumnValue',
        render: (text, record, index) => (
          <CInput
            value={text}
            onChange={e => this.setElementData('relationColumnValue', e.target.value, index)}
          />
        ),
      }, {
        title: <FormattedMessage id="triggerEvent.col..method"/>,
        dataIndex: 'method',
        render: (text, record, index) => (
          <CSelect
            value={text}
            style={{ width: '100%' }}
            onChange={val => this.setElementData('method', +val, index)}
          >
            {methodOptions}
          </CSelect>
        ),
      }, {
        title: <FormattedMessage id="triggerEvent.col.forCond"/>,
        dataIndex: 'applyToQuery',
        align: 'center',
        width: 120,
        render: (text, record, index) => (
          <Checkbox
            checked={!!text}
            onChange={e => this.setElementData('applyToQuery', +e.target.checked, index)}
          />
        ),
      }, {
        title: <FormattedMessage id="global.operator"/>,
        dataIndex: 'operator',
        align: 'center',
        width: 80,
        render: (text, record, index) => <span className="iconfont icon-del custom-color"
                                               onClick={() => this.handleDel(record, index)}/>,
      },
    ];
  };

  render() {
    const { triggerState } = this.props;
    const { activeEventId, eventData } = triggerState;
    const { getFieldDecorator } = this.props.form;
    const activeEventData = eventData.find(item => item.id === activeEventId) || {};
    const { triggerDtoList = [] } = activeEventData;
    return (
      <Fragment>
        <Row>
          <Col span={8} className={styles.valueRow}>
            <Form.Item label={<FormattedMessage id="global.type"/>}>
              {getFieldDecorator('operationType', {
                initialValue: activeEventData.operationType,
              })(
                <CSelect
                  className={styles.select}
                  onChange={val => this.setEventData('operationType', val)}
                >
                  {typeOptions}
                </CSelect>,
              )}
            </Form.Item>
          </Col>
          <Col span={8} className={styles.valueRow}>
            <Form.Item label={<FormattedMessage id="triggerEvent.col.table"/>}>
              {getFieldDecorator('relationTable', {
                initialValue: activeEventData.relationTable,
              })(
                <SearchSelect
                  modalContentType="relateTable"
                  showType="list"
                  setSelected={(selected = []) => this.setEventData('relationTable', selected.length ? selected[0].tableName : '')}
                />,
              )}
            </Form.Item>
          </Col>
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

export default Form.create()(DataElementList);
