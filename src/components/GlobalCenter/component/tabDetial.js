import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs, Checkbox, Modal, Icon, Input } from 'antd';
import FormConfigDetial from './formDetial';
import { BaseContext } from '@/constants/global';
import CTable from '@/components/TemplateFiles/AdvanceTable/AdvanceTable';
import CModal from '@/components/common/CreateModal/CreateModal';
import DetailModal from './newDetial';
import { CMessage } from '@/components/common/BasicWidgets';
import { getDefaultConfirmProps } from '@/utils/common';
import { getImportAllDetial, delDetial, insertDetial, updateDetial } from '@/services/templateFiles';
import Styles from '@/components/TemplateFiles/TemplateFiles.less';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const { TabPane } = Tabs;
const { confirm } = Modal;
const { Search } = Input;

class TabName extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super();
    this.state = {
      detial: {}, // 详情,
      dataSource: [], // 所有字段
      loading: false,
      visible: false,
      title: '', // 弹框名称
      record: {}, // 选中数据
      type: '',
      selectedRowsIds: [], // 选中的id
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      detial: props.activeDetail,
    });
  }

  // 更新拖拽的数据
  setActiveDetailData = (dataSource) => {
    this.setState(dataSource);
  };
  /**
   *删除
   */
  delete = () => {
    const { langLib } = this.context;
    const { selectedRowsIds } = this.state;
    if (!selectedRowsIds.length) {
      CMessage(langLib['message.please.choose'], 'error');
      return;
    }
    let that = this;
    let { close } = ModalBox.confirm({
        ...getDefaultConfirmProps(langLib),
        content: '',
        onOk() {
          delDetial(selectedRowsIds.join(',')).then(res => {
            that.getList();
            closeModal();
            that.setState({
              record: {},
            });
          });
        },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
    // confirm({
    //   className: 'customConfirmColor',
    //   ...getDefaultConfirmProps(langLib),
    //   content: '',
    //   onOk() {
    //     delDetial(selectedRowsIds.join(',')).then(res => {
    //       that.getList();
    //       that.setState({
    //         record: {},
    //       });
    //     });
    //   },
    //   onCancel() {
    //   },
    // });
  };
  // 获取表字段列表
  getList = () => {
    const { id } = this.state.detial;
    this.setState({
      loading: true,
    });
    getImportAllDetial(id).then((res) => {
      this.setState({
        dataSource: res,
        loading: false,
      });
    }).catch(err => this.setState({
        loading: false,
      }),
    );
  };
  toggle = (title, type, isFlag) => {
    if (type === 'edit') {
      this.changeIsNull(title, type, isFlag);
    } else {
      this.setState({
        title, type,
        visible: isFlag,
        record: {},
      });
    }
  };
  // 编辑
  changeIsNull = (title, type, isFlag) => {
    const { langLib } = this.context;
    const { record } = this.state;
    if (JSON.stringify(record) === '{}') {
      CMessage(langLib['message.please.choose'], 'error');
    } else {
      this.setState({
        title, type,
        visible: isFlag,
      });
    }
  };
  handleSubmit = () => {
    const { type, detial } = this.state;
    let data = this.refs.formDetial.getFieldsValue();
    if (type === 'add') {
      let params = Object.assign({}, { improtmodelId: detial.id }, data);
      insertDetial(params).then(res => {
        this.getList();
        this.toggle('', '', false);
        this.setState({
          record: {},
        });
      });
    } else {
      let params = Object.assign({}, this.state.record, data);
      updateDetial(params).then(res => {
        this.getList();
        this.toggle('', '', false);
      });
    }
  };
  /**
   * 面板切换
   * @param active
   */
  changeTabActive = (active) => {
    if (active === 'tabname') {
      this.getList();
    }
    this.setState({
      record: {},
    });
    this.props.changeTab(active);
  };
  /**
   * 设置行样式
   * @param record
   * @returns {string}
   */
  setRowClassName = (record) => {
    return record.id === this.state.record.id ? 'clickRowStyl' : '';
  };
  /**
   * 选中行
   * @param recordROw
   * @returns {{onClick: onClick}}
   */
  onClickRow = (recordRow) => {
    this.setState({
      record: recordRow,
    });
  };

  render() {
    const { tabsActive, className } = this.props;
    const { loading, dataSource, title, visible } = this.state;
    const columns = [{
      title: <FormattedMessage id="global.index"/>,
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      width: 50,
    }, {
      title: <FormattedMessage id="javaBean.right.columnName"/>,
      dataIndex: 'name',
      key: 'name',
    }, {
      title: <FormattedMessage id="import.form.row"/>,
      dataIndex: 'keycode',
      key: 'keycode',
    }, {
      title: <FormattedMessage id="import.form.tabname"/>,
      dataIndex: 'relationTableName',
      key: 'relationTableName',
    }, {
      title: <FormattedMessage id="import.form.tabnamefield"/>,
      dataIndex: 'relationColumnName',
      key: 'relationColumnName',
    }, {
      title: <FormattedMessage id="global.required"/>,
      dataIndex: 'notNull',
      key: 'notNull',
      render: (text, record) => {
        let textRender = record.notNull ? (<span><FormattedMessage id="global.yes"/></span>) : (
          <span><FormattedMessage id="global.no"/></span>);
        return <div>{textRender}</div>;
      },
    }, {
      title: <FormattedMessage id="javaBean.right.dataType"/>,
      dataIndex: 'columnType',
      key: 'columnType',
      render: (text, record) => {
        let textRender;
        if (record.columnType === 1) {
          textRender = <FormattedMessage id="global.varchar"/>;
        } else if (record.columnType === 2) {
          textRender = <FormattedMessage id="global.numerical"/>;
        } else if (record.columnType === 3) {
          textRender = <FormattedMessage id="global.date"/>;
        }
        return <div>{textRender}</div>;
      },
    }, {
      title: <FormattedMessage id="javaBean.right.columnLength"/>,
      dataIndex: 'columnLength',
      key: 'columnLength',
    }, {
      title: <FormattedMessage id="global.format"/>,
      dataIndex: 'columnFormat',
      key: 'columnFormat',
      render: (text, record) => {
        let textRender;
        if (record.columnFormat === 1) {
          textRender = 'YYYY-MM-DD hh:mm:ss';
        } else if (record.columnFormat === 2) {
          textRender = 'YYYY-MM-DD';
        } else if (record.columnFormat === 3) {
          textRender = 'hh:mm:ss';
        } else {
          textRender = '';
        }
        return <div>{textRender}</div>;
      },
    }];
    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        let { selectedRowsIds } = this.state;
        console.log(selectedRowKeys, selectedRows);
        if (selectedRows.length) {
          let arr = selectedRows.length && selectedRows.map((item) => {
            return item.id;
          });
          console.log(arr);
          selectedRowsIds = [...arr];
          this.setState({
            selectedRowsIds,
          });
        } else {
          this.setState({
            selectedRowsIds: [],
          });
        }
      },
    };
    return (
      <FormConfigDetial {...this.props}/>
    );
  }
}

export default TabName;

