import React, { Component } from 'react';
import { Col, Row, Button, Icon, Input, Select, Table, Pagination, message, Modal } from 'antd';
import CInput from '../../../components/common/BasicWidgets/Widgets/CInput/CInput';
import { FormattedMessage } from 'react-intl';
import * as Server from '../../../services/menuManager';
import { deleteIds } from '@/services/menuManager';
import styles from '../MenuManager.less';
import DetialModal from '../DetialModal';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';
import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
import { getDefaultConfirmProps } from '@/utils/common';
import { getFrameTypeList } from '../../../services/menuManager';
import { BaseContext } from '@/constants/global';
import CTable from '@/components/common/BasicWidgets/Widgets/CTable/CTable';

const InputGroup = Input.Group;
const { Search } = Input;
const { Option } = Select;

class MenuManager extends Component {
  static contextType = BaseContext;

  constructor() {
    super();
    this.state = {
      list: [],
      type: '',
      count: 0, // 列表数量
      keyCode: 1, // 开发阶段写死，后续是后台自增。
      visible: false,  // 新增弹框
      title: '', // 弹框名称
      pageSize: 10, // 默认分页10
      pageNum: 1, // 默认第一页
      loading: false,
      rowId: 0, // 选中数据的id
      record: {}, // 选中行的数据
      optionArr: [], // 界面类型
      selected: [], // 选中的行
    };
  }

  componentDidMount() {
    let data = {
      pageSize: this.state.pageSize,
      pageNum: this.state.pageNum,
    };
    this.setState({ loading: true });
    this.getMenuManagerList(data);
    this.getOption();
  }

  getOption = () => {
    getFrameTypeList({}).then(res => {
      this.setState({
        optionArr: res,
      });
    });
  };

  async getMenuManagerList(data) {
    let obj = await Server.getMenuList(data);
    let list = obj.list || [];
    let page = obj.pageNum || 1;
    let count = obj.total || 0;
    this.setState({ list, count, loading: false, rowId: 0, record: {}, currentPage: page });
  }

  /**
   * 弹框
   * @param val
   */
  toggle = (val, type) => {
    const { langLib } = this.context;
    if (type === 'add') {
      this.setState({ record: {}, rowId: 0 });
    } else if (type === 'edit') {
      if (this.state.selected.length !== 1) {
        CMessage(langLib['message.pease.choose.one'], 'error');
        return;
      }
    } else if (!type && !val) {
      this.setState({ record: {}, rowId: 0 });
    }
    let { visible } = this.state;
    this.setState({ visible: !visible, title: val, type });
  };
  /**
   * 关闭弹框
   * @param val
   */
  changeVisible = (val, callback) => {
    if (callback) {
      callback();
    }
    this.setState({ visible: val, loading: true }, () => {
      let data = {
        pageSize: this.state.pageSize,
        pageNum: this.state.pageNum,
      };
      setTimeout(() => {
        this.getMenuManagerList(data);
      }, 0);
    });
  };
  /**
   * 选中行
   * @param record
   * @returns {{onClick: onClick}}
   */
  clickRow = (record) => {
    return {
      onClick: () => {
        let { selected } = this.state;
        // console.log(selected, record);
        if (selected.find((item) => item.id === record.id)) {
          selected.splice(selected.findIndex((item) => item.id === record.id), 1);
        } else {
          selected.push(record);
        }
        this.setState({
          record,
          selected,
        });
      },
    };
  };
  onClickRow = (record, selectedRows) => {
    this.setState({
      selected: selectedRows,
    });
  };
  /**
   * 设置行样式
   * @param record
   * @returns {string}
   */
  setRowClassName = (record) => {
    return record.id === this.state.rowId ? 'clickRowStyl' : '';
  };


  /**
   *
   * @param page
   * @param pageSize
   */
  changePage = (page, pageSize) => {
    this.setState({ loading: true });
    this.setState({ pageSize: pageSize, pageNum: page }, () => {
      let data = {
        pageSize: pageSize,
        pageNum: page,
      };
      this.getMenuManagerList(data);
    });
  };
  /**
   * 删除数据
   */
  deleteMenu = () => {
    if (this.state.selected.length) {
      this.showDeleteConfirm(this.state.selected.map(item => item.id).join(','));
    } else {
      message.error('请选择一条数据再删除');
    }
  };
  showDeleteConfirm = (id) => {
    const { langLib } = this.context;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      onOk: () => {
        let data = { ids: id };
        this.setState({ loading: true });
        deleteIds(data).then(res => {
          let data = {
            pageSize: this.state.pageSize,
            pageNum: this.state.pageNum,
          };
          closeModal()
          this.getMenuManagerList(data);
        }, err => {
          closeModal()
          console.log(err);
        });
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
    // confirm({
    //   ...getDefaultConfirmProps(langLib),
    //   title: '确定删除数据？',
    //   // okText: '确定',
    //   // okType: 'danger',
    //   // cancelText: '取消',
    //   onOk: () => {
    //     let data = { ids: id };
    //     this.setState({ loading: true });
    //     // Server.deleteMenu(data);
    //     deleteIds(data).then(res => {
    //       let data = {
    //         pageSize: this.state.pageSize,
    //         pageNum: this.state.pageNum,
    //       };
    //       this.getMenuManagerList(data);
    //     }, err => {
    //       console.log(err);
    //     });
    //   },
    //   onCancel() {
    //     console.log('Cancel');
    //   },
    // });
  };


  render() {
    const { list, visible, title, pageSize, count, pageNum, loading, record, type, optionArr, selected,currentPage } = this.state;
    const columns = [
        {
          title: <FormattedMessage id="menu.table.sno"/>,
          dataIndex: 'index',
          width: 100,
          render: (text, record, index) => {
            return <span>{index + 1}</span>;
          },
        },
        {
          title: <FormattedMessage id="menu.table.name"/>,
          dataIndex: 'name',
          width: 200,
        },
        {
          title: <FormattedMessage id="menu.table.url"/>,
          dataIndex: 'url',
          width: 250,
        },
        {
          title: <FormattedMessage id="menu.table.frametypeBasetype"/>,
          dataIndex: 'frameTypeName',
          width: 150,
        },
        {
          title: <FormattedMessage id="element.icon"/>,
          dataIndex: 'iconName',
          width: 100,
          render: (text, record, index) => {
            return <span className={`iconfont icon-${text}`}></span>;
          },
        },
        {
          title: <FormattedMessage id="menu.table.memo"/>,
          dataIndex: 'memo',
          width: 350,
        },
      ]
    ;
    const rowSelection = {
      type: 'checkbox',
      selectedRowKeys: selected.map(item => item.id),
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

    return <div className={`${styles.box} boxClass`}>
      <div className={`${styles.headerForm} headerFormClass`}>
        <Row>
          <Col span={9}>
            <Row>
              <Col span={5}>
                <div className={styles.addNewBtn} onClick={() => this.toggle('新增列表', 'add')}>
                  <Icon className={styles.addnewBtnIco} type="plus-square"/>
                  <FormattedMessage id="global.new"/>
                </div>
              </Col>
              <Col span={5}>
                <div className={styles.addNewBtn} onClick={() => this.toggle('编辑', 'edit')}>
                  <span className={`${styles.commonIconStyle} iconEdit iconfont`}></span>
                  <FormattedMessage id="global.edit"/>
                </div>
              </Col>
              <Col span={5}>
                <div className={styles.addNewBtn} onClick={this.deleteMenu}>
                  <span className={`${styles.commonIconStyle} icondelete iconfont`}></span>
                  <FormattedMessage id="global.del"/>
                </div>
              </Col>
              <Col span={5}>
                {/* <div className={styles.addNewBtn} onClick={this.addRow}> */}
                {/*  <span className={`${styles.commonIconStyle} iconPrint iconfont`}></span> */}
                {/*  <FormattedMessage id="global.print"/>*/}
                {/* </div> */}
              </Col>
            </Row>
          </Col>
          <Col span={15}>
            <Row>
              <Col span={6}/>
              <Col span={3}>
                {/* <div className={styles.addNewBtn}> */}
                {/*  <span className={`${styles.commonIconStyle} iconImport iconfont`}></span> */}
                {/*  <FormattedMessage id="menu.header.import"/> */}
                {/* </div> */}
              </Col>
              <Col span={3}>
                {/* div className={styles.addNewBtn}> */}
                {/*  <span className={`${styles.commonIconStyle} iconExport iconfont`}></span> */}
                {/*  <FormattedMessage id="menu.header.export"/>*/}
                {/* </div> */}
              </Col>
              <Col span={3}>
                {/* <div className={styles.highFilter}> */}
                {/*  <Icon type="filter"/> <FormattedMessage id="menu.header.filter"/> */}
                {/* /div> */}
              </Col>
              <Col span={9}>
                <InputGroup compact className={styles.highSearch}>
                  <Select style={{ width: '30%' }} defaultValue="">
                    <Option value=""><FormattedMessage id="global.all"/></Option>
                    <Option value="1"><FormattedMessage id="menu.table.name"/></Option>
                    <Option value="2"><FormattedMessage id="menu.table.url"/></Option>
                  </Select>
                  <Search
                    placeholder="input search text"
                    onSearch={value => console.log(value)}
                    style={{ width: 200 }}
                  />
                </InputGroup>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
      <div style={{ 'heigt': '100%' }}>
        <Table
          columns={columns}
          rowKey={record => record.id}
          dataSource={list}
          scroll={{ y: 'calc(100vh - 250px)' }}
          pagination={false}
          rowSelection={rowSelection}
          loading={loading}
          onRow={this.clickRow}
          // rowClassName={this.setRowClassName}
        />
      </div>
      <div className={`${styles.footer} footerClass`}>
        <Pagination
          pageSize={pageSize}
          onChange={this.changePage}
          showSizeChanger
          defaultCurrent={pageNum}
          current={currentPage}
          total={count}
          onShowSizeChange={this.changePage}
        />
      </div>
      <DetialModal
        optionArr={optionArr}
        changeVisible={this.changeVisible}
        type={type}
        title={title}
        record={type === 'add' ? {} : selected[0]}
        visible={visible}
        onCancel={() => this.toggle()}
        okText="保存"
      />
    </div>;
  }
}

export default MenuManager;
