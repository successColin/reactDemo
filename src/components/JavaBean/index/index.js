import React, { Component } from 'React';
import { Row, Col, Input, Icon, Table, Modal, Menu, message, Form } from 'antd';
import Styles from '../javaBean.less';
import { FormattedMessage } from 'react-intl';
import CreateTree from '@/components/common/CreateTree/CreateTree';
import * as Server from '../../../services/javaBean';
import { delJavaBean, delJavaBeanFiled, getJavaBeanList } from '@/services/javaBean.js';
import DefaultFrame from '../../Frames/DefaultFrame/DefaultFrame';
import DetialModal from '../DetialModal';
import { BaseContext } from '@/constants/global';
import { getDefaultConfirmProps } from '@/utils/common';
import { CMessage } from '@/components/common/BasicWidgets';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const { Search } = Input;
const { confirm } = Modal;

class JavaBean extends Component {
  static contextType = BaseContext;

  constructor() {
    super();
    this.state = {
      list: [], // 实体列表
      selectID: 0, // 默認選中第一條
      dataSoucre: [], // 获取实体对应的表
      loading: false,
      tableName: '', // 选中的实体
      visible: false,
      columnName: '', // 选中行的字段名
      title: '', // 弹框标题
      type: '', // 是否是新增实体类还是新增字段
      record: {}, // 右键记录下对应的实体的值
      recordRow: {}, // 选中行对应的数据集合
      muneVisible: false, // 右键弹框
    };
  }

  componentDidMount() {
    this.getJavaBeanList({});
    // getJavaBeanList({}).then(res => {
    //   console.log(res);
    // });
    document.addEventListener('click', this.hideMune, false);
  }

  /**
   * 挂边编辑弹框
   */
  hideMune = () => {
    let ulBox = document.querySelectorAll('.ulMune')[0];
    ulBox.style.display = 'none';
  };

  componentWillUnmount() {
    document.removeEventListener('click', this.hideMune);
  }

  /**
   * 左邊列表
   * @param data
   * @returns {Promise<void>}
   */
  async getJavaBeanList(data) {
    let list = await Server.getList(data);
    if (list.length) {
      let selectID = list[0].id || 0;
      let tabname = list[0].tableName;
      this.setState({ list, selectID, record: list[0] }, () => {
        this.getTableListById(tabname);
      });
    } else {
      this.setState({ list, dataSoucre: [] });
    }
  }

  /**
   * 列表某條數據的具體詳情
   * @param id
   */
  getListDetial = (tableName, id, record) => {
    this.setState({ selectID: id, tableName, record, columnName: '', recordRow: {} }, () => {
      this.getTableListById(tableName);
    });
  };

  /**
   * 获取实体的具体列表
   * @param id
   * @returns {Promise<void>}
   */
  async getTableListById(tableName) {
    this.setState({ loading: true });
    let data = { tableName: tableName };
    let dataSouce = await Server.getJavaDetialById(data);
    this.setState({ dataSoucre: dataSouce, loading: false });
  }

  /**
   * 渲染左邊列表
   * @returns {Uint8Array | BigInt64Array | any[] | Float64Array | Int8Array | Float32Array | Int32Array | Uint32Array | Uint8ClampedArray | BigUint64Array | Int16Array | Uint16Array}
   */
  setList = () => {
    const { list } = this.state;
    return list.map((item, index) => {
      return <li
        onContextMenu={(e) => {
          this.showMune(e, item);
        }
        }
        className={`${this.state.selectID === item.id ? Styles.on : ''} li`}
        data-id={item.id} key={index}
        onClick={() => this.getListDetial(item.tableName, item.id, item)}>
        <span className={`${Styles.iconStyle} iconfont iconTable`}></span>
        <span>{item.tableName || ''}</span>
      </li>;
    });
  };

  toggle = (type) => {
    this.setState({ visible: !this.state.visible });
  };

  /**
   * 跳出对应的弹框
   * @param title
   * @param type
   */
  addNewJavaBean = (title, type) => {
    console.log(title, type);
    if (type === 'tableField' && JSON.stringify(this.state.record) === '{}') {
      message.error('请选择实体再新增表字段!');
      return;
    } else if (type === 'tableField_edit' && JSON.stringify(this.state.recordRow) === '{}') {
      message.error('请选择表字段再编辑!');
      return;
    } else if (type === 'tableField_edit' && this.state.recordRow.initialData) {
      message.error('不允许编辑默认字段!');
      return;
    } else {
      if (type === 'tableField' && this.state.record) {
        let data = { tableName: this.state.record.tableName };
        this.setState({ record: data });
      }
    }
    this.setState({ title, visible: !this.state.visible, type });
  };
  /**
   * 修改完值刷新
   * @param val
   * @param callback
   */
  changeVisible = (val, type) => {
    this.setState({ visible: val }, () => {
      setTimeout(() => {
        if (type === 'tableField') {
          this.setState({ recordRow: {}, columnName: '' });
          this.getTableListById(this.state.record.tableName);
        } else {
          this.getJavaBeanList({});
        }
      }, 0);
    });
  };
  /**
   * 查找表名
   * @param value
   */
  searchTableName = (value) => {
    this.setState({ loading: true }, () => {
      this.getJavaBeanList({ keywords: value });
    });
  };

  showMune = (e, item) => {
    e.preventDefault();
    e.persist();
    this.setState({
      record: item,
      selectID: item.id,
      tableName: item.tableName,
    }, () => {
      this.getTableListById(item.tableName);
    });
    let ulBox = document.querySelectorAll('.ulMune')[0];
    ulBox.style.display = 'block';
    ulBox.style.left = e.clientX - 60 + 'px';
    ulBox.style.top = e.clientY - 107 + 'px';
  };
  /**
   * 刪除表
   */
  deleteJavaBean = () => {
    const { langLib } = this.context;
    if (JSON.stringify(this.state.record) !== '{}') {
      let { close } = ModalBox.confirm({
        ...getDefaultConfirmProps(langLib),
        onOk: () => {
          let data = { tableName: this.state.record.tableName };
          this.setState({ record: {} });
          delJavaBean(data).then(res => {
            this.getJavaBeanList({});
            closeModal();
          });
        },
        onCancel: () => closeModal(),
      });
      const closeModal = () => {
        close();
      };
      // confirm({
      //   title: '确定删除数据？',
      //   ...getDefaultConfirmProps(langLib),
      //   onOk: () => {
      //     let data = { tableName: this.state.record.tableName };
      //     this.setState({ record: {} });
      //     delJavaBean(data).then(res => {
      //       this.getJavaBeanList({});
      //     });
      //   },
      //   onCancel() {
      //     console.log('Cancel');
      //   },
      // });
    }
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
          columnName: recordRow.columnName,
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
    return record.columnName === this.state.columnName ? 'clickRowStyl' : '';
  };
  /**
   * 删除表字段
   */
  deleteJavaBeanList = () => {
    const { langLib } = this.context;
    if (JSON.stringify(this.state.recordRow) !== '{}') {
      console.log(typeof this.state.recordRow.initialData);
      if (this.state.recordRow.initialData === 1) {
        CMessage(langLib['message.not.defaults'], 'error');
      } else {
        let { close } = ModalBox.confirm({
          ...getDefaultConfirmProps(langLib),
          onOk: () => {
            let data = {
              tableName: this.state.record.tableName,
              id: this.state.recordRow.id,
              columnName: this.state.recordRow.columnName,
            };
            delJavaBeanFiled(data).then(res => {
              this.getListDetial(this.state.record.tableName, this.state.record.id, this.state.record);
              closeModal();
            });
          },
          onCancel: () => closeModal(),
        });
        const closeModal = () => {
          close();
        };
        // confirm({
        //   title: '确定删除数据？',
        //   ...getDefaultConfirmProps(langLib),
        //   onOk: () => {
        //     let data = {
        //       tableName: this.state.record.tableName,
        //       id: this.state.recordRow.id,
        //       columnName: this.state.recordRow.columnName,
        //     };
        //     delJavaBeanFiled(data).then(res => {
        //       this.getListDetial(this.state.record.tableName, this.state.record.id, this.state.record);
        //     });
        //   },
        //   onCancel() {
        //     console.log('Cancel');
        //   },
        // });
      }
    } else {
      message.error('请选择数据删除!');
    }
  };

  render() {
    const { visible, title, type, record, recordRow, dataSoucre } = this.state;
    const { loading, activeDetail, activeTreeNodeDetail, actionType, loadingStatus, treeData } = this.state;
    const { form } = this.props;
    const columns = [
      {
        title: <FormattedMessage id="global.index"/>,
        dataIndex: 'sno',
        key: 'sno',
        width: 100,
        render: (text, record, index) => {
          return <span>{text}</span>;
        },
      },
      {
        title: <FormattedMessage id="javaBean.right.columnComment"/>,
        dataIndex: 'displayColumn',
        key: 'displayColumn',
        width: 200,
      },
      {
        title: <FormattedMessage id="javaBean.right.columnName"/>,
        dataIndex: 'columnName',
        key: 'columnName',
        width: 180,
      },
      {
        title: <FormattedMessage id="global.required"/>,
        dataIndex: 'requisite',
        key: 'requisite',
        width: 100,
        render: (text, record, index) => {
          return <span>{record.requisite ? <FormattedMessage id="global.yes"/> :
            <FormattedMessage id="global.no"/>}</span>;
        },
      },
      {
        title: <FormattedMessage id="javaBean.right.dataType"/>,
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
      // {
      //   title: <FormattedMessage id="javaBean.right.dataType1"/>,
      //   dataIndex: 'id',
      //   key: 'id',
      //   width: 100,
      //   render: (text, record, index) => {
      //     return <span style={{ 'color': '#FFB000' }} className="iconfont iconKey"></span>;
      //   },
      // },
      {
        title: <FormattedMessage id="javaBean.right.columnLength"/>,
        dataIndex: 'columnLength',
        key: 'columnLength',
        width: 100,
      },
      // {
      //   title: <FormattedMessage id="javaBean.right.columnDefault"/>,
      //   dataIndex: 'columnDefault',
      //   key: 'columnDefault',
      // },
    ];

    return (<div className={Styles.box}>
        <div className={Styles.leftBox}>
          <Search
            className={Styles.inputSearch}
            placeholder="请输入关键字搜索"
            onSearch={value => this.searchTableName(value)}
            style={{ width: 200 }}
          />
          <div className={Styles.addNewBtn} onClick={() => this.addNewJavaBean('新建实体', 'tableName_add')}>
            <Icon className={Styles.addnewBtnIco} type="plus-square"/>
            <FormattedMessage id="javaBean.left.add"/>
          </div>
          <ul className={Styles.listBox}>
            {this.setList()}
          </ul>
        </div>
        <div className={Styles.rightBox}>
          <div className={Styles.searchHead}>
            <div className={Styles.headLeft}>
              <div className={Styles.btn} onClick={() => this.addNewJavaBean('新建表字段', 'tableField')}>
                <Icon className={Styles.addnewBtnIco} type="plus-square"/>
                <FormattedMessage id="global.new"/>
              </div>
              <div className={Styles.btn} onClick={() => this.addNewJavaBean('修改表字段', 'tableField_edit')}>
                <span className={`${Styles.addnewBtnIco} iconfont iconEdit`}></span>
                <FormattedMessage id="global.edit"/>
              </div>
              <div className={Styles.btn} onClick={() => this.deleteJavaBeanList()}>
                <span className={`${Styles.addnewBtnIco} iconfont icondelete`}></span>
                <FormattedMessage id="global.del"/>
              </div>
            </div>
            <div className={Styles.headRight}>
              <Search
                className={Styles.rightInputSearch}
                placeholder="请输入关键字搜索"
                onSearch={value => console.log(value)}
                style={{ width: 200 }}
              />
            </div>
          </div>
          <div className={Styles.tabkeBox}>
            <Table
              columns={columns}
              dataSource={this.state.dataSoucre}
              rowKey={record => record.columnName}
              pagination={false}
              loading={this.state.loading}
              type={type}
              scroll={{ y: 'calc(100vh - 210px)' }}
              onRow={this.onClickRow}
              rowClassName={this.setRowClassName}
            />
          </div>
        </div>
        <DetialModal
          changeVisible={this.changeVisible}
          recordRow={recordRow}
          record={record}
          dataSoucre={dataSoucre}
          title={title}
          visible={visible}
          type={type}
          onCancel={() => this.toggle()}
          okText="保存"
        />
        <ul className={`${Styles.ulMenuBox} ulMune`}>
          <Menu>
            <Menu.Item className={Styles.ulMenuBoxLi}>
              <span onClick={() => this.addNewJavaBean('编辑实体', 'tableName_edit')}>编辑实体</span>
            </Menu.Item>
            <Menu.Item className={Styles.ulMenuBoxLi}>
              <span onClick={() => this.deleteJavaBean()}>删除</span>
            </Menu.Item>
          </Menu>
        </ul>
      </div>
    );
  }
}

export default Form.create()(JavaBean);


