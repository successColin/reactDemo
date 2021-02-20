/*
 * @Author: Fus
 * @Date:   2019-11-12 14:17:30
 * @Desc: 资源管理器主表格
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Tooltip } from 'antd';
import { CMessage, CTable } from '@/components/common/BasicWidgets';
import LegendFooter from '../LegendFooter/LegendFooter';
import styles from './MainTable.less';

class MainTable extends Component {
  static defaultProps = {
    loading: false,
  };
  // 默认的列名
  getInitColumns = () => {
    return [
    //   {
    //   title: 'id',
    //   dataIndex: 'id',
    //   render: text => <span title={text}>{text}</span>,
    //   width: 60,
    //   // render: (text, record, index) => {
    //   //   return index + 1;
    //   // }
    // },
      {
      title: <FormattedMessage id="global.keycode"/>,
      dataIndex: 'keycode',
      width: 120,
      render: text => <span title={text}>{text}</span>,
    }, {
      title: <FormattedMessage id="global.name"/>,
      dataIndex: 'name',
      width: 150,
      render: text => <span title={text}>{text}</span>,
    }];
  };
  // 点击小水滴时做的条件判断
  doClickWaterDrop = (eleObj, record) => {
    const { jumpFunctionId, id, displayName, colorCode = '', relationTabId, defaultValue: originDefaultVal } = eleObj;
    if (relationTabId && !jumpFunctionId) { // 如果没有跳转菜单，就以弹框为主
      this.props.setPopupTabInfo({ eleObj, listRowData: record });
    }
    if (jumpFunctionId) {
      this.props.jumpMenu(eleObj, record);
    }
  };

  // 获取小水滴列名
  getSqlEditorColumns = (sqlElementList) => {
    // 列名
    const sqlColumns = [];
    // 总数
    const totalObj = {};
    sqlElementList.forEach(eleObj => {
      const { id, displayName, colorCode = '', relationTabId, defaultValue: originDefaultVal } = eleObj;
      const defaultValue = Number(originDefaultVal) || 0;
      sqlColumns.push({
        title: displayName,
        dataIndex: id,
        width: 80,
        render: (text, record) => {
          const showValue = text || defaultValue;
          const cls = classNames({
            'iconfont': true,
            'iconWater': true,
            [styles.icon]: true,
          });
          totalObj[id] = typeof totalObj[id] === 'number' ? totalObj[id] + showValue : showValue;
          return showValue ? (
            <Tooltip title={`${displayName}: ${showValue}`}>
              <i
                className={cls}
                style={{ color: colorCode }}
                onClick={() => this.doClickWaterDrop(eleObj, record)}
              />
            </Tooltip>
          ) : null;
        },
      });
    });
    return {
      sqlColumns,
      totalObj,
    };
  };

  render() {
    const { loading, mainListData = {}, elementMap = {}, tabInfo = {} } = this.props;
    const elementList = elementMap[tabInfo.id] || [];
    const sqlElementList = elementList.filter(item => item.visiabled);
    const { sqlColumns, totalObj } = this.getSqlEditorColumns(sqlElementList);
    const columns = [
      ...this.getInitColumns(),
      ...sqlColumns,
    ];
    return (
      <div className={styles.wrap}>
        <CTable
          columns={columns}
          className={styles.tableWrap}
          dataSource={mainListData}
          rowSelection={false}
          loading={loading}
          pagination={false}
          rowKey="id"
        />
        <LegendFooter
          elementList={sqlElementList}
          totalObj={totalObj}
        />
      </div>
    );
  }
}

export default MainTable;
