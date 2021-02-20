/*
 * @Author: Fus
 * @Date:   2019-11-05 14:24:05
 * @Desc: 排序设置
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Select } from 'antd';
import { CButton, SearchSelect, CSelect } from '@/components/common/BasicWidgets';
import AdvanceTable from '@/components/common/AdvanceTable/AdvanceTable';
import { ORDER_BY_TYPE } from '@/constants/pageConfig';
import { getTabSortConfig } from '@/services/pageConfig';
import styles from './SortConfig.less';

const { Option } = Select;
// 排序下拉选项
const orderByTypeOptions = Object.keys(ORDER_BY_TYPE).map(item => <Option key={item} value={+item}><FormattedMessage id={ORDER_BY_TYPE[item]} /></Option>);

class SortConfig extends Component {
  static defaultProps = {
    isPC: true, // 调用处是否为PC（PC/APP)
    tabInfo: {}, // 面板信息
    loading: false, // 获取列表状态
    // elementList: [], // 控件列表
  }
  state = {
    listData: [], // 列表数据
  }
  componentDidMount() {
    this.doFetchData();
  }
  // 获取排序配置数据
  doFetchData = () => {
    const { isPC, tabInfo } = this.props;
    const tabKey = isPC ? 'tabId' : 'mobileTabId';
    this.setState({ loading: true });
    getTabSortConfig({ [tabKey]: tabInfo.id }).then(listData => {
      this.setState({ listData, loading: false });
    }, err => this.setState({ loading: false }));
  }
  // 更新数据行
  setRowData = ({ key, value, index, record }) => {
    const { listData = [] } = this.state;
    const newList = [...listData];
    newList.splice(index, 1, {
      ...record,
      [key]: value,
    });
    this.updateState(newList);
  }
  // 新增数据
  handleAddRow = (index) => {
    const { listData = [] } = this.state;
    const newList = [...listData];
    const listLen = listData.length;
    newList.push({
      sno: listLen ? newList[listLen - 1].sno + 1 : 1,
    });
    this.updateState(newList);
  }
  // 删除数据
  handleMinusRow = (index) => {
    const { listData = [] } = this.state;
    const newList = [...listData];
    newList.splice(index, 1);
    this.updateState(newList);
  }
  // 更新state
  updateState = (listData) => {
    this.setState({ listData });
  }
  getColumns = () => {
    const { elementList, tabInfo } = this.props;
    const { functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    // const filedOptions = elementList.filter(item => !!item.relationColumnName).map(item => <Option key={item.relationColumnName} value={item.relationColumnName}>{item.displayName}</Option>);
    return [{
      title: <FormattedMessage id="global.name" />,
      dataIndex: 'columnName',
      key: 'columnName',
      render: (text, record, index) => (
        <SearchSelect
          value={text}
          modalContentType="tableColumn"
          showType="list"
          otherQueryParams={{ tableName: tabInfo.relationTableName }}
          selectConfig={{
            isMulti: false,
            keyName: 'columnName',
          }}
          setSelected={selectedRows => this.setRowData({
            key: 'columnName',
            value: selectedRows[0] && selectedRows[0].columnName || '',
            record,
            index,
          })}
        />
      ),
    }, {
      title: <FormattedMessage id="global.order" />,
      dataIndex: 'sort',
      key: 'sort',
      render: (text, record, index) => (
        <CSelect
          value={text}
          style={{ width: '100%' }}
          onChange={value => this.setRowData({
            key: 'sort',
            value: value,
            record,
            index,
          })}
        >
          {orderByTypeOptions}
        </CSelect>
      ),
    }, {
      dataIndex: 'operator',
      title: <FormattedMessage id="global.operator" />,
      width: 100,
      render: (text, record, index) => (
        candelete ? <div className={styles.operator}>
          <span onClick={() => this.handleMinusRow(index)} className="iconfont icon-minus-border custom-color" />
        </div> : null
      ),
    }];
  }
  render() {
    const { listData = [], loading } = this.state;
    const { functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    return (
      <div className={styles.wrap}>
        {canadd ? <CButton onClick={this.handleAddRow} className={styles.addBtn}>
          <i className="iconfont icon-add-border custom-color" />
          <FormattedMessage id="global.add" />
        </CButton> : null}
        <AdvanceTable
          columns={this.getColumns()}
          dataSource={listData}
          delFunc={this.handleDelRow}
          setParentState={({ dataSource }) => this.setState({ listData: dataSource })}
          className={styles.table}
          showOperator={false}
          loading={loading}
          rowKey="sno"
        />
      </div>
    );
  }
}
export default SortConfig;
