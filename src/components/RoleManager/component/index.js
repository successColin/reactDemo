import react, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs, Checkbox, Row, Col, message, Modal } from 'antd';
import FormConfigDetial from './formDetial';
import { BaseContext } from '@/constants/global';
import CTable from '@/components/common/BasicWidgets/Widgets/CTable/CTable';
import {
  getAuthorityById,
  updateFunctionPermission,
  updateRowFunctionPermission,
  getAPPTree,
  columnCheckAll,
  insertFunctionPermission,
  rowCheckAll,
  insertAppPermission,
  updateAppPermisson,
  getRoleDataTree,
  getRoleOrgData,
} from '@/services/roleManger';
import styles from '../roleConfig.less';
import { getAppColumns, getPcColumns } from '../columns';
import { getDefaultConfirmProps } from '@/utils/common';
import { CMessage } from '@/components/common/BasicWidgets';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const { TabPane } = Tabs;
const { confirm } = Modal;

const stick_pcObj = { // pc勾选
  canview: 0, // 查看
  canadd: 0, // 新增
  canmodify: 0, // 修改
  candelete: 0, // 删除
  canprint: 0, // 打印
  candesign: 0, // 设计
  canAddFolder: 0, // 关联资料-新增文件夹
  canUploadFile: 0, // 关联资料-上传文件
  canRelation: 0, // 关联资料-关联按钮
  canUpdateFolder: 0, // 关联资料-修改文件夹
  canDelFolderFile: 0, // 关联资料-删除文件夹或者文件
  all: 0, // 全部
};
const stick_appObj = { // app勾选
  canview: 0, // 查看
  canadd: 0, // 新增
  canmodify: 0, // 修改
  candelete: 0, // 删除
  canprint: 0, // 打印
  candesign: 0, // 设计
  all: 0, // 全部
};

class Ctab extends Component {
  static contextType = BaseContext;

  constructor(pros) {
    super();
    this.state = {
      loading: false,
      activeDetail: {}, // 当前选中的角色
      dataSourcePC: [], // pc树
      dataSourceApp: [], // app树
      expandedRowKeys: [], // 数据权限展开的节点
      pcObj: stick_pcObj,
      appObj: stick_appObj,
    };
  }

  componentDidUpdate() {
    // const height = document.getElementById('pc') && document.getElementById('pc').offsetHeight;
    // const table = document.querySelector('#pc .ant-table-body-inner');
    // if (table) table.style.maxHeight = `${height - 38}px`;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.tabDefaultConfig.activeDetail.id !== this.state.activeDetail.id) {
      this.setState({
        expandedRowKeys: [],
        activeDetail: nextProps.tabDefaultConfig.activeDetail,
        pcObj: stick_pcObj,
        appObj: stick_appObj,
      });
    }
  }

  /**
   * 获取角色对应的权限
   */
  getPCauthority = (id) => {
    this.setState({ loading: true });
    let params = { relationId: id };
    getAuthorityById(params).then((res) => {
      this.setState({ loading: false, dataSourcePC: res });
    });
  };
  /**
   * 获取app权限树
   * @param id
   */
  getAPPauthority = (id) => {
    this.setState({ loading: true });
    let params = { relationId: id };
    getAPPTree(params).then((res) => {
      this.setState({
        loading: false,
        dataSourceApp: res,
      });
    });
  };
  CustomExpandIcon = (props) => {
    let icon;
    if (props.expanded && (Array.isArray(props.record.children) && props.record.children.length)) {
      icon = 'icon-arrow-open';
    } else if (!props.expanded && (Array.isArray(props.record.children) && props.record.children.length)) {
      icon = 'icon-arrow-right';
    }
    return (
      <span
        className={`${icon} iconfont ${styles.openIcon}`}
        onClick={e => {
          e.preventDefault();
          props.onExpand(props.record, e);
        }}
      />
    );
  };
  CustomExpandIcon1 = (props) => {
    let icon = null;
    if (props.expanded && Array.isArray(props.record.children) && props.record.children.length) {
      icon = 'icon-arrow-open';
    } else if (!props.expanded && props.record.childCount) {
      icon = 'icon-arrow-right';
    }
    return (
      <span
        className={`${icon} iconfont ${styles.openIcon}`}
        onClick={e => {
          e.preventDefault();
          props.onExpand(props.record, e);
        }}
      />
    );
  };

  /**
   * 全选
   * @param e
   */
  checkTypeAll = (e, type) => {
    const { langLib } = this.context;
    e.stopPropagation();
    e.preventDefault();
    this.setState({ loading: true });
    const { pcObj } = this.state;
    const { id } = this.state.activeDetail;
    let data;
    const isCheck = e.target.checked ? 1 : 0;
    if (type === 'all') {
      data = {
        relationId: id,
        canadd: isCheck,
        canmodify: isCheck,
        candelete: isCheck,
        canview: isCheck,
        canprint: isCheck,
        candesign: isCheck,
        canAddFolder: isCheck,
        canUploadFile: isCheck,
        canRelation: isCheck,
        canUpdateFolder: isCheck,
        canDelFolderFile: isCheck,
      };
      this.setState({
        pcObj: {
          canadd: isCheck,
          canmodify: isCheck,
          candelete: isCheck,
          canview: isCheck,
          canprint: isCheck,
          candesign: isCheck,
          canAddFolder: isCheck,
          canUploadFile: isCheck,
          canRelation: isCheck,
          canUpdateFolder: isCheck,
          canDelFolderFile: isCheck,
          all: isCheck,
        },
      });
    } else {
      data = {
        relationId: id,
        [type]: isCheck,
      };
      let checkPcType = {
        ...pcObj,
        [type]: isCheck,
      };

      this.setState({
        pcObj: {
          ...pcObj,
          all: checkPcType.canAddFolder && checkPcType.canUploadFile && checkPcType.canRelation && checkPcType.canUpdateFolder && checkPcType.canDelFolderFile && checkPcType.canadd && checkPcType.candelete && checkPcType.candesign && checkPcType.canmodify && checkPcType.canprint && checkPcType.canview ? 1 : 0,
          [type]: isCheck,
        },
      });
    }
    updateRowFunctionPermission(data).then(res => {
      CMessage(langLib['reload.real'], 'success');
      this.getPCauthority(id);
    }, err => {
      this.setState({ loading: false });
    });
  };
  /**
   * 单选
   */
  checkType = (e, record, type) => {
    const { langLib } = this.context;
    e.stopPropagation();
    e.preventDefault();
    this.setState({ loading: true });
    const { id } = this.state.activeDetail;
    let data;
    const isCheck = e.target.checked ? 1 : 0;
    if (type === 'all') {
      data = {
        relationId: id,
        functionId: record.id,
        canadd: isCheck,
        canmodify: isCheck,
        candelete: isCheck,
        canview: isCheck,
        canprint: isCheck,
        candesign: isCheck,
        canAddFolder: isCheck,
        canUploadFile: isCheck,
        canRelation: isCheck,
        canUpdateFolder: isCheck,
        canDelFolderFile: isCheck,
      };
    } else {
      data = {
        relationId: id,
        functionId: record.id,
        [type]: isCheck,
      };
    }
    if (!!!record.attributes || JSON.stringify(record.attributes) === '{}') {
      insertFunctionPermission(data).then(res => {
        CMessage(langLib['reload.real'], 'success');
        this.getPCauthority(id);
      }, err => {
        this.setState({ loading: false });
      });
    } else {
      let params = Object.assign({ ...record.attributes }, data);
      updateFunctionPermission(params).then((res) => {
        CMessage(langLib['reload.real'], 'success');
        this.getPCauthority(id);
      }, err => {
        this.setState({ loading: false });
      });
    }

  };
  /**
   * app全选
   * @param e
   * @param type
   */
  checkAppAll = (e, type) => {
    e.stopPropagation();
    const { langLib } = this.context;
    const { id } = this.state.activeDetail;
    const { appObj } = this.state;
    let data;
    const isCheck = e.target.checked ? 1 : 0;
    this.setState({ loading: true });
    if (type === 'all') {
      data = {
        relationId: id,
        canadd: isCheck,
        canmodify: isCheck,
        candelete: isCheck,
        canview: isCheck,
        canprint: isCheck,
        candesign: isCheck,
      };
      this.setState({
        appObj: {
          canadd: isCheck,
          canmodify: isCheck,
          candelete: isCheck,
          canview: isCheck,
          canprint: isCheck,
          candesign: isCheck,
          all: isCheck,
        },
      });
    } else {
      data = {
        relationId: id,
        [type]: isCheck,
      };
      let checkPcType = {
        ...appObj,
        [type]: isCheck,
      };

      this.setState({
        appObj: {
          ...appObj,
          caninherit: 0,
          all: checkPcType.canadd && checkPcType.candelete && checkPcType.candesign && checkPcType.canmodify && checkPcType.canprint && checkPcType.canview ? 1 : 0,
          [type]: isCheck,
        },
      });
    }
    columnCheckAll(data).then(res => {
      CMessage(langLib['reload.real'], 'success');
      this.getAPPauthority(id);
    }, err => {
      this.setState({ loading: false });
    });
  };
  /**
   * app单选
   * @param e
   * @param record
   * @param type
   */
  checkApp = (e, record, type) => {
    e.stopPropagation();
    const { langLib } = this.context;
    const { id } = this.state.activeDetail;
    let data;
    const isCheck = e.target.checked ? 1 : 0;
    this.setState({ loading: true });
    if (record.type === 'APP') {
      if (record.attributes && record.attributes.appId) {
        data = {
          relationId: id,
          canview: isCheck,
          appId: record.id,
          id: record.attributes.id,
        };
        updateAppPermisson(data).then(res => {
          CMessage(langLib['reload.real'], 'success');
          this.getAPPauthority(id);
        }, err => {
          this.setState({ loading: false });
        });
      } else {
        data = {
          relationId: id,
          canview: isCheck,
          appId: record.id,
        };
        insertAppPermission(data).then(res => {
          CMessage(langLib['reload.real'], 'success');
          this.getAPPauthority(id);
        }, err => {
          this.setState({ loading: true });
        });
      }
    } else {
      if (type === 'all') {
        data = {
          relationId: id,
          canadd: isCheck,
          canmodify: isCheck,
          candelete: isCheck,
          canview: isCheck,
          canprint: isCheck,
          candesign: isCheck,
          bundleId: record.id,
          id: record.attributes && record.attributes.id ? record.attributes.id : '',
        };
      } else {
        data = {
          relationId: id,
          bundleId: record.id,
          [type]: isCheck,
          id: record.attributes && record.attributes.id ? record.attributes.id : '',
        };
      }
      rowCheckAll(data).then(res => {
        CMessage(langLib['reload.real'], 'success');
        this.getAPPauthority(id);
      }, err => {
        this.setState({ loading: false });
      });
    }
  };
  // 切换面板
  changeTab = (activeKey) => {
    const { activeDetail } = this.state;
    const { tabDefaultConfig } = this.props;
    if (activeKey === 'pc') {
      this.getPCauthority(activeDetail.id);
    } else if (activeKey === 'app') {
      this.getAPPauthority(activeDetail.id);
    } else if (activeKey === 'data') {
      this.getRoleDataTree();
    }
    tabDefaultConfig.changeTab(activeKey);
  };
  // 数据权限树
  getRoleDataTree = () => {
    const { id } = this.state.activeDetail;
    let params = {
      roleId: id,
    };
    this.setState({
      loading: true,
    });
    getRoleOrgData(params).then(data => {
      getRoleDataTree({ groupId: 0 }).then(res => {
        if (data.length) {
          data.forEach(item => {
            this.getMenuBtnList(res, true, item, 'render');
          });
        }
        this.setState({
          dataTree: res,
          roleData: data,
          loading: false,
        });
      }, err => {
        console.log(err);
      });
    }, err => {
      console.log(err);
    });
  };
  /**
   * 选择对应的数据类型
   * @param e
   * @param record
   */
  selectCheckbox = (e, record) => {
    e.stopPropagation();
    const isCheck = e.target.checked;
    let { dataTree, roleData } = this.state;
    let menuTreeList = dataTree;

    if (isCheck) {
      if (roleData.findIndex(v => {
        return v.orgId === record.id;
      }) === -1) {
        roleData.push({
          orgName: record.name,
          orgId: record.id,
        });
      }
    } else {
      roleData.splice(roleData.findIndex(v => {
        return v.orgId === record.id;
      }), 1);
    }
    this.getMenuBtnList(menuTreeList, isCheck, record); // 递归把当前选中的数据勾选上
    isCheck && this.familyTree(record.rootId); // 递归把当前节点的所有父节点勾选上
    this.props.tabDefaultConfig.updateOrgData(roleData);
  };
  // 查找一个节点的所有父节点
  familyTree = (id) => {
    let { dataTree, roleData } = this.state;
    let menuTreeList = dataTree;
    let that = this;
    let forFn = function(arr, id) {
      for (let i = 0; i < arr.length; i++) {
        let item = arr[i];
        if (item.id === id) { // 如果直接匹配到，数据改变继续递归
          item.checked = true;
          if (roleData.findIndex(v => {
            return v.orgId === item.id;
          }) === -1) {
            roleData.push({
              orgName: item.name,
              orgId: item.id,
            });
          }
          that.setState({
            dataTree: menuTreeList,
            roleData,
          });
          forFn(menuTreeList, item.rootId);
          break;
        } else {
          if (Array.isArray(item.children) && item.children) { // 没有匹配到用子节点进行匹配
            forFn(item.children, id);
          }
        }
      }
    };
    forFn(menuTreeList, id);
  };
  checkRoleAll = (e) => {
    e.stopPropagation();
    const isCheck = e.target.checked;
    let { dataTree } = this.state;
    let menuTreeList = dataTree;
    if (!isCheck) {
      this.setState({
        roleData: [],
      });
      this.props.tabDefaultConfig.updateOrgData([]);
    }
    this.changeRoleTree(menuTreeList, isCheck);
    this.setState({
      dataTree: menuTreeList,
    });
  };
  /**
   * 递归获取数据
   * @param menuTreeList
   * @param menuList
   */
  getMenuBtnList = (menuTreeList, isCheck, params, render) => {
    const { dataTree } = this.state;
    for (let item of menuTreeList) {
      if (item.nodeKey === params.nodeKey && item.isGroup === params.isGroup || (!item.isGroup && item.id === params.orgId)) {
        item.checked = isCheck;
        // if (!render) {
        //   if (Array.isArray(item.children) && item.children.length) {
        //     this.checkChildTrue(item.children, isCheck, params);
        //   }
        // }
      } else if (Array.isArray(item.children) && item.children.length) {
        this.getMenuBtnList(item.children, isCheck, params, render);
      }
    }
    this.setState({ dataTree });
  };
  checkChildTrue = (menuTreeList, isCheck) => {
    let { roleData } = this.state;
    for (let item of menuTreeList) {
      item.checked = isCheck;
      if (isCheck) {
        if (roleData.findIndex(v => {
          return v.orgId === item.id;
        }) === -1) {
          roleData.push({
            orgName: item.name,
            orgId: item.id,
          });
        }
      } else {
        roleData.splice(roleData.findIndex(v => {
          return v.orgId === item.id;
        }), 1);
      }
      if (Array.isArray(item.children) && item.children.length) {
        this.checkChildTrue(item.children, isCheck);
      }
    }
  };
  changeRoleTree = (menuTreeList, isCheck) => {
    let { roleData } = this.state;
    for (let item of menuTreeList) {
      if (isCheck) {
        if (roleData.findIndex(v => {
          return v.orgId === item.id;
        }) === -1 && !item.isGroup) {
          roleData.push({
            orgName: item.name,
            orgId: item.id,
          });
        }
        this.setState({
          roleData,
        });
        this.props.tabDefaultConfig.updateOrgData(roleData);
      }
      item.checked = isCheck;
      if (Array.isArray(item.children) && item.children.length) {
        this.changeRoleTree(item.children, isCheck);
      }
    }
  };
  /**
   * 删除对应的数据
   * @param type
   */
  delFunction = (type) => {
    const { langLib } = this.context;
    if (this.state.id) {
      let that = this;
      let { close } = ModalBox.confirm({
        ...getDefaultConfirmProps(langLib),
        onOk: () => {
          let menuTreeList = that.state.dataTree;
          let dataRole = that.state.roleData;
          let currentObj = dataRole.find(v => {
            return v.orgId === this.state.id;
          });
          dataRole.splice(dataRole.findIndex(v => {
            return v.orgId === this.state.id;
          }), 1);
          if (currentObj) {
            this.getMenuBtnList(menuTreeList, false, currentObj);
          }
          that.setState({
            dataTree: menuTreeList,
            roleData: dataRole,
          });
          this.props.tabDefaultConfig.updateOrgData(dataRole);
          closeModal();
        },
        onCancel: () => closeModal(),
      });
      const closeModal = () => {
        close();
      };
      // confirm({
      //   ...getDefaultConfirmProps(langLib),
      //   onOk: () => {
      //     let menuTreeList = that.state.dataTree;
      //     let dataRole = that.state.roleData;
      //     let currentObj = dataRole.find(v => {
      //       return v.orgId === this.state.id;
      //     });
      //     dataRole.splice(dataRole.findIndex(v => {
      //       return v.orgId === this.state.id;
      //     }), 1);
      //     if (currentObj) {
      //       this.getMenuBtnList(menuTreeList, false, currentObj);
      //     }
      //     that.setState({
      //       dataTree: menuTreeList,
      //       roleData: dataRole,
      //     });
      //     this.props.tabDefaultConfig.updateOrgData(dataRole);
      //   },
      //   onCancel() {
      //     console.log('Cancel');
      //   },
      // });
    } else {
      CMessage(langLib('message.please.choose'), 'error');
    }
  };
  setRowClassName = (record) => {
    return record.orgId === this.state.id ? 'clickRowStyl' : '';
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
          id: recordRow.orgId,
        });
      },
    };
  };
  // 点击行，分2种情况，如果是选择之后点击行，展开的子节点根据是选择中展开，反之
  clickTreeRow = (record, callback, type) => {
    const { dataTree, expandedRowKeys, roleData } = this.state;
    if (expandedRowKeys.includes(record.nodeKey)) {
      let index = expandedRowKeys.findIndex(item => item === record.nodeKey);
      expandedRowKeys.splice(index, 1);
      this.setState({ expandedRowKeys });
    } else {
      expandedRowKeys.push(record.nodeKey);
      this.setState({ expandedRowKeys });
    }
    if ((Array.isArray(record.children) && record.children.length)) {

    } else {
      let params = record.isGroup ? { groupId: record.id } : { rootId: record.id };
      this.setState({ loading: true });
      getRoleDataTree(params).then(res => {
        record.children = res;
        this.setState({
          dataTree,
          loading: false,
        }, () => {
          if (roleData.length) {
            roleData.forEach(item => {
              this.getMenuBtnList(this.state.dataTree, true, item, 'render');
            });
          }
        });
      });
    }
    ;
  };

  render() {
    const { tabDefaultConfig } = this.props;
    const { canmodify } = tabDefaultConfig.functionData.attributes;
    const { activeDetail, expandedRowKeys, pcObj, appObj } = this.state;
    const { basetype } = activeDetail;
    const pcColumns = getPcColumns({ canmodify, pcObj, checkTypeAll: this.checkTypeAll, checkType: this.checkType });
    const appColumns = getAppColumns({ canmodify, appObj, checkAppAll: this.checkAppAll, checkApp: this.checkApp });
    const { loading, dataSourcePC, dataSourceApp, dataTree, roleData } = this.state;
    const PCDeafaultConfig = {
      className: styles.tabHeight,
      columns: pcColumns,
      dataSource: dataSourcePC,
      pagination: false,
      loading: loading,
      rowKey: (record) => record.nodeKey,
      // defaultExpandAllRows: true,
      expandRowByClick: true,
      scroll: { x: 1500, y: 92 },
      expandIcon: this.CustomExpandIcon,
    };
    const APPDeafaultConfig = {
      className: styles.tabHeight,
      columns: appColumns,
      dataSource: dataSourceApp,
      pagination: false,
      loading: loading,
      rowKey: (record) => record.nodeKey,
      // defaultExpandAllRows: true,
      expandRowByClick: true,
      expandIcon: this.CustomExpandIcon,
    };

    const functionColumns = [ // 数据权限
      {
        title: <span><FormattedMessage id="role.table.orgid"/><Checkbox style={{ 'visibility': 'hidden' }}/> </span>,
        dataIndex: 'name',
        key: 'name',
        width: '80%',
      },
      {
        title: '',
        dataIndex: 'caninherit',
        key: 'caninherit',
        width: '8%',
        render: (text, record) => {
          return (<div>{record.isGroup ? null :
            <Checkbox checked={record.checked} onChange={e => this.selectCheckbox(e, record)}/>
          }</div>);
        },
      },
    ];
    const treeDeafaultConfig = {
      columns: functionColumns,
      dataSource: dataTree,
      loading: loading,
      expandedRowKeys,
      // defaultExpandAllRows: true,
      expandRowByClick: true,
      expandIcon: this.CustomExpandIcon1,
      rowKey: record => record.nodeKey,
      // rowSelection: rowSelection,
      pagination: false,
      onRow: record => {
        return {
          onClick: event => {
            this.clickTreeRow(record);
          }, // 点击行
        };
      },
    };

    const functionRoleColumns = [
      {
        title: <FormattedMessage id="role.table.orgid"/>,
        dataIndex: 'orgName',
        key: 'orgName',
        width: '36%',
      },
      {
        title: (
          <div><span onClick={() => this.delFunction('function')}
                     className={`custom-color iconfont icondelete ${styles.delBtn}`}></span>
          </div>),
        dataIndex: 'caninherit',
        key: 'caninherit',
        width: '8%',
      },
    ];
    const functionListConfig = { // 已经选中的组织
      columns: functionRoleColumns,
      dataSource: roleData,
      loading: loading,
      rowKey: record => record.orgId,
      pagination: false,
      rowClassName: this.setRowClassName,
      onRow: this.onClickRow,
    };
    return (
      basetype === 1 ? <Tabs
        defaultActiveKey={tabDefaultConfig.tabsActive}
        activeKey={tabDefaultConfig.tabsActive}
        animated={false}
        className={`${tabDefaultConfig.className} userTabStyle`}
        onChange={(activeKey) => this.changeTab(activeKey)}
      >
        <TabPane tab={<FormattedMessage id="splitLine.title.basic"/>} key="base">
          <FormConfigDetial tabDefaultConfig={tabDefaultConfig}/>
        </TabPane>
        <TabPane tab={<FormattedMessage id="role.tab.pc"/>} key="pc"> {/*pc权限*/}
          <div className={styles.tabTitle}><FormattedMessage id="role.table.relation"/><span
            className="custom-color">【{activeDetail.name}】</span><FormattedMessage id="role.table.to"/></div>
          <CTable id="pc" {...PCDeafaultConfig}/>
        </TabPane>
        <TabPane tab={<FormattedMessage id="role.tab.app"/>} key="app"> {/*app权限*/}
          <div className={styles.tabTitle}><FormattedMessage id="role.table.relation"/><span
            className="custom-color">【{activeDetail.name}】</span><FormattedMessage id="role.table.to"/></div>
          <CTable {...APPDeafaultConfig}/>
        </TabPane>
      </Tabs> : <Tabs
        defaultActiveKey={tabDefaultConfig.tabsActive}
        activeKey={tabDefaultConfig.tabsActive}
        animated={false}
        className={`${tabDefaultConfig.className} userTabStyle`}
        onChange={(activeKey) => this.changeTab(activeKey)}
      >
        <TabPane tab={<FormattedMessage id="splitLine.title.basic"/>} key="base">
          <FormConfigDetial tabDefaultConfig={tabDefaultConfig}/>
        </TabPane>
        <TabPane tab={<FormattedMessage id="role.role.data"/>} key="data"> {/*数据权限*/}
          <div className={styles.tabTitle}><FormattedMessage id="role.table.relation"/><span
            className="custom-color">【{activeDetail.name}】</span><FormattedMessage id="role.table.to"/></div>
          <Row className={styles.rowHeight}>
            <div style={{ 'flex': 2, 'marginRight': '20px' }}>
              <CTable {...treeDeafaultConfig}/>
            </div>
            <div style={{ 'flex': 1 }}>
              < CTable {...functionListConfig}/>
            </div>
          </Row>
        </TabPane>
      </Tabs>
    );
  }
}

export default Ctab;
