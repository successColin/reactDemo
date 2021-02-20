/*
 * @Author: Fus
 * @Date:   2019-08-15 16:29:25
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-27 10:17:33
 * @Desc: 增加本表控件
 */
import { Component } from 'react';
import { connect } from 'dva';
import { BaseContext } from '@/constants/global';
import { CTable } from '@/components/common/BasicWidgets';
import { FormattedMessage } from 'react-intl';
import { BTN_ELEMENT_TYPE } from '@/constants/element';


class AddElement extends Component {
  static contextType = BaseContext;
  state = {
    loading: false,
    pageNum: 1,
    pageSize: 10,
    selectedElement: [],
  };

  componentDidMount() {
    // this.fetchElementData();
  }

  // 点击行
  onClickRow = (record) => {
    const { tabElementList } = this.props;
    const { selectedElement } = this.state;

    let newSelectedElement = [...selectedElement];
    const activeIndex = newSelectedElement.findIndex(item => item.id === record.id);

    if (activeIndex === -1) {
      newSelectedElement.push(record);
    } else {
      newSelectedElement.splice(activeIndex, 1);
    }
    this.setState({ selectedElement: newSelectedElement });
  };
  handleSelect = (selectedRows) => {
    this.setState({ selectedElement: selectedRows });
  };

  // 获取列名
  getColumns = () => {
    return [
      {
        title: <FormattedMessage id="global.index"/>,
        dataIndex: 'index',
      }, {
        title: <FormattedMessage id="pageConfig.col.widgetName"/>,
        dataIndex: 'displayName',
      },
    ];
  };

  render() {
    const { tabElementList = [], elementData } = this.props;
    const { loading, pageNum, pageSize, selectedElement = [] } = this.state;
    const selectedRowKeys = selectedElement.map(item => item.id);
    const rowSelection = {
      selectedRowKeys,
      onSelectAll: (selected, selectedRows) => {
        this.handleSelect(selectedRows);
      },
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.handleSelect(selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: !!([elementData].find(item => record.id === item.id)),
      }),
    };
    const dataSource = tabElementList.filter(item => !(BTN_ELEMENT_TYPE.includes(item.basetype) || elementData.id === item.id)) || [];
    const newDataSource = dataSource.map((item, index) => {
      return { ...item, index: index + 1, };
    });
    const pagination = {
      total: newDataSource.length,
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
        dataSource={newDataSource}
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
