/*
 * @Author: Fus
 * @Date:   2019-08-21 14:01:16
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-26 10:09:09
 * @Desc: 过滤条件
 */
import { Component, Fragment } from 'react';
import { Radio, Select } from 'antd';
import { connect } from 'dva';
import update from 'immutability-helper';
import {
  CTable,
  CTextArea,
  SearchSelect,
  CInput,
  CSelect,
  CButton,
  SplitLine,
  CSpin, CMessage,
} from '@/components/common/BasicWidgets';
import { BaseContext } from '@/constants/global';
import { TAB_FILTER_VALUE_TYPE, TAB_FILTER_COND_TYPES } from '@/constants/pageConfig';
import styles from './FilterCond.less';
import { FormattedMessage } from 'react-intl';

const { Option } = Select;
// 值类型下拉选项
const valueTypeOptions = Object.keys(TAB_FILTER_VALUE_TYPE).map(item => <Option key={item}
                                                                                value={+item}><FormattedMessage
  id={TAB_FILTER_VALUE_TYPE[item]}/></Option>);
// 关系下拉选项
const condTypeOptions = TAB_FILTER_COND_TYPES.map(item => <Option key={item} value={item}>{item}</Option>);

@connect(state => ({
  framePage: state.framePage,
  bundleConfig: state.bundleConfig,
}))
class FilterCond extends Component {
  static contextType = BaseContext;
  // 根据PC和APP获取不同格式数据源
  getNewListByIsPC = () => {
    const { isPC } = this.props;
    let newList = [];
    if (isPC) {
      const { tabFilterCond = [] } = this.props.framePage;
      newList = [...tabFilterCond];
    } else {
      const { queryListMap, tabBasicData } = this.props.bundleConfig;
      const filterCondList = queryListMap[tabBasicData.id];
      newList = [...filterCondList];
    }
    return newList.map((item, index) => ({ ...item, index }));
  };
  // 更新数据行
  setRowData = ({ key, value, index, record }) => {
    const newList = this.getNewListByIsPC();
    const recordIndex = newList.findIndex(item => item.index === record.index);
    newList.splice(recordIndex, 1, {
      ...record,
      [key]: value,
    });
    this.updateState(newList);
  };
  // 设置字段名
  setColumnName = (selectedRows, record, index) => {
    const selected = selectedRows[0] && selectedRows[0] || {};
    const newList = this.getNewListByIsPC();
    const recordIndex = newList.findIndex(item => item.index === record.index);
    newList.splice(recordIndex, 1, {
      ...record,
      asqlColumnName: selected.columnName || '',
      relationColumnType: selected.columnType,
    });
    this.updateState(newList);
  };
  // 设置菜单
  setFileColumnName = (selectedRows, record, index) => {
    const { isPC } = this.props;
    const { langLib } = this.context;
    const selected = selectedRows[0] || {};
    const newList = this.getNewListByIsPC();
    const recordIndex = newList.findIndex(item => item.index === record.index);
    let columnName = isPC ? 'jumpFunctionId' : 'jumpBundleId';
    let filterData = newList.find(item => item[columnName] === selected.id);
    if (filterData) {
      CMessage(langLib['message.err.exit.function'], 'error');
      return;
    }
    let functionMap = isPC ? { functionDto: { name: selected.name } } : { bundlePramDto: { name: selected.name } };
    newList.splice(recordIndex, 1, {
      ...record,
      [columnName]: selected.id || '',
      ...functionMap,
    });
    this.updateState(newList);
  };
  // 新增数据
  handleAddRow = (baseType) => {
    const newList = this.getNewListByIsPC();
    newList.push({
      index: newList.length,
      asqlWholeCondition: 'test',
      queryType: newList.length ? newList[0].queryType : 1,
      basetype: baseType,
    });
    this.updateState(newList);
  };
  // 删除数据
  handleMinusRow = (record) => {
    const newList = this.getNewListByIsPC();
    const recordIndex = newList.findIndex(item => item.index === record.index);
    newList.splice(recordIndex, 1);
    this.updateState(newList);
  };
  // 切换过滤方式
  handleChangeFilterType = queryType => {
    const filterList = this.getNewListByIsPC();
    const newList = filterList.length ? filterList.map(item => ({ ...item, queryType })) : [{
      basetype: queryType,
      queryType,
      asqlWholeCondition: 'test',
    }];
    this.updateState(newList);
  };
  // 更新state
  updateState = (newList) => {
    this.props.setEditStatus();
    const { isPC } = this.props;
    if (isPC) {
      this.context.dispatch({
        type: 'framePage/updateState',
        payload: { tabFilterCond: newList },
      });
    } else {
      const { queryListMap, tabBasicData } = this.props.bundleConfig;
      this.context.dispatch({
        type: 'bundleConfig/updateState',
        payload: {
          queryListMap: {
            ...queryListMap,
            [tabBasicData.id]: newList,
          },
        },
      });
    }
  };
  // 菜单过滤条件
  getFileFilterColumns = () => {
    const { isPC } = this.props;
    const { functionData } = this.props;
    const { candelete } = functionData.attributes;
    const functionName = isPC ? 'jumpFunctionId' : 'jumpBundleId';
    return [
      {
        dataIndex: functionName,
        key: functionName,
        title: <FormattedMessage id="tab.filter.flie.name"/>,
        width: 200,
        render: (text, record, index) => {
          let value = isPC ? (text && record.functionDto ? record.functionDto.name : '') : (text && record.bundlePramDto ? record.bundlePramDto.name : '');
          return (
            isPC ? <SearchSelect
              value={value}
              modalContentType="function"
              showType="tree"
              needCheckRoot={true}
              setSelected={selectedRows => this.setFileColumnName(selectedRows, record, index)}
            /> : <SearchSelect
              value={value}
              modalContentType="bundle"
              showType="tree"
              setSelected={selectedRows => this.setFileColumnName(selectedRows, record, index)}
            />
          );
        },
      }, {
        dataIndex: 'filterSql',
        title: <FormattedMessage id="tab.module.filter"/>,
        width: '70%',
        render: (text, record, index) => (
          <CTextArea
            value={text}
            onChange={e => this.setRowData({
              key: 'filterSql',
              value: e.target.value,
              record,
              index,
            })}
          />
        ),
      }, {
        dataIndex: 'operator',
        title: <FormattedMessage id="global.operator"/>,
        render: (text, record, index) => (
          candelete ? <div className={styles.operator}>
            {/* <span onClick={() => this.handleAddRow(index)} className="iconfont icon-add-border custom-color" /> */}
            <span onClick={() => this.handleMinusRow(record)} className="iconfont icon-minus-border custom-color"/>
          </div> : null
        ),
      },
    ];
  };

  getColumns = () => {
    const { tabBasicData } = this.props[this.props.modelName];
    const { functionData } = this.props;
    const { dataSourceType, commonApiHeaderId, relationTableName } = tabBasicData;
    const { candelete } = functionData.attributes;
    return [
      {
        dataIndex: 'asqlLeftParenTheses',
        key: 'asqlLeftParenTheses',
        title: <FormattedMessage id="tab.filterCond.leftBracket"/>,
        render: (text, record, index) => (
          <CInput
            value={text}
            onChange={e => this.setRowData({
              key: 'asqlLeftParenTheses',
              value: e.target.value.trim(),
              record,
              index,
            })}
          />
        ),
      }, {
        dataIndex: 'asqlColumnName',
        key: 'asqlColumnName',
        title: <FormattedMessage id="tab.filterCond.columnName"/>,
        render: (text, record, index) => (
          <SearchSelect
            value={text}
            modalContentType={dataSourceType === 2 ? 'fromApi' : 'tableColumn'}
            showType="list"
            otherQueryParams={dataSourceType === 2 ? {
              commonApiHeaderId,
              tag: 2,
            } : { tableName: relationTableName }}
            selectConfig={dataSourceType === 2 ? {
              isMulti: false,
              keyName: 'keywords',
            } : {
              isMulti: false,
              keyName: 'columnName',
            }}
            setSelected={selectedRows => this.setColumnName(selectedRows, record, index)}
          />
        ),
      }, {
        dataIndex: 'asqlDecisionOperator',
        title: <FormattedMessage id="tab.filterCond.cond"/>,
        render: (text, record, index) => (
          <CInput
            value={text}
            onChange={e => this.setRowData({
              key: 'asqlDecisionOperator',
              value: e.target.value.trim(),
              record,
              index,
            })}
          />
        ),
      }, {
        dataIndex: 'asqlValueType',
        title: <FormattedMessage id="tab.filterCond.valueType"/>,
        render: (text, record, index) => (
          <CSelect
            value={text}
            style={{ width: '100%' }}
            onChange={value => this.setRowData({
              key: 'asqlValueType',
              value: +value,
              record,
              index,
            })}
          >
            {valueTypeOptions}
          </CSelect>
        ),
      }, {
        dataIndex: 'asqlValue',
        title: <FormattedMessage id="tab.filterCond.value"/>,
        render: (text, record, index) => (
          <CInput
            value={text}
            onChange={e => this.setRowData({
              key: 'asqlValue',
              value: e.target.value.trim(),
              record,
              index,
            })}
          />
        ),
      }, {
        dataIndex: 'asqlRightParenTheses',
        title: <FormattedMessage id="tab.filterCond.rightBracket"/>,
        render: (text, record, index) => (
          <CInput
            value={text}
            onChange={e => this.setRowData({
              key: 'asqlRightParenTheses',
              value: e.target.value.trim(),
              record,
              index,
            })}
          />
        ),
      }, {
        dataIndex: 'asqlRelationalOperator',
        title: <FormattedMessage id="tab.filterCond.relation"/>,
        width: 100,
        render: (text, record, index) => (
          <CSelect
            value={text}
            style={{ width: '100%' }}
            onChange={value => this.setRowData({
              key: 'asqlRelationalOperator',
              value,
              record,
              index,
            })}
          >
            <Option value=""><FormattedMessage id="global.null"/></Option>
            {condTypeOptions}
          </CSelect>
        ),
      }, {
        dataIndex: 'operator',
        title: <FormattedMessage id="global.operator"/>,
        render: (text, record, index) => (
          candelete ? <div className={styles.operator}>
            {/* <span onClick={() => this.handleAddRow(index)} className="iconfont icon-add-border custom-color" /> */}
            <span onClick={() => this.handleMinusRow(record)} className="iconfont icon-minus-border custom-color"/>
          </div> : null
        ),
      },
    ];
  };

  render() {
    const { isPC, form, functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    const { getFieldDecorator } = form;
    let dataSource = [];
    if (isPC) {
      const { tabFilterCond } = this.props.framePage;
      dataSource = tabFilterCond.map((item, index) => ({ ...item, index }));
    } else {
      const { queryListMap, tabBasicData } = this.props.bundleConfig;
      dataSource = queryListMap[tabBasicData.id].map((item, index) => ({ ...item, index }));
    }
    const sqlObj = dataSource.find(item => item.basetype === 2) || {};
    // const filterObj = dataSource.find(item => item.basetype === 3) || {};
    const queryType = dataSource.length ? dataSource[0].queryType : 1;
    return (
      <div className={styles.wrap}>
        <Radio
          value={1}
          checked={queryType === 1}
          className={styles.typeRadio}
          onClick={() => this.handleChangeFilterType(1)}
        >
          <FormattedMessage id="tab.filter.group"/>
        </Radio>
        {canadd ? <CButton onClick={() => this.handleAddRow(1)} className={styles.addBtn}>
          <i className="iconfont icon-add-border custom-color"/>
          <FormattedMessage id="global.add"/>
        </CButton> : null}
        <CTable
          columns={this.getColumns()}
          dataSource={dataSource.filter(item => item.basetype === 1)}
          className={styles.table}
          pagination={false}
          rowKey="index"
        />
        <Radio
          value={2}
          checked={queryType === 2}
          className={styles.typeRadio}
          onClick={() => this.handleChangeFilterType(2)}
        >
          <FormattedMessage id="tab.filter.sql"/>
        </Radio>
        {getFieldDecorator('apiSql', {
          initialValue: sqlObj.apiSql || '',
        })(
          <CTextArea
            className={styles.textarea}
            autosize={{ minRows: 4 }}
          />,
        )}
        <div className={styles.jump}>
          <SplitLine title={<FormattedMessage id="tab.filter.additional.information"/>}/>
          <FormattedMessage id="tab.filter.jump.menu.filter"/>
          <br/>
          {canadd ? <CButton onClick={() => this.handleAddRow(3)} className={styles.addBtn}>
            <i className="iconfont icon-add-border custom-color"/>
            <FormattedMessage id="global.add"/>
          </CButton> : null}
          <CTable
            columns={this.getFileFilterColumns()}
            dataSource={dataSource.filter(item => item.basetype === 3) || []}
            className={styles.table}
            pagination={false}
            rowKey="index"
          />
        </div>
        {/*{getFieldDecorator('filterSql', {*/}
        {/*  initialValue: filterObj.filterSql || '',*/}
        {/*})(*/}
        {/*  <CTextArea*/}
        {/*    className={styles.textarea}*/}
        {/*    autosize={{ minRows: 4 }}*/}
        {/*  />*/}
        {/*)}*/}
      </div>
    );
  }
}

export default FilterCond;
