/*
 * @Author: jwk
 * @Date:   2020-03-17 9:20:23
 * @Desc: 语种列表
 */
import React, { Component } from 'react';
import { Col, Row, Icon, Input, Select, Table, Pagination, Modal, Form } from 'antd';
import { connect } from 'dva';
import CModal from '@/components/common/CreateModal/CreateModal';
import { FormattedMessage } from 'react-intl';
import styles from './Languages.less';
import FormDetial from './FormDetial/formDetial';
import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
import { getDefaultConfirmProps } from '@/utils/common';
import { BaseContext } from '@/constants/global';
import { getLanguagesPage, doUpdateOrAdd, doBatchDelete } from '@/services/language';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const InputGroup = Input.Group;
const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class Languages extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super();
    this.state = {
      list: [],
      count: 0, // 列表数量
      visible: false,  // 新增弹框
      title: '', // 弹框名称
      pageSize: 10, // 默认分页10
      keyWords: '',
      pageNum: 1, // 默认第一页
      loading: false,
      selected: [], // 选中的行
      type: '',
      selectedRowKeys: [], // 勾选中的行
    };
  }

  componentDidMount() {
    this.getList();
  }

  // 获取数据
  getList = () => {
    const { pageSize, pageNum, keyWords, loading } = this.state;
    this.setState({ loading: true });
    getLanguagesPage({ pageSize, pageNum, keyWords }).then((res) => {
      this.setState({ loading: false, list: res.list || [], count: res.total });
    });
  };

  // 新增
  add = () => {
    this.setState({
      visible: true,
      type: '',
      title: <FormattedMessage id="global.add"/>,
    });
  };
  // 编辑
  edit = () => {
    const { selected } = this.state;
    const { langLib } = this.context;
    if (selected.length !== 1) {
      CMessage(langLib['message.error.onlyOne'], 'error');
      return;
    }
    this.setState({
      visible: true,
      type: 'edit',
      title: <FormattedMessage id="global.edit"/>,
    });
  };
  // 保存修改
  handleSave = () => {
    const { form } = this.props;
    const { langLib } = this.context;
    form.validateFields((errs, values) => {
      if (errs) return;
      const { type, count } = this.state;
      let params = !type ? {
        sno: count + 1,
        ...values,
      } : values;
      doUpdateOrAdd(params).then((res) => {
        CMessage(langLib['message.save.success'], 'success');
        this.getList();
        this.setState({
          visible: false,
          title: '',
          type: '',
          selected: [],
        });
      });
    });
  };

  // 单选
  onClickRow = (record, selectedRows) => {
    let { selected } = this.state;
    if (selectedRows) {
      if (selected.findIndex(item => item.id === record.id) !== -1) {
        selected.splice(selected.findIndex(item => item.id === record.id), 1);
      } else {
        selected.push(record);
      }
      this.setState({
        selected: [...selected],
      });
    }
  };
  // 全选或者反选
  onClickRowAll = (record, selectedRows, arr) => {
    let { selected } = this.state;
    if (record) {
      selectedRows.forEach(item => {
        let index = selected.findIndex(items => items.id === item.id);
        if (index === -1) {
          selected.push(item);
        }
      });
      this.setState({
        selected: [...selected],
      });
    } else {
      arr.forEach(item => {
        let index = selected.findIndex(items => items.id === item.id);
        if (index !== -1) {
          selected.splice(index, 1);
        }
      });
      this.setState({
        selected: [...selected],
      });
    }
  };
  // 点击行
  clickRow = (record) => {
    return {
      onClick: () => {
        let { selected } = this.state;
        if (selected.find((item) => item.id === record.id)) {
          selected.splice(selected.findIndex((item) => item.id === record.id), 1);
        } else {
          selected.push(record);
        }
        this.setState({
          selected: [...selected],
        });
      },
    };
  };
  // 删除
  delete = () => {
    const { langLib } = this.context;
    const { selected } = this.state;
    const that = this;
    if (selected.length) {
      let { close } = ModalBox.confirm({
        ...getDefaultConfirmProps(langLib),
        onOk() {
          let params = {
            ids: selected.map((item) => item.id).join(','),
          };
          doBatchDelete(params).then(res => {
            closeModal();
            that.setState({
              selected: [],
              pageNum: 1,
            }, () => {
              that.getList();
            });
          });
        },
        onCancel: () => closeModal(),
      });
      const closeModal = () => {
        close();
      };
      // confirm({
      //   ...getDefaultConfirmProps(langLib),
      //   onOk() {
      //     let params = {
      //       ids: selected.map((item) => item.id).join(','),
      //     };
      //     doBatchDelete(params).then(res => {
      //       that.setState({
      //         selected: [],
      //         pageNum: 1,
      //       }, () => {
      //         that.getList();
      //       });
      //     });
      //   },
      //   onCancel() {
      //   },
      // });
    } else {
      CMessage(langLib['message.please.choose'], 'error');
    }
  };
  // 切页
  changePage = (page, pageSize) => {
    this.setState({
      pageNum: page,
      pageSize,
    }, () => {
      this.getList();
    });
  };

  render() {
    const { list, visible, title, pageSize, count, pageNum, loading, type, selected } = this.state;
    const { langLib } = this.context;
    const { form, functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    const columns = [
      {
        title: <FormattedMessage id="menu.table.sno"/>,
        dataIndex: 'sno',
        width: 100,
      },
      {
        title: <FormattedMessage id="langauges.list.keycode"/>,
        dataIndex: 'keycode',
        width: 200,
      },
      {
        title: <FormattedMessage id="langauges.list.name"/>,
        dataIndex: 'name',
        width: 250,
      },
    ];
    const modalProps = {
      title: title,
      visible: visible,
      className: styles.modal,
      onCancel: () => {
        this.setState({ visible: false, title: '', type: '', selected: [] });
      },
      onOk: () => {
        this.handleSave();
      },
    };
    const rowSelection = {
      type: 'checkbox',
      columnWidth: '50px',
      selectedRowKeys: selected.map(item => item.id),
      onSelectAll: (record, selected, selectedRows, nativeEvent) => {
        this.onClickRowAll(record, selected, selectedRows);
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
              {canadd ? <Col span={5}>
                <div className={`${styles.addNewBtn}`} onClick={() => this.add()}>
                  <Icon className={`${styles.addnewBtnIco} custom-color`} type="plus-square"/>
                  <FormattedMessage id="global.new"/>
                </div>
              </Col> : null}
              {canmodify ? <Col span={5}>
                <div className={styles.addNewBtn} onClick={() => this.edit()}>
                  <span className={`${styles.commonIconStyle} custom-color iconEdit iconfont`}></span>
                  <FormattedMessage id="global.edit"/>
                </div>
              </Col> : null}
              {candelete ? <Col span={5}>
                <div className={styles.addNewBtn} onClick={() => this.delete()}>
                  <span className={`${styles.commonIconStyle} custom-color icondelete iconfont`}></span>
                  <FormattedMessage id="global.del"/>
                </div>
              </Col> : null}
            </Row>
          </Col>
          <Col span={15}>
            <Row>
              <Col span={15}/>
              <Col span={9}>
                <InputGroup compact className={styles.highSearch}>
                  <Search
                    placeholder={langLib['form.placeholder.keywords']}
                    onSearch={value => {
                      this.setState({ pageNum: 1 }, () => {
                        this.getList();
                      });
                    }}
                    onChange={e => {
                      this.setState({ keyWords: e.target.value });
                    }}
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
          onRow={this.clickRow}
          loading={loading}
          rowSelection={rowSelection}
        />
      </div>
      <div className={`${styles.footer} footerClass`}>
        <Pagination
          pageSize={pageSize}
          onChange={this.changePage}
          showSizeChanger
          defaultCurrent={pageNum}
          // current={currentPage}
          total={count}
          onShowSizeChange={this.changePage}
        />
      </div>
      <CModal {...modalProps}>
        <FormDetial
          form={form}
          loading={false}
          activeDetail={type ? selected[0] : {}}
        />
      </CModal>
    </div>;
  }
}

export default Form.create()(Languages);
