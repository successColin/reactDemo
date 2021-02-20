/*
 * @Author: Fus
 * @Date:   2019-08-07 15:10:23
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-10-25 16:18:07
 * @Desc: 界面配置的列表
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Checkbox, Select } from 'antd';
import classNames from 'classnames';
import { MOBILE_COLSPAN_TYPE } from '@/constants/pageConfig';
import { CSelect, CInput } from '@/components/common/BasicWidgets';
import AdvanceTable from '@/components/common/AdvanceTable/AdvanceTable';
import SettingForm from '../SettingForm/SettingForm';
import update from 'immutability-helper';
import styles from './ListTable.less';

const { Option } = Select;
// 行宽下拉选项
const colSpanOptions = Object.keys(MOBILE_COLSPAN_TYPE).map(item => <Option key={`colSpan-${item}`} value={+item}><FormattedMessage id={MOBILE_COLSPAN_TYPE[item]} /></Option>);


class ListTable extends Component {
  state = {
    activeRowIndex: -1, // 当前行索引（用在高级设置里的控件数据绑定）
    dataSource: [], // 后续改为由根组件传入
  }
  // 获取子组件
  getChildComponent = record => {
    const { form, activeDetail, doSaveFrameTab, fromType } = this.props;
    const { elementList = [] } = activeDetail;
    const { activeRowIndex } = this.state;
    return (
      <SettingForm
        key={`setFormm${activeDetail.sno}`}
        form={form}
        setRowData={this.setRowData}
        activeRowIndex={activeRowIndex}
        tabInfo={activeDetail}
        activeRow={elementList[activeRowIndex]}
        doSaveFrameTab={doSaveFrameTab}
        fromType={fromType}
      />
    );
  }
  // 更新主数据
  setActiveDetailData = ({ dataSource, isDel }) => {
    this.props.setActiveDetail({ listData: dataSource });
    isDel && this.setState({ activeRowIndex: -1 });
  }
  // 更新数据行
  setRowData = ({ key, value, index, record }) => {
    const { activeDetail = {} } = this.props;
    const { elementList = [] } = activeDetail;
    const newList = update(elementList, {
      $splice: [[index, 1], [index, 0, {
        ...record,
        [key]: value,
      }]],
    });
    this.setActiveDetailData({ dataSource: newList });
  }
  // 设置当前行为高级设置表格的数据
  setActiveRowData = (index) => {
    const { activeRowIndex } = this.state;
    this.props.form.resetFields();
    this.setState({ activeRowIndex: activeRowIndex === index ? -1 : index });
  }
  // 生成列名
  setColumns = () => {
    const { activeRowIndex } = this.state;
    const { activeDetail = {} } = this.props;
    const { elementList = [] } = activeDetail;
    return  [
      {
        title: <FormattedMessage id="global.index" />,
        dataIndex: 'sno',
        key: 'sno',
        width: 60,
      }, {
        title: <FormattedMessage id="pageConfig.col.widgetName" />,
        dataIndex: 'name',
        key: 'name',
        width: 120,
        render: text => <span title={text}>{text}</span>,
      }, {
        title: <FormattedMessage id="global.required" />,
        dataIndex: 'requisite',
        key: 'requisite',
        width: 80,
        render: (text, record, index) => (
          <Checkbox
            checked={!!text}
            onChange={e => this.setRowData({
              key: 'requisite',
              value: +e.target.checked,
              record,
              index,
            })}
          />
        ),
      }, {
        title: <FormattedMessage id="global.readOnly" />,
        dataIndex: 'readonly',
        key: 'readonly',
        width: 80,
        render: (text, record, index) => (
          <Checkbox
            checked={!!text}
            onChange={e => this.setRowData({
              key: 'readonly',
              value: +e.target.checked,
              record,
              index,
            })}
          />
        ),
      }, {
        title: <FormattedMessage id="global.visible" />,
        dataIndex: 'visiabled',
        key: 'visiabled',
        width: 80,
        render: (text, record, index) => (
          <Checkbox
            checked={!!text}
            onChange={e => this.setRowData({
              key: 'visiabled',
              value: +e.target.checked,
              record,
              index,
            })}
          />
        ),
      }, {
        title: <FormattedMessage id="global.colSpan" />,
        dataIndex: 'columnSpan',
        key: 'columnSpan',
        width: 100,
        render: (text, record, index) => {
          return (
            <CSelect
              value={text}
              style={{ width: 80 }}
              onChange={val => this.setRowData({
                key: 'columnSpan',
                value: val,
                record,
                index,
              })}
            >
              {colSpanOptions}
            </CSelect>
          );
        },
      }, {
        title: <FormattedMessage id="pageConfig.col.showName" />,
        dataIndex: 'displayName',
        key: 'displayName',
        render: (text, record, index) => (
          <CInput
            value={text}
            onChange={e => this.setRowData({
              key: 'displayName',
              value: e.target.value.trim(),
              record,
              index,
            })}
          />
        ),
      }, {
        title: <FormattedMessage id="pageConfig.col.setting" />,
        dataIndex: 'ignore_set',
        key: 'ignore_set',
        width: 100,
        render: (text, record, index) => {
          const activeRow = (activeRowIndex !== -1) && elementList[activeRowIndex] || {};
          const isActiveRow = record.sno === activeRow.sno;
          const arrowCls = classNames({
            'iconfont': true,
            'icon-down': true,
            [styles.arrow]: true,
            [styles.close]: isActiveRow,
          });
          const wrapCls = classNames({
            'custom-color': true,
            [styles.triggerWrap]: true,
          });
          return (
            <span
              onClick={() => this.setActiveRowData(index)}
              className={wrapCls}
            >
              <FormattedMessage id={isActiveRow ? 'to.close' : 'to.open'} />
              <span className={arrowCls} />
            </span>
          );
        },
      },
    ];
  }
  render() {
    const { activeRowIndex } = this.state;
    const { activeDetail = {}, functionData } = this.props;
    const { candelete } = functionData.attributes;
    const { elementList = [] } = activeDetail;
    const wrapCls = classNames({
      [styles.wrap]: true,
      'custom-list-table': true, // 调用处样式覆盖用
    });
    return (
      <div className={wrapCls}>
        <AdvanceTable
          columns={this.setColumns()}
          dataSource={elementList}
          activeRow={activeRowIndex === -1 ? {} : elementList[activeRowIndex]}
          getExpandedRowComponent={() => this.getChildComponent()}
          setParentState={this.setActiveDetailData}
          rowKey="sno"
          showOperator={candelete ? true : false}
        />
      </div>
    );
  }
}

export default ListTable;
