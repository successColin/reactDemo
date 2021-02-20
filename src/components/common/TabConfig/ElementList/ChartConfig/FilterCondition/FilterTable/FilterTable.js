/*
 * @Author: Fus
 * @Date:   2020-02-25 14:59:47
 * @Desc: 筛选关系表格
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Select, Modal } from 'antd';
import { CTable, CSelect, CInput, CMessage } from '@/components/common/BasicWidgets';
import { TAB_FILTER_COND_TYPES } from '@/constants/pageConfig';
import { BaseContext } from '@/constants/global';
import { getDefaultConfirmProps } from '@/utils/common';
import { deleteChartFilter } from '@/services/homeChart';
import styles from './FilterTable.less';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const { Option } = Select;
// 关系下拉选项
const condTypeOptions = TAB_FILTER_COND_TYPES.map(item => <Option key={item} value={item}>{item}</Option>);

class FilterTable extends Component {
  static contextType = BaseContext;
  // 删除过滤条件
  handleDelete = (id, index) => {
    const { langLib } = this.context;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      onOk: () => {
        deleteChartFilter({ id }).then(res => {
          CMessage(langLib['message.del.success']);
          const { listData = [] } = this.props;
          const newList = [...listData];
          newList.splice(index, 1);
          this.props.setFilterConditionState({ listData: newList });
          closeModal();
        });
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
    // Modal.confirm({
    //   className: 'customConfirmColor',
    //   ...getDefaultConfirmProps(langLib),
    //   onOk: () => {
    //     return deleteChartFilter({ id }).then(res => {
    //       CMessage(langLib['message.del.success']);
    //       const { listData = [] } = this.props;
    //       const newList = [...listData];
    //       newList.splice(index, 1);
    //       this.props.setFilterConditionState({ listData: newList });
    //     });
    //   },
    // });
  };
  setFilterList = ({ key, value, record, index }) => {
    const { setFilterConditionState, listData } = this.props;
    const newList = [...listData];
    newList.splice(index, 1, {
      ...record,
      [key]: value,
    });
    setFilterConditionState({ listData: newList });
  };
  getColumns = () => {
    const { filterEleList } = this.props;
    return [
      {
        dataIndex: 'asqlLeftParenTheses',
        title: <FormattedMessage id="tab.filterCond.leftBracket"/>,
        render: (text, record, index) => (
          <CInput
            defaultValue={text}
            onBlur={e => this.setFilterList({
              key: 'asqlLeftParenTheses',
              value: e.target.value,
              record,
              index,
            })}
          />
        ),
      }, {
        dataIndex: 'relationElementId',
        title: <FormattedMessage id="pageConfig.col.widgetName"/>,
        render: (text, record, index) => {
          const eleObj = filterEleList.find(item => item.id === text) || {};
          return (
            <CInput
              defaultValue={eleObj.displayName || ''}
              disabled
            />
          );
        },
      }, {
        dataIndex: 'asqlColumnName',
        title: <FormattedMessage id="tab.filterCond.columnName"/>,
        render: (text, record, index) => (
          <CInput
            defaultValue={text}
            onBlur={e => this.setFilterList({
              key: 'asqlColumnName',
              value: e.target.value,
              record,
              index,
            })}
          />
        ),
      }, {
        dataIndex: 'asqlDecisionOperator',
        title: <FormattedMessage id="tab.filterCond.cond"/>,
        render: (text, record, index) => (
          <CInput
            defaultValue={text}
            onBlur={e => this.setFilterList({
              key: 'asqlDecisionOperator',
              value: e.target.value,
              record,
              index,
            })}
          />
        ),
      }, {
        dataIndex: 'asqlRightParenTheses',
        title: <FormattedMessage id="tab.filterCond.rightBracket"/>,
        render: (text, record, index) => (
          <CInput
            defaultValue={text}
            onBlur={e => this.setFilterList({
              key: 'asqlRightParenTheses',
              value: e.target.value,
              record,
              index,
            })}
          />
        ),
      }, {
        dataIndex: 'asqlRelationalOperator',
        title: <FormattedMessage id="tab.filterCond.relation"/>,
        render: (text, record, index) => (
          <CSelect
            value={text}
            style={{ width: '100%' }}
            onChange={value => this.setFilterList({
              key: 'asqlRelationalOperator',
              value,
              record,
              index,
            })}
          >
            <Option value=""><FormattedMessage id="global.null"/></Option>
            {condTypeOptions}
          </CSelect>
        ),
      }, {
        dataIndex: 'operator',
        title: <FormattedMessage id="global.operator"/>,
        width: 60,
        render: (text, record, index) => (
          <i
            className="iconfont custom-color icon-minus-border"
            onClick={() => this.handleDelete(record.id, index)}
          />
        ),
      },
    ];
  };

  render() {
    const { listData, loading } = this.props;
    return (
      <CTable
        className={styles.table}
        columns={this.getColumns()}
        dataSource={listData}
        loading={loading}
        pagination={false}
        rowKey="id"
      />
    );
  }
}

export default FilterTable;
