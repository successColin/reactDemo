/*
 * @Author: Fus
 * @Date:   2019-09-24 14:08:55
 * @Desc: 多级关联条件
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { CTable, SearchSelect, CButton } from '@/components/common/BasicWidgets';
import { getFiledRelation } from '@/services/pageConfig';
import styles from './MultiRelateTable.less';

class MultiRelateTable extends Component {
  state = {
    // listData: [{ index: 0 }], // 列表数据源
    loading: false,
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = () => {
    const { elementData } = this.props;
    const { id: elementId } = elementData;
    this.setState({ loading: true });
    getFiledRelation({ elementId }).then(FiledRelateList => {
      this.setState({
        loading: false,
      });
      this.props.setWrapState({ FiledRelateList });
    }, err => this.setState({ loading: false }));
  };
  // 新增数据
  handleAddRow = () => {
    const { multiRelateList, elementData } = this.props;
    const { mainTableName, relationTableName } = elementData;
    const newList = [...multiRelateList];
    newList.push({
      sno: multiRelateList.length + 1,
      elementId: elementData.id,
      mainTableName,
      relationTableName,
    });
    this.props.setWrapState({ FiledRelateList: newList });
  };
  // 删除数据
  handleMinusRow = (index) => {
    const { multiRelateList } = this.props;
    const newList = [...multiRelateList];
    newList.splice(index, 1);
    this.props.setWrapState({ FiledRelateList: newList });
  };
  // 更新数据
  setRowData = ({ key, value, index }) => {
    const { multiRelateList } = this.props;
    const newList = [...multiRelateList];
    newList[index] = {
      ...newList[index],
      [key]: value,
    };
    this.props.setWrapState({ FiledRelateList: newList });
  };
  // 获取列名
  getColumns = () => {
    return [
      {
        dataIndex: 'mainTableName',
        title: <FormattedMessage id="settingForm.mainTableName"/>,
        render: (text, record, index) => (
          <SearchSelect
            value={record.mainTableName}
            modalContentType="relateTable"
            showType="list"
            isReadOnly={true}
            setSelected={selectedRows => this.setRowData({
              key: 'mainTableName',
              value: selectedRows[0] && selectedRows[0].tableName || '',
              index,
            })}
          />
        ),
      }, {
        dataIndex: 'mainColumn',
        title: <FormattedMessage id="settingForm.columnName"/>,
        render: (text, record, index) => (
          <SearchSelect
            value={record.mainColumn}
            isReadOnly={false}
            modalContentType="tableColumn"
            showType="list"
            otherQueryParams={{ tableName: record.mainTableName }}
            selectConfig={{
              isMulti: false,
              keyName: 'columnName',
            }}
            setSelected={selectedRows => this.setRowData({
              key: 'mainColumn',
              value: selectedRows[0] && selectedRows[0].columnName || '',
              index,
            })}
          />
        ),
      }, {
        dataIndex: 'ignore-equal',
        title: '',
        width: 40,
        align: 'center',
        render: (text, record) => <span>=</span>,
      }, {
        dataIndex: 'relationTableName',
        title: <FormattedMessage id="settingForm.relationTableName"/>,
        render: (text, record, index) => (
          <SearchSelect
            value={record.relationTableName}
            modalContentType="relateTable"
            showType="list"
            isReadOnly={true}
            setSelected={selectedRows => this.setRowData({
              key: 'relationTableName',
              value: selectedRows[0] && selectedRows[0].tableName || '',
              index,
            })}
          />
        ),
      }, {
        dataIndex: 'relationColumn',
        title: <FormattedMessage id="settingForm.columnName"/>,
        render: (text, record, index) => (
          <SearchSelect
            value={record.relationColumn}
            modalContentType="tableColumn"
            showType="list"
            otherQueryParams={{ tableName: record.relationTableName }}
            selectConfig={{
              isMulti: false,
              keyName: 'columnName',
            }}
            setSelected={selectedRows => this.setRowData({
              key: 'relationColumn',
              value: selectedRows[0] && selectedRows[0].columnName || '',
              index,
            })}
          />
        ),
      }, {
        dataIndex: 'ignore-operator',
        title: <FormattedMessage id="global.operator"/>,
        render: (text, record, index) => (
          <div className={styles.operator}>
            {/* <span
              onClick={() => this.handleAddRow(index)}
              className="iconfont icon-add-border custom-color"
            /> */}
            {/* {multiRelateList.length > 1 && ( */}
            <span
              onClick={() => this.handleMinusRow(index)}
              className="iconfont icon-minus-border custom-color"
            />
            {/* )} */}
          </div>
        ),
      },
    ];
  };

  render() {
    const { loading } = this.state;
    const { multiRelateList } = this.props;
    return (
      <div className={styles.wrap}>
        <CButton className={styles.addBtn} onClick={this.handleAddRow}>
          <FormattedMessage id="global.addData"/>
        </CButton>
        <div className={styles.tableWrap}>
          <CTable
            columns={this.getColumns()}
            dataSource={multiRelateList}
            loading={loading}
            pagination={false}
            rowKey="sno"
          />
        </div>
      </div>
    );
  }
}

export default MultiRelateTable;
