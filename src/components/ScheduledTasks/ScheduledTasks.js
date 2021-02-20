/*
 * @Author: jwk
 * @Date:   2020-06-01 9:20:23
 * @Desc: 定时任务配置
 */
import React, { Component, Fragment } from 'react';
import { Col, Row, Icon, Input, Select, Table, Pagination, Modal, Form, Tooltip } from 'antd';
import { connect } from 'dva';
import CModal from '@/components/common/CreateModal/CreateModal';
import { FormattedMessage } from 'react-intl';
import FormDetial from './FormDetial/FormDetial';
import LogList from './LogList/LogList';
import DataTable from '@/components/ScheduledTasks/DataTable/DataTable';
import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
import { getDefaultConfirmProps } from '@/utils/common';
import { BaseContext } from '@/constants/global';
import {
  getTasksList,
  addTask,
  editTask,
  deleteTasks,
  runJob,
  resume,
  pause,
  updateOrInsertData,
  getJobData,
} from '@/services/scheduledTasks';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';
import styles from './ScheduledTasks.less';
import { CSearch } from '@/components/common/BasicWidgets';


const InputGroup = Input.Group;
const { Search } = Input;
const { Option } = Select;
const { confirm } = Modal;

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))

class ScheduledTasks extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super();
    this.state = {
      chooseData: {}, // 选中的存储过程
      list: [],
      count: 0, // 列表数量
      record: {}, // 记录点击行的数据
      dataList: [], // 存储过程集合
      visible: false,  // 新增弹框
      title: '', // 弹框名称
      limit: 10, // 默认分页10
      keyWords: '',
      page: 1, // 默认第一页
      loading: false,
      selected: [], // 选中的行
      type: '',
      modalKeyWords: null, // 日志模糊查找
    };
  }

  componentDidMount() {
    this.getList();
  }

  // 获取数据
  getList = () => {
    const { limit, page, keyWords, loading } = this.state;
    this.setState({ loading: true });
    getTasksList({ limit, page, keyWords }).then((res) => {
      this.setState({ loading: false, list: res.rows || [], count: res.total });
    });
  };

  // 新增
  add = () => {
    this.setState({
      visible: true,
      type: 'add',
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
  // 接口参数
  getHandleApiAndParams = (value) => {
    const { type, selected } = this.state;
    switch (type) {
      case 'add':
        return {
          params: value,
          api: addTask,
        };
      case 'edit':

        return {
          params: {
            ...selected[0],
            ...value,
          },
          api: editTask,
        };
      case 'data':
        return {
          params: this.dealWidthData(value),
          api: updateOrInsertData,
        };
      default:
        return null;
    }
  };
  // 处理存储过程的数据
  dealWidthData = (value) => {
    const { record, chooseData } = this.state;
    let data = {};
    let newValue = JSON.parse(JSON.stringify(value));
    if (chooseData.id) data.id = chooseData.id;
    data.name = newValue.name;
    data.scheduleJobId = record.id;
    data.methodType = 1;
    data.paramNum = newValue.paramNum;
    delete newValue.paramNum;
    delete newValue.name;
    let len = Object.keys(newValue).length; // 计算出有多少对key value
    if (!len) return data;
    let n = len && (len / 2 + 1);
    let arr = [];
    for (let i = 1; i < n; i++) {
      arr.push({
        param: newValue[`field_${i}`],
        val: newValue[`value_${i}`],
      });
    }
    data.scheduleJobMethodLines = arr;
    return data;
  };

  // 保存修改
  handleSave = () => {
    const { form } = this.props;
    const { langLib } = this.context;
    const { type } = this.state;
    form.validateFields((errs, values) => {
      if (errs) return;
      const { params, api } = this.getHandleApiAndParams(values);
      api(params).then(res => {
        if (type === 'data') {
          this.getDataList();
          return;
        }
        this.getList();
        CMessage(langLib['message.save.success'], 'success');
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
  clickRow = (record, index) => {
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
      onMouseEnter: event => {
        let currentParentNode = event.target;
        while (currentParentNode !== null && currentParentNode.nodeName !== 'TR') {
          currentParentNode = currentParentNode.parentNode;
        }
        currentParentNode && currentParentNode.lastChild.classList.add('custom-color');
      }, // 鼠标移入行
      onMouseLeave: event => {
        let currentParentNode = event.target;
        while (currentParentNode !== null && currentParentNode.nodeName !== 'TR') {
          currentParentNode = currentParentNode.parentNode;
        }
        currentParentNode && currentParentNode.lastChild.classList.remove('custom-color');
      },
    };
  };
  // 立即执行
  handleNow = (record) => {
    const { langLib } = this.context;
    let params = {
      idsString: `${record.id}`,
    };
    runJob(params).then(res => {
      CMessage(langLib['message.check.success'], 'success');
      this.setState({
        selected: [],
      }, () => {
        this.getList();
      });
    });
  };
  // 打开存储过程
  handleOpenData = (record) => {
    getJobData({ id: record.id }).then(res => {
      this.setState({
        visible: true,
        type: 'data',
        record,
        dataList: res || [],
        title: <FormattedMessage id="tasks.tigger.handle.data"/>,
      });
    });
  };
  getDataList = () => {
    const { record } = this.state;
    getJobData({ id: record.id }).then(res => {
      this.setState({
        dataList: res || [],
      });
    });
  };
  // 手动执行定时任务
  handleTrgger = (record) => {
    const { langLib } = this.context;
    let params = {
      idsString: `${record.id}`,
    };
    if (record.status === 1) { // status ==1是暂停，对应的是恢复
      resume(params).then(res => {
        CMessage(langLib['message.check.success'], 'success');
        this.setState({
          selected: [],
        }, () => {
          this.getList();
        });
      });
    } else { // status ==0是暂停，对应的是暂停
      pause(params).then(res => {
        CMessage(langLib['message.check.success'], 'success');
        this.setState({
          selected: [],
        }, () => {
          this.getList();
        });
      });
    }

  };
  // 查看日志
  handleLookLog = (record) => {
    this.setState({
      visible: true,
      type: 'log',
      record,
      title: <FormattedMessage id="tasks.modal.look.log"/>,
    });
  };
  // 删除
  delete = () => {
    const { langLib } = this.context;
    const that = this;
    const { selected } = this.state;
    if (!selected.length) {
      CMessage(langLib['message.please.choose'], 'error');
      return;
    } else {
      let { close } = ModalBox.confirm({
        ...getDefaultConfirmProps(langLib),
        onOk() {
          let params = {
            idsString: selected.map((item) => item.id).join(','),
          };
          deleteTasks(params).then(res => {
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
    }
  };
  // 切页
  changePage = (page, pageSize) => {
    this.setState({
      page: 1,
      limit: pageSize,
    }, () => {
      this.getList();
    });
  };
  // 渲染列名
  returnColumsRender = (text, width) => {
    return <div title={text}
                style={{
                  'width': `${width}px`,
                  'whiteSpace': 'nowrap',
                  'textOverflow': 'ellipsis',
                  'overflow': 'hidden',
                }}>{text}</div>;
  };
  // 获取列名
  getTablecolumns = () => {
    const { functionData } = this.props;
    const { canmodify } = functionData.attributes;
    return [
      {
        title: <FormattedMessage id="tasks.form.name"/>,
        dataIndex: 'name',
        width: 150,
        render: (text, record) => {
          return this.returnColumsRender(text, 118);
        },
      },
      {
        title: <FormattedMessage id="tasks.form.beanName"/>,
        dataIndex: 'beanName',
        width: 180,
        ellipsis: true,
        render: (text, record) => {
          return this.returnColumsRender(text, 148);
        },
      },
      {
        title: <FormattedMessage id="tasks.form.cronExpression"/>,
        dataIndex: 'cronExpression',
        width: 200,
        ellipsis: true,
        render: (text, record) => {
          return this.returnColumsRender(text, 168);
        },
      }, {
        title: <FormattedMessage id="tasks.form.methodName"/>,
        dataIndex: 'methodName',
        width: 150,
        ellipsis: true,
        render: (text, record) => {
          return this.returnColumsRender(text, 118);
        },
      }, {
        title: <FormattedMessage id="tasks.form.remark"/>,
        dataIndex: 'remark',
        width: 250,
        ellipsis: true,
        render: (text, record) => {
          return this.returnColumsRender(text, 218);
        },
      }, {
        title: <FormattedMessage id="tasks.stauts"/>,
        dataIndex: 'status',
        width: 100,
        render: (text, record) => {
          let suspend = <div><span className={styles.suspend}></span><FormattedMessage id="tasks.suspend"/></div>;
          let start = <div><span className={styles.start}></span><FormattedMessage id="tasks.start"/></div>;
          let context = record.status === 1 ? suspend : start;
          return context;
        },
      }, {
        title: <FormattedMessage id="menu.table.operation"/>,
        dataIndex: 'colorCod15e',
        width: 150,
        render: (text, record, index) => {
          return (canmodify ? <div>
              <Tooltip title={record.status === 1 ? <FormattedMessage id="tasks.tigger.handle.resume"/> :
                <FormattedMessage id="tasks.tigger.handle.pause"/>}><span
                onClick={() => {
                  this.handleTrgger(record);
                }}
                className={`${styles.iconHook} iconfont ${record.status === 1 ? 'icon-start' : 'icon-suspend'}`}></span></Tooltip>
              <Tooltip title={<FormattedMessage id="tasks.tigger.handle.tooltip"/>}><span
                onClick={() => {
                  this.handleNow(record);
                }}
                className={`${styles.iconHook} iconfont icon-handle-trigger`}></span></Tooltip>
              <Tooltip title={<FormattedMessage id="tasks.tigger.handle.data"/>}><span
                onClick={() => {
                  this.handleOpenData(record);
                }}
                className={`${styles.iconHook} iconfont icon-stored-procedure`}></span></Tooltip>
              <Tooltip title={<FormattedMessage id="tasks.tigger.handle.record"/>}><span
                onClick={() => {
                  this.handleLookLog(record);
                }}
                className={`${styles.iconHook} iconfont icon-journal`}></span></Tooltip>
            </div> : null
          );
        },
      },
    ];
  };

  // 获取弹框的内容
  getModalConent = () => {
    const { record, modalKeyWords, type, selected, dataList } = this.state;
    const { functionData, form } = this.props;
    switch (type) {
      case 'add':
        let defaultProps = {
          form,
          loading: false,
          activeDetail: {},
        };
        return <FormDetial {...defaultProps}/>;
      case 'edit':
        let defaultPropsDetial = {
          form,
          loading: false,
          activeDetail: selected[0],
        };
        return <FormDetial {...defaultPropsDetial}/>;
      case 'log':
        let defaultPropsLogList = {
          activeDetail: record,
          modalKeyWords,
        };
        return <LogList {...defaultPropsLogList}/>;
      case 'data':
        let defaultPropsData = {
          activeDetail: record,
          form,
          dataList,
          functionData,
          getDataList: this.getDataList,
          updateState: this.updateState,
        };
        return <DataTable {...defaultPropsData}/>;
      default:
        return null;
    }
  };

  updateState = (itemObj, callback) => {
    this.setState({
      ...itemObj,
    }, () => {
      callback && callback();
    });
  };

  render() {
    const { chooseData, list, visible, title, limit: pageSize, count, page: pageNum, loading, type, selected, modalKeyWords } = this.state;
    const { langLib } = this.context;
    const { functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    const columns = this.getTablecolumns();
    const modalTitle = type === 'log' ? (
      <Fragment>
        {title}
        <CSearch
          allowClear={false}
          className={styles.modalTile}
          onSearch={value => this.setState({ modalKeyWords: value })}
          onChange={e => !e.target.value && this.setState({ modalKeyWords: null })}
        />
      </Fragment>
    ) : title;
    let modalProps = {
      title: modalTitle,
      visible: visible,
      className: (type === 'log' || type === 'data') ? styles.modal1 : styles.modal,
      onCancel: () => {
        this.setState({ visible: false, title: '', type: '', selected: [], record: {}, chooseData: {}, dataList: [] });
      },
      onOk: () => {
        this.handleSave();
      },
    };
    if (type === 'log') {
      modalProps.footer = null;
    }
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
                      this.setState({ page: 1 }, () => {
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
          showTotal={(total, range) => {
            return (
              <div><FormattedMessage id="global.total"/>{total}</div>
            );
          }}
          // current={currentPage}
          total={count}
          onShowSizeChange={this.changePage}
        />
      </div>
      <CModal {...modalProps}>
        {this.getModalConent()}
      </CModal>
    </div>;
  }
}

export default Form.create()(ScheduledTasks);
