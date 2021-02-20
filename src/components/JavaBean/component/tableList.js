import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { Row, Col, Input, Icon, Table, Modal, Menu, message, Form, Tooltip } from 'antd';
import Styles from '../javaBean.less';
import CTable from '@/components/common/BasicWidgets/Widgets/CTable/CTable';
import { CMessage, CSearch } from '@/components/common/BasicWidgets';
import DetialModal from '@/components/JavaBean/DetialModal';
import { getDefaultConfirmProps } from '@/utils/common';
import { delJavaBeanFiled, updateLog } from '@/services/javaBean';
import { BaseContext } from '@/constants/global';
import Checkbox from 'antd/lib/checkbox';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const { Search } = Input;
const { confirm } = Modal;

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class TableBox extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      record: {},
      title: '',
      visible: false,
      type: '',
      searchData: [],
      recordRow: {},
      initDataSource: [],
      dataSource: [],
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    this.setState({
      dataSource: nextProps.dataSoucre,
      initDataSource: nextProps.dataSoucre,
    });
  }

  /**
   * 跳出对应的弹框
   * @param title
   * @param type
   */
  addNewJavaBean = (title, type) => {
    let { activeDetail } = this.props;
    const { langLib } = this.context;
    if (type === 'tableField' && JSON.stringify(this.state.activeDetail) === '{}') {
      CMessage(langLib['java.else.choose'], 'error');
      return;
    } else if (type === 'tableField_edit' && JSON.stringify(this.state.recordRow) === '{}') {
      CMessage(langLib['java.else.chooseone'], 'error');
      return;
    } else if (type === 'tableField_edit' && this.state.recordRow.initialData) {
      CMessage(langLib['java.else.initData'], 'error');
      return;
    } else {
      if (type === 'tableField' && activeDetail) {
        let data = { tableName: activeDetail.tableName };
        this.setState({ recordRow: data });
      }
    }
    this.setState({ title, visible: !this.state.visible, type });
  };
  toggle = () => {
    this.setState({ visible: !this.state.visible });
  };
  /**
   * 修改完值刷新F
   * @param val
   * @param callback
   */
  changeVisible = (val, type) => {
    const { getTableList } = this.props;
    this.setState({ visible: val }, () => {
      setTimeout(() => {
        if (type === 'tableField') {
          this.setState({ recordRow: {}, columnName: '' });
          getTableList();
        } else {
          this.getJavaBeanList({});
        }
      }, 0);
    });
  };
  /**
   * 选中行
   * @param recordROw
   * @returns {{onClick: onClick}}
   */
  onClickRow = (recordRow) => {
    return {
      onClick: () => {
        this.setState({
          recordRow,
        });
      },
    };
  };
  /**
   * 设置行样式
   * @param record
   * @returns {string}
   */
  setRowClassName = (record) => {
    return record.columnName === this.state.recordRow.columnName ? 'clickRowStyl' : '';
  };
  /**
   * 删除表字段
   */
  deleteJavaBeanList = () => {
    const { langLib } = this.context;
    if (JSON.stringify(this.state.recordRow) !== '{}') {
      const { getTableList } = this.props;
      if (this.state.recordRow.initialData === 1) {
        CMessage(langLib['message.not.defaults'], 'error');
      } else {
        let { close } = ModalBox.confirm({
          title: <FormattedMessage id="confirm.del"/>,
          ...getDefaultConfirmProps(langLib),
          onOk: () => {
            let data = {
              tableName: this.state.recordRow.tableName,
              id: this.state.recordRow.id,
              columnName: this.state.recordRow.columnName,
            };
            delJavaBeanFiled(data).then(res => {
              getTableList();
              closeModal();
            });
          },
          onCancel: () => closeModal(),
        });
        const closeModal = () => {
          close();
        };
      }
    } else {
      message.error(langLib['confirm.choose.delete']);
    }
  };
  // 查找
  doSearch = (value) => {
    const { dataSource, initDataSource } = this.state;
    this.setState({
      loading: true,
    });
    if (value) {
      let searchData = initDataSource.filter(item => item.columnName && item.columnName.indexOf(value) > -1 || item.displayColumn && item.displayColumn.indexOf(value) > -1);
      this.setState({
        dataSource: searchData,
        loading: false,
      });
    } else {
      this.setState({
        dataSource: initDataSource,
        loading: false,
      });
    }

  };
  // 是否开启日志
  updateLogenable = (e, record) => {
    const { getTableList } = this.props;
    let params = {
      ...record,
      logenable: e.target.checked ? 1 : 0,
    };
    const { langLib } = this.context;
    updateLog(params).then(res => {
      message.success(langLib['message.save.success']);
      getTableList();
    });
  };

  // 渲染列名
  returnColumnsTitle = (title, width) => {
    return <Tooltip title={title} placement={'topLeft'}>
      <div style={{
        'display': 'block',
        'width': width,
        'overflow': 'hidden',
        'whiteSpace': 'nowrap',
        'textOverflow': 'ellipsis',
      }}>{title}</div>
    </Tooltip>;

  };

  updateState = (itemObj, callback) => {
    this.setState({
      ...itemObj,
    }, () => {
      callback && callback();
    });
  };

  render() {
    const { form, functionData, loading } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    const { langLib } = this.context;
    const { visible, title, type, record, recordRow, dataSource, initDataSource } = this.state;
    const columns = [
      {
        title: this.returnColumnsTitle(<FormattedMessage id="global.index"/>, '84px'),
        dataIndex: 'sno',
        key: 'sno',
        ellipsis: true,
        width: 100,
        render: (text, record, index) => {
          return <span>{text}</span>;
        },
      },
      {
        title: this.returnColumnsTitle(<FormattedMessage id="javaBean.right.columnComment"/>),
        dataIndex: 'displayColumn',
        key: 'displayColumn',
        width: '200px',
        render: (text, record) => {
          return <span title={text} style={{
            'display': 'block',
            'width': '184px',
            'overflow': 'hidden',
            'whiteSpace': 'nowrap',
            'textOverflow': 'ellipsis',
          }}>{text}</span>;
        },
      },
      {
        title: this.returnColumnsTitle(<FormattedMessage id="javaBean.right.columnName"/>),
        dataIndex: 'columnName',
        width: 200,
        key: 'columnName',
      },
      {
        title: this.returnColumnsTitle(<FormattedMessage id="global.required"/>, '84px'),
        dataIndex: 'requisite',
        key: 'requisite',
        width: 100,
        render: (text, record, index) => {
          return <span>{record.requisite === 1 ? <FormattedMessage id="global.yes"/> :
            <FormattedMessage id="global.no"/>}</span>;
        },
      },
      {
        title: this.returnColumnsTitle(<FormattedMessage id="javaBean.right.dataType"/>, '84px'),
        dataIndex: 'columnType',
        key: 'columnType',
        width: 100,
        render: (text, record) => {
          let type;
          if (text === 1) {
            type = 'varchar';
          } else if (text === 2) {
            type = 'int';
          } else if (text === 3) {
            type = 'datetime';
          } else if (text === 4) {
            type = 'decimal';
          } else if (text === 5) {
            type = 'text';
          } else if (text === 6) {
            type = 'blob';
          } else if (text === 7) {
            type = 'tinyint';
          }
          return (<span>{type}</span>);
        },
      },
      {
        title: this.returnColumnsTitle(<FormattedMessage id="javaBean.right.columnLength"/>, '84px'),
        dataIndex: 'columnLength',
        key: 'columnLength',
        width: 100,
      },
      {
        title: this.returnColumnsTitle(<FormattedMessage id="javaBean.modal.log"/>),
        dataIndex: 'logenable',
        key: 'logenable',
        render: (text, record) => {
          return <Checkbox checked={!!record.logenable} onChange={(e) => {
            this.updateLogenable(e, record);
          }}></Checkbox>;
        },
      },
    ];
    return <div className={Styles.rightBox}>
      <div className={Styles.searchHead}>
        <div className={Styles.headLeft}>
          {canadd ? <div className={Styles.btn}
                         onClick={() => this.addNewJavaBean(<FormattedMessage
                           id="javaBean.modal.addtitle"/>, 'tableField')}>
            <Icon className={`${Styles.addnewBtnIco} custom-color`} type="plus-square"/>
            <FormattedMessage id="global.new"/>
          </div> : null}
          {canmodify ? <div className={Styles.btn} onClick={() => this.addNewJavaBean(<FormattedMessage
            id="javaBean.modal.edittitle"/>, 'tableField_edit')}>
            <span className={`${Styles.addnewBtnIco} custom-color iconfont iconEdit`}></span>
            <FormattedMessage id="global.edit"/>
          </div> : null}
          {candelete ? <div className={Styles.btn} onClick={() => this.deleteJavaBeanList()}>
            <span className={`${Styles.addnewBtnIco} custom-color iconfont icondelete`}></span>
            <FormattedMessage id="global.del"/>
          </div> : null}
        </div>
        <div className={Styles.headRight}>
          <Search
            className={Styles.rightInputSearch}
            placeholder={langLib['form.placeholder.keywords']}
            onSearch={value => this.doSearch(value)}
            style={{ width: 200 }}
          />
        </div>
      </div>
      <div className={Styles.tabkeBox}>
        <CTable
          columns={columns}
          dataSource={dataSource}
          rowKey={record => record.id}
          pagination={false}
          loading={loading}
          type={type}
          scroll={{ y: 'calc(100vh - 210px)' }}
          onRow={this.onClickRow}
          rowClassName={this.setRowClassName}
        />
        <DetialModal
          changeVisible={this.changeVisible}
          recordRow={recordRow}
          updateState={this.updateState}
          dataSoucre={initDataSource}
          title={title}
          visible={visible}
          type={type}
          onCancel={() => this.toggle()}
        />
      </div>
      ;
    </div>;
    ;
  }
}

export default TableBox;
