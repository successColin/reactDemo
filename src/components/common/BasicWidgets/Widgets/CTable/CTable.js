/*
 * @Author: Fus
 * @Date:   2019-08-06 10:33:41
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-04-11 10:32:26
 * @Desc: 表格组件 基于antd的表格
 */
import { Component } from 'react';
import { Table } from 'antd';
import { connect } from 'dva';
import classNames from 'classnames';
import { BaseContext } from '@/constants/global';
import { FormattedMessage } from 'react-intl';
import styles from './CTable.less';

const initPageSizeOptions = ['10', '20', '50', '100', '200', '500', '1000'];
@connect(state => ({
  langLib: state.global.langLib, // 本地语言包内容
}))
class CTable extends Component {
  static contextType = BaseContext
  render() {
    const { pagination = {}, onClickRow, langLib, ...restProps } = this.props;
    const { total = 0, current = 1, pageSize = 10, onChange, pageSizeOptions = initPageSizeOptions } = pagination;
    const className = classNames({
      [styles.table]: true,
      [this.props.className]: true,
    });
    const initProps = {
      // bordered: true,
      size: 'small',
      scroll: { x: 'max-content', y: 100 },
      pagination: pagination ? {
        showLessItems: true,
        showQuickJumper: true,
        showTotal: total => langLib['table.total'](total),
        showSizeChanger: true,
        total,
        current,
        pageSize,
        pageSizeOptions,
        onChange: (current, pageSize) => onChange && onChange(current, pageSize),
        onShowSizeChange: (current, pageSize) => onChange && onChange(current, pageSize),
        ...pagination,
      } : false,
      onRow: record => ({
        onClick: event => onClickRow && onClickRow(record),
      }),
      // rowClassName: (record, index) => {
      //   let className = 'custom-table-light-row';
      //   if (index % 2 === 1) className = 'custom-table-dark-row';
      //   return className;
      // },
    };
    const tableProps = {
      ...initProps,
      ...restProps,
      className,
    };
    return (
      <Table {...tableProps} />
    );
  }
}
export default CTable;
