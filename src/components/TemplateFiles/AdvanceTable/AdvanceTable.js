/*
 * @Author: Fus
 * @Date:   2019-08-07 15:12:24
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-28 18:21:58
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
    getExpandedRowComponent: () => {
    }, // 获取嵌套子组件
    rowKey: 'rowIndex', // 行标识
    setParentState: () => {
    }, // 更新容器组件内状态
    delType: 'static', // 删除方式 static静态删除，前端数据处理  async接口删除
    delFunc: () => {
    }, // 删除行函数
  };
  // 拖拽行
  moveRow = (dragIndex, hoverIndex) => {
    const { dataSource, setParentState, rowKey, form } = this.props;
    form && form.resetFields();
    const dragRow = dataSource[dragIndex];
    let newDataSource = update(dataSource, {
      $splice: [[dragIndex, 1], [hoverIndex, 0, dragRow]],
    });
    newDataSource = newDataSource.map((item, index) => ({ ...item, [rowKey]: index + 1 }));
    console.log(newDataSource);
    setParentState({ dataSource: newDataSource });
  };
  // 删除行
  delRow = (record, index) => {
    const { dataSource, setParentState, delType, delFunc } = this.props;
    // 静态删除数据
    const staticFunc = () => {
      const newDataSource = update(dataSource, {
        $splice: [[index, 1]],
      });
      setParentState({ dataSource: newDataSource, isDel: true });
    };
    if (delType === 'static') {
      staticFunc();
    } else {
      delFunc && delFunc(record, staticFunc);
    }
  };
  clickTr = (e, record) => {
    console.log(record);
    this.props.rowClick(record);
  };

  render() {
    const { rowClassName, className, columns, dataSource, getExpandedRowComponent, activeRow, rowKey, loading, rowSelection } = this.props;
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
      width: 40,
      render: () => <span className="iconfont icon-drag"/>,
    }, ...columns,
    ];
    const components = {
      body: {
        row: DragableBodyRow,
      },
    };
    // 嵌套子内容
    const expandedRowRender = record => getExpandedRowComponent(record);
    const expandedRowKeys = activeRow[rowKey] ? [activeRow[rowKey]] : [];
    return (
      <div className={styles.wrap}>
        <DndProvider backend={HTML5Backend}>
          <Table
            className={className}
            columns={newColumns}
            dataSource={dataSource}
            components={components}
            expandedRowRender={expandedRowRender}
            expandedRowKeys={expandedRowKeys}
            expandIcon={() => null}
            rowKey={rowKey}
            rowClassName={rowClassName}
            rowSelection={rowSelection}
            onRow={(record, index) => {
              return {
                index,
                moveRow: this.moveRow,
                onClick: (e) => this.clickTr(e, record),
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
