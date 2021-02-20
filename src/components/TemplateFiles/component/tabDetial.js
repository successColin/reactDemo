import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { Tabs, Checkbox, Modal, Icon, Input, Tooltip } from 'antd';
import FormConfigDetial from './formDetial';
import { BaseContext } from '@/constants/global';
import CTable from '@/components/TemplateFiles/AdvanceTable/AdvanceTable';
import CModal from '@/components/common/CreateModal/CreateModal';
import DetailModal from './newDetial';
import { CMessage } from '@/components/common/BasicWidgets';
import { getDefaultConfirmProps } from '@/utils/common';
import { getImportAllDetial, delDetial, insertDetial, updateDetial } from '@/services/templateFiles';
import { getJavaDetialById } from '@/services/javaBean';
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
      _dataSource: [],
      dataSource: [], // 所有字段
      loading: false,
      visible: false,
      title: '', // 弹框名称
      record: {}, // 选中数据
      type: '',
      selectedRowsIds: [], // 选中的id
      selectedRowArr: [], // 选择的行
      arr: [],
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
    const { selectedRowArr } = this.state;
    if (!selectedRowArr.length) {
      CMessage(langLib['message.please.choose'], 'error');
      return;
    }
    let that = this;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      content: '',
      onOk() {
        let ids = selectedRowArr.map(item => item.id).join(',');
        delDetial(ids).then(res => {
          that.getList();
          closeModal();
          CMessage(langLib['message.del.success'], 'success');
          that.setState({
            record: {},
            selectedRowArr: [],
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
    //     let ids = selectedRowArr.map(item => item.id).join(',');
    //     delDetial(ids).then(res => {
    //       that.getList();
    //       CMessage(langLib['message.del.success'], 'success');
    //       that.setState({
    //         record: {},
    //         selectedRowArr: [],
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
        _dataSource: res,
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
        selectedRowArr: [],
      });
    }
  };
  // 编辑
  changeIsNull = (title, type, isFlag) => {
    const { langLib } = this.context;
    const { record, selectedRowArr } = this.state;
    if (selectedRowArr.length !== 1) {
      CMessage(langLib['message.pease.choose.one'], 'error');
    } else {
      this.setState({
        title, type,
        record: selectedRowArr[0],
        visible: isFlag,
      });
    }
  };
  handleSubmit = () => {
    const { type, detial, _dataSource } = this.state;
    const { langLib } = this.context;
    this.refs.formDetial.validateFields().then(data => {
      const { _dataSource } = this.state;
      if (type === 'add') {
        let params = Object.assign({}, { improtmodelId: detial.id, sno: _dataSource.length + 1 }, data);
        insertDetial(params).then(res => {
          CMessage(langLib['message.save.success'], 'success');
          this.getList();
          this.toggle('', '', false);
          this.setState({
            record: {},
            selectedRowArr: [],
          });
        });
      } else {
        let params = Object.assign({}, this.state.record, { columnFormat: 0 }, data);
        updateDetial(params).then(res => {
          this.getList();
          CMessage(langLib['message.save.success'], 'success');
          this.toggle('', '', false);
        });
      }
    }).catch(err => console.log(err));
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
      selectedRowArr: [],
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
  clickRow = (recordRow) => {
    let { selectedRowArr = [] } = this.state;
    let index = selectedRowArr.findIndex((item) => {
      return item.id === recordRow.id;
    });
    if (index !== -1) {
      selectedRowArr.splice(index, 1);
    } else {
      selectedRowArr.push(recordRow);
    }
    this.setState({
      record: recordRow,
      selectedRowArr,
    });
  };
  onClickRow = (record, selectedRows) => {
    this.setState({
      selectedRowArr: selectedRows,
    });
  };
  doSearch = (value) => {
    let { _dataSource } = this.state;
    let searchArr = JSON.parse(JSON.stringify(_dataSource)).filter((item) => {
      return item.keycode && item.keycode.indexOf(value) > -1 || item.relationColumnName && item.relationColumnName.indexOf(value) > -1 || item.relationTableName && item.relationTableName.indexOf(value) > -1 || item.name && item.name.indexOf(value) > -1;
    });
    if (value) {
      this.setState({
        dataSource: searchArr,
      });
    } else {
      this.setState({
        dataSource: _dataSource,
      });
    }

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

  render() {
    const { tabsActive, className, activeDetail } = this.props;
    const { loading, dataSource, title, visible, selectedRowArr, type, _dataSource } = this.state;
    const { form, functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    const { langLib } = this.context;
    const columns = [{
      title: this.returnColumnsTitle(<FormattedMessage id="global.index"/>, '34px'),
      dataIndex: 'sno',
      key: 'sno',
      align: 'center',
      width: 50,
      render: (text, record, index) => {
        return <span>{index + 1}</span>;
      },
    }, {
      title: this.returnColumnsTitle(<FormattedMessage id="javaBean.right.columnName"/>),
      dataIndex: 'name',
      key: 'name',
    }, {
      title: this.returnColumnsTitle(<FormattedMessage id="import.form.row"/>),
      dataIndex: 'keycode',
      key: 'keycode',
    }, {
      title: this.returnColumnsTitle(<FormattedMessage id="import.form.tabname"/>, '89px'),
      dataIndex: 'relationTableName',
      key: 'relationTableName',
      width: '105px',
    }, {
      title: this.returnColumnsTitle(<FormattedMessage id="import.form.tabnamefield"/>, '89px'),
      dataIndex: 'relationColumnName',
      key: 'relationColumnName',
      width: '105px',
    }, {
      title: this.returnColumnsTitle(<FormattedMessage id="global.required"/>, '34px'),
      dataIndex: 'notNull',
      key: 'notNull',
      width: '50px',
      render: (text, record) => {
        let textRender = record.notNull ? (<span><FormattedMessage id="global.yes"/></span>) : (
          <span><FormattedMessage id="global.no"/></span>);
        return <div>{textRender}</div>;
      },
    }, {
      title: this.returnColumnsTitle(<FormattedMessage id="javaBean.right.dataType"/>, '64px'),
      dataIndex: 'columnType',
      key: 'columnType',
      width: '80px',
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
      title: this.returnColumnsTitle(<FormattedMessage id="javaBean.right.columnLength"/>, '64px'),
      dataIndex: 'columnLength',
      key: 'columnLength',
      width: '80px',
    }, {
      title: this.returnColumnsTitle(<FormattedMessage id="global.format"/>),
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
      columnWidth: '35px',
      selectedRowKeys: selectedRowArr.map(item => item.id),
      onSelectAll: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selected);
      },
      onSelect: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selectedRows);
      },
      onChange: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRow(record, selectedRows);
      },
    };
    return (<Tabs
      defaultActiveKey={tabsActive}
      activeKey={tabsActive}
      animated={false}
      className={`${className} userTabStyle`}
      onChange={(activeKey) => this.changeTabActive(activeKey)}
    >
      <TabPane tab={<FormattedMessage id="splitLine.title.basic"/>} key="base">
        <FormConfigDetial {...this.props}/>
      </TabPane>
      <TabPane tab={<FormattedMessage id="import.form.include"/>} key="tabname">
        <div className={Styles.searchHead}>
          <div className={Styles.headLeft}>
            {canadd ?
              <div className={Styles.btn} onClick={() => this.toggle(<FormattedMessage id="global.new"/>, 'add', true)}>
                <Icon className={`${Styles.addnewBtnIco} custom-color`} type="plus-square"/>
                <FormattedMessage id="global.new"/>
              </div> : null}
            {canmodify ? <div className={Styles.btn}
                              onClick={() => this.toggle(<FormattedMessage id="global.edit"/>, 'edit', true)}>
              <span className={`${Styles.addnewBtnIco} custom-color iconfont iconEdit`}></span>
              <FormattedMessage id="global.edit"/>
            </div> : null}
            {candelete ? <div className={Styles.btn} onClick={() => this.delete()}>
              <span className={`${Styles.addnewBtnIco} custom-color iconfont icondelete`}></span>
              <FormattedMessage id="global.del"/>
            </div> : null}
            {/* <div className={Styles.btn}> */}
            {/*  <span className={`${Styles.addnewBtnIco} iconImport iconfont`}></span>*/}
            {/*  <FormattedMessage id="menu.header.import"/>*/}
            {/* </div> */}
            {/* <div className={Styles.btn}> */}
            {/*  <span className={`${Styles.addnewBtnIco} iconImport iconfont`}></span>*/}
            {/*  <FormattedMessage id="menu.header.export"/>*/}
            {/* </div> */}
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
        <CTable
          className={Styles.tabHeight}
          columns={columns}
          dataSource={dataSource}
          setParentState={this.setActiveDetailData}
          rowKey={record => record.id}
          loading={loading}
          rowClick={this.clickRow}
          // rowClassName={this.setRowClassName}
          rowSelection={rowSelection}
        />
        <CModal
          visible={visible}
          title={title}
          size="default"
          onCancel={() => {
            this.toggle('', '', false);
          }}
          onOk={() => {
            this.handleSubmit();
          }}
        >
          <DetailModal
            ref="formDetial"
            detial={type === 'add' ? {} : selectedRowArr[0] || {}}
            activeDetail={activeDetail}
            dataSource={_dataSource}
          />
        </CModal>
      </TabPane>
    </Tabs>);
  }
}

export default TabName;
