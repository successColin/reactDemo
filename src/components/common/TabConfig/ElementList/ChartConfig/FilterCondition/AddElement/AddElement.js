/*
 * @Author: Fus
 * @Date:   2020-02-25 15:19:40
 * @Desc: 新增控件表格
 */
import { Component } from 'react';
import { connect } from 'dva';
import { BaseContext } from '@/constants/global';
import { CTable } from '@/components/common/BasicWidgets';
import { getTabElementList } from '@/services/pageConfig';
import { FormattedMessage } from 'react-intl';

class AddElement extends Component {
  static contextType = BaseContext
  state = {
    loading: false,
    pageNum: 1,
    pageSize: 10,
  }
  // 点击行
  onClickRow = (record) => {
    const { selectedEleIds, addedList } = this.props;
    if (addedList.find(item => item.relationElementId === record.id)) return;
    const newList = [...selectedEleIds];
    const activeIndex = newList.findIndex(item => item === record.id);
    if (activeIndex === -1) {
      newList.push(record.id);
    } else {
      newList.splice(activeIndex, 1);
    }
    this.props.setFilterConditionState({
      selectedEleIds: newList,
    });
  };
  handleSelect = (selectedRows) => {
    this.props.setFilterConditionState({
      selectedEleIds: selectedRows.map(item => item.id),
    });
  }

  // 获取列名
  getColumns = () => {
    return [
      {
        title: <FormattedMessage id="global.index" />,
        dataIndex: 'index',
      }, {
        title: <FormattedMessage id="pageConfig.col.widgetName" />,
        dataIndex: 'displayName',
      },
    ];
  }
  render() {
    const { selectedEleIds, filterEleList, addedList } = this.props;
    const { loading, pageNum, pageSize, selectedRows } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedEleIds,
      onSelectAll: (selected, selectedRows) => {
        this.handleSelect(selectedRows);
      },
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.handleSelect(selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: addedList.find(item => record.id === item.relationElementId),
      }),
    };
    const pagination = {
      total: filterEleList.length + 1,
      current: pageNum,
      pageSize,
      onChange: (pageNum, newPageSize) => {
        this.setState({
          pageNum,
          pageSize: newPageSize,
        });
      },
    };
    return (
      <CTable
        columns={this.getColumns()}
        dataSource={filterEleList}
        rowSelection={rowSelection}
        onClickRow={this.onClickRow}
        pagination={pagination}
        loading={loading}
        rowKey="id"
      />
    );
  }
}
export default AddElement;