/*
 * @Author: jwk
 * @Date:   2020-07-02 14:59:50
 * @Desc: 第三方接口数据的参数配置
 */
import React, { Component } from 'react';
import { getCurrencyList, getParams } from '@/services/global';
import { FormattedMessage } from 'react-intl';
import styles from '@/components/common/TabConfig/SortConfig/SortConfig.less';
import { CButton, CInput, CSelect, SearchSelect, CMessage } from '@/components/common/BasicWidgets';
import AdvanceTable from '@/components/common/AdvanceTable/AdvanceTable';
import { BaseContext } from '@/constants/global';

class GinsengConfig extends Component {
  static contextType = BaseContext;
  state = {
    inParamsList: [], // 输入参数
    loading: false,
    list: [], // 入参集合
  };

  componentDidMount() {
    this.getInParamsList();
    this.getParamsList();
  }

  // 接口获取有配置过得入参
  getParamsList = () => {
    const { tabInfo, isPC } = this.props;
    const { commonApiHeaderId, id } = tabInfo;
    let params = {
      commonApiHeaderId,
      [isPC ? 'tabId' : 'mobileTabId']: id,
    };
    getParams(params).then(res => {
      this.setState({ inParamsList: res });
    });
  };

  // 获取入参列表
  getInParamsList = () => {
    const { tabInfo } = this.props;
    const { commonApiHeaderId } = tabInfo;
    getCurrencyList({
      commonApiHeaderId,
      tag: 1,
      pageNum: 1,
      pageSize: 9999,
      keywords: '',
    }).then(res => {
      this.setState({
        list: res.list || [],
      });
    });
  };
  // 更新数据行
  setRowData = ({ key, value, index, record }) => {
    const { inParamsList = [] } = this.state;
    const newList = [...inParamsList];
    newList.splice(index, 1, {
      ...record,
      [key]: value,
    });
    this.updateState(newList);
  };
  // 新增数据
  handleAddRow = (index) => {
    const { inParamsList = [] } = this.state;
    const newList = [...inParamsList];
    const listLen = inParamsList.length;
    newList.push({
      sno: listLen ? newList[listLen - 1].sno + 1 : 1,
      paramKey: '',
      initValue: '',
      dataType: '',
    });
    this.updateState(newList);
  };
  // 删除数据
  handleMinusRow = (index) => {
    const { inParamsList = [] } = this.state;
    const newList = [...inParamsList];
    newList.splice(index, 1);
    this.updateState(newList);
  };
  // 更新state
  updateState = (inParamsList) => {
    this.setState({ inParamsList });
  };
  // 选中参数做校验
  changeSelectRows = (selectedRows, record, index) => {
    const { inParamsList } = this.state;
    let value = selectedRows[0] && selectedRows[0].paramKey || '';
    let isExst = inParamsList.find(item => {
      return item.paramKey === value;
    });
    const { langLib } = this.context;
    if (isExst) {
      CMessage(langLib['messge.error.keycode'](value), 'error');
      return;
    }
    record.dataType = selectedRows[0].dataType
    this.setRowData({
      key: 'paramKey',
      value,
      record,
      index,
    });
  };
  // 获取列名
  getColumns = () => {
    const { tabInfo } = this.props;
    const { commonApiHeaderId } = tabInfo;
    const { functionData } = this.props;
    const { candelete } = functionData.attributes;
    return [{
      title: <FormattedMessage id="tab.inparam.inname"/>,
      dataIndex: 'paramKey',
      key: 'paramKey',
      render: (text, record, index) => (
        <SearchSelect
          value={text}
          modalContentType="fromApi"
          showType="list"
          otherQueryParams={{ commonApiHeaderId, tag: 1 }}
          selectConfig={{
            isMulti: false,
            keyName: 'keywords',
          }}
          setSelected={selectedRows => {
            this.changeSelectRows(selectedRows, record, index);
          }}
        />
      ),
    }, {
      title: <FormattedMessage id="tab.inparam.value"/>,
      dataIndex: 'initValue',
      key: 'initValue',
      render: (text, record, index) => (
        <CInput value={text}  onChange={e => this.setRowData({
          key: 'initValue',
          value: e.target.value,
          record,
          index,
        })}/>
      ),
    }, {
      dataIndex: 'operator',
      title: <FormattedMessage id="global.operator"/>,
      width: 100,
      render: (text, record, index) => (
        candelete ? <div className={styles.operator}>
          <span onClick={() => this.handleMinusRow(index)} className="iconfont icon-minus-border custom-color"/>
        </div> : null
      ),
    }];
  };

  render() {
    const { inParamsList = [], loading } = this.state;
    const { functionData } = this.props;
    const { canadd } = functionData.attributes;
    return (
      <div className={styles.wrap}>
        {canadd ? <CButton onClick={this.handleAddRow} className={styles.addBtn}>
          <i className="iconfont icon-add-border custom-color"/>
          <FormattedMessage id="global.add"/>
        </CButton> : null}
        <AdvanceTable
          columns={this.getColumns()}
          dataSource={inParamsList}
          delFunc={this.handleDelRow}
          setParentState={({ dataSource }) => this.setState({ inParamsList: dataSource })}
          className={styles.table}
          showOperator={false}
          loading={loading}
          rowKey="sno"
        />
      </div>
    );
  }
}

export default GinsengConfig;
