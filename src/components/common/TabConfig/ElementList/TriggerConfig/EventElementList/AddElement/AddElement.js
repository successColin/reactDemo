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
import { getTabElementList } from '@/services/pageConfig';
import { FormattedMessage } from 'react-intl';

@connect(state => ({
  triggerState: state.triggerState,
}))
class AddElement extends Component {
  static contextType = BaseContext
  state = {
    loading: false,
    pageNum: 1,
    pageSize: 10,
  }
  componentDidMount() {
    // this.fetchElementData();
  }
  // 获取控件列表
  fetchElementData = () => {
    // const { triggerEventConfig } = this.props.triggerState;
    // const { id } = triggerEventConfig.tabInfo;
    // this.setState({ loading: true });
    // getTabElementList({ tabId: id }).then(res => {
    //   this.setState({ loading: false });
    //   const tabElementList = res.map((item, index) => ({ index: index + 1, relationElementId: item.id, name: item.name }));
    //   this.context.dispatch({
    //     type: 'triggerState/updateState',
    //     payload: { tabElementList },
    //   });
    // }, err => this.setState({ loading: false }));
  }
  // 点击行
  onClickRow = (record) => {
    const { triggerState } = this.props;
    const { selectConfig, selectedElement, eventData, activeEventId } = triggerState;
    const activeEvent = eventData.find(item => item.id === activeEventId) || {};
    const triggerList = activeEvent.triggerDtoList || [];
    if (triggerList.find(item => record.relationElementId === item.relationElementId)) return;
    const { rowKey, isMulti, keyName } = selectConfig;
    let newSelectedElement = [...selectedElement];
    const activeIndex = newSelectedElement.findIndex(item => item.relationElementId === record.relationElementId);
    if (isMulti) {
      if (activeIndex === -1) {
        newSelectedElement.push(record);
      } else {
        newSelectedElement.splice(activeIndex, 1);
      }
    } else { // 单选
      newSelectedElement = [record];
    }
    this.context.dispatch({
      type: 'triggerState/updateState',
      payload: { selectedElement: newSelectedElement },
    });
  };
  handleSelect = (selectedRows) => {
    this.context.dispatch({
      type: 'triggerState/updateState',
      payload: { selectedElement: selectedRows },
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
    const { triggerState, rowKey } = this.props;
    const { loading, pageNum, pageSize } = this.state;
    const { tabElementList, selectConfig, eventData, activeEventId, selectedElement } = triggerState;
    const activeEvent = eventData.find(item => item.id === activeEventId) || {};
    const triggerList = activeEvent.triggerDtoList || [];
    const selectedRowKeys = selectedElement.map(item => item.relationElementId);
    const rowSelection = {
      selectedRowKeys,
      onSelectAll: (selected, selectedRows) => {
        this.handleSelect(selectedRows);
      },
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.handleSelect(selectedRows);
      },
      getCheckboxProps: record => ({
        disabled: triggerList.find(item => record.relationElementId === item.relationElementId),
      }),
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
        // // 清空已选的数据行
        // this.context.dispatch({
        //   type: 'triggerState/updateState',
        //   payload: { selectedElement: [] },
        // });
      },
    };
    return (
      <CTable
        columns={this.getColumns()}
        dataSource={tabElementList}
        rowSelection={rowSelection}
        onClickRow={this.onClickRow}
        pagination={pagination}
        loading={loading}
        rowKey="relationElementId"
      />
    );
  }
}
export default AddElement;
