/*
 * @Author: Fus
 * @Date:   2019-08-07 15:12:24
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-25 16:58:15
 * @Desc: 高级表格（带拖动、编辑、子表单配置等功能）
 */
import { Component } from 'react';
import { Table, Checkbox } from 'antd';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { DndProvider } from 'react-dnd';
import DragableBodyRow from './DragableBodyRow/DragableBodyRow';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import styles from './AdvanceTable.less';

class AdvanceTable extends Component {
  static defaultProps = {
    loading: false, // 加载中状态
    columns: [], // 列名
    dataSource: [], // 数据源
    activeRow: {}, // 当前行数据
    showOperator: true, // 是否显示操作列
    getExpandedRowComponent: () => { }, // 获取嵌套子组件
    rowKey: 'id', // 行标识
    dragColumnWidth: 40, // 拖拽图标列宽
    dragRowKey: 'sno', // 拖拽修改行标识
    setParentState: () => { }, // 更新容器组件内状态
    delType: 'static', // 删除方式 static静态删除，前端数据处理  async接口删除
    delFunc: () => { }, // 删除行函数
    rowSelection: false, // 行选择
    onClickRow: null, // 点击行
  }
  // 拖拽行
  moveRow = (dragIndex, hoverIndex) => {
    const { dataSource, setParentState, dragRowKey, form } = this.props;
    form && form.resetFields();
    const dragRow = dataSource[dragIndex];
    let newDataSource = update(dataSource, {
      $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
    });
    newDataSource = newDataSource.map((item, index) => ({ ...item, [dragRowKey]: index + 1 }));
    setParentState({ dataSource: newDataSource });
  };
  // 删除行
  delRow = (record, index) => {
    const { dataSource, setParentState, delType, delFunc, rowKey, dragRowKey } = this.props;
    // 静态删除数据
    const staticFunc = () => {
      const newDataSource = update(dataSource, {
        $splice: [[index, 1]],
      });
      // 删除后未点保存直接再加入新的组件时会出现重复sno
      // const result =  newDataSource.map((item, index) => ({ ...item, [dragRowKey]: index + 1 }));
      setParentState({ dataSource: newDataSource, isDel: true });
    };
    if (delType === 'static') {
      staticFunc();
    } else {
      delFunc && delFunc(record, staticFunc);
    }
  }
  render() {
    const { columns, dataSource, getExpandedRowComponent, activeRow, rowKey, loading, className, showOperator, rowSelection, dragColumnWidth, onClickRow } = this.props;
    const delIconCls = classNames({
      'iconfont': true,
      'icon-del': true,
      'custom-color': true,
      [styles.delIcon]: true,
    });
    const newColumns = [{
      title: '',
      dataIndex: 'drag',
      key: 'drag',
      className: 'custom-drag-td',
      align: 'center',
      width: dragColumnWidth,
      render: () => <span className="iconfont icon-drag" />,
    }, ...columns];
    showOperator && newColumns.push({
      title: <FormattedMessage id="global.operator" />,
      dataIndex: 'operator',
      key: 'operator',
      width: 60,
      render: (text, record, index) => <span onClick={() => this.delRow(record, index)} className={delIconCls} />,
    });
    const components = {
      body: {
        row: DragableBodyRow,
      },
    };
    // 嵌套子内容
    const expandedRowRender = record => getExpandedRowComponent(record);
    const expandedRowKeys = activeRow[rowKey] ? [activeRow[rowKey]] : [];
    const wrapCls = classNames({
      [styles.wrap]: true,
      [className]: className,
    });
    return (
      <div className={wrapCls}>
        <DndProvider backend={HTML5Backend}>
          <Table
            columns={newColumns}
            dataSource={dataSource}
            components={components}
            expandedRowRender={expandedRowRender}
            expandedRowKeys={expandedRowKeys}
            expandIcon={() => null}
            rowKey={rowKey}
            rowSelection={rowSelection}
            onRow={(record, index) => {
              return {
                index,
                moveRow: this.moveRow,
                onClick: event => onClickRow && onClickRow(record),
              };
            }}
            loading={loading}
            scroll={{ x: 'max-content', y: 100 }}
            size="small"
            pagination={false}
            bordered={false}
          />
        </DndProvider>
      </div>
    );
  }
}
export default AdvanceTable;