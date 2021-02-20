/*
 * @Author: Fus
 * @Date:   2019-12-25 15:16:05
 * @Desc: 面板内控件列表
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { BaseContext } from '@/constants/global';
import { CTable } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';

class TabElementTable extends Component {
  static contextType = BaseContext
  state = {
    selectedRowKeys: [], // 已选中的列表
    pageNum: 1,
    pageSize: 10,
  }
  setColumns = () => {
    return [
      {
        title: <FormattedMessage id="global.index" />,
        dataIndex: 'sno',
        key: 'sno',
      }, {
        title: <FormattedMessage id="pageConfig.col.widgetName" />,
        dataIndex: 'name',
        key: 'name',
      }, {
        title: <FormattedMessage id="pageConfig.col.showName" />,
        dataIndex: 'displayName',
        key: 'displayName',
      },
    ];
  }
  // 选择数据
  handleSelect = (selectedList) => {
    const selectedRowKeys = selectedList.map(item => item.id);
    this.setState({ selectedRowKeys });
  };
  // 点击行
  onClickRow = (record) => {
    const { seniorFilterList } = this.props;
    if (seniorFilterList.find(item => record.id === item.elementId)) return;
    const { selectedRowKeys } = this.state;
    let newKeys = [...selectedRowKeys];
    const activeIndex = selectedRowKeys.findIndex(item => item === record.id);
    if (activeIndex === -1) {
      newKeys.push(record.id);
    } else {
      newKeys.splice(activeIndex, 1);
    }
    this.setState({ selectedRowKeys: newKeys });
  }
  // 保存
  handleSave = () => {
    const { isPC, modelName, handleCloseModal, seniorFilterList, updateListState } = this.props;
    const { selectedRowKeys } = this.state;
    let tabElementList = [];
    if (isPC) {
      tabElementList = this.props.framePage.tabElementList;
    } else {
      const { tabBasicData, elementListMap } = this.props.bundleConfig;
      tabElementList = elementListMap[tabBasicData.id];
    }
    const beforeMaxSno = seniorFilterList.length > 0 ? seniorFilterList[seniorFilterList.length - 1].sno : 0;
    const addList = tabElementList.filter(item => selectedRowKeys.includes(item.id)).map((item, index) => ({
      elementId: item.id,
      relationTableName: item.relationTableName,
      relationColumnName: item.relationColumnName,
      displayName: item.displayName,
      columnSpan: item.columnSpan,
      sno: beforeMaxSno + index + 1,
    }));
    updateListState({ seniorFilterList: [...seniorFilterList, ...addList] });
    handleCloseModal();
  }
  render() {
    const { isPC, modelName, visibleModal, handleCloseModal, seniorFilterList } = this.props;
    const { selectedRowKeys, pageNum, pageSize } = this.state;
    let tabElementList = [];
    if (isPC) {
      tabElementList = this.props.framePage.tabElementList;
    } else {
      const { tabBasicData, elementListMap } = this.props.bundleConfig;
      tabElementList = elementListMap[tabBasicData.id];
    }
    const selectedList = tabElementList.filter(item => selectedRowKeys.includes(item.id));
    const rowSelection = {
      selectedRowKeys,
      getCheckboxProps: record => ({
        disabled: seniorFilterList.find(item => record.id === item.elementId),
      }),
      onSelectAll: (selected, selectedRows) => {
        this.handleSelect(selectedRows);
      },
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.handleSelect(selectedRows);
      },
    };
    const pagination = {
      total: tabElementList.length,
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
      <CreateModal
        visible={visibleModal}
        title={<FormattedMessage id="tab.seniorFilter.eleList" />}
        onOk={this.handleSave}
        onCancel={handleCloseModal}
      >
        <CTable
          dataSource={tabElementList}
          columns={this.setColumns()}
          rowSelection={rowSelection}
          pagination={pagination}
          onClickRow={this.onClickRow}
          rowKey="id"
        />
      </CreateModal>

    );
  }
}

export default TabElementTable;
