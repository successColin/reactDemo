import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs, Checkbox, Row, Col, Modal, message } from 'antd';
import FormConfigDetial from './formDetial';
import CopyRole from '@/components/userManager/component/copyrole';
import { BaseContext } from '@/constants/global';
import CTable from '@/components/common/BasicWidgets/Widgets/CTable/CTable';
import {
  getUserPermissionTree,
  updateUserFunctionPerssion,
  updateUserRowFunctionPerssion,
  getUserAppree,
  updateUserApp,
  updateRowUser,
  getUserOfRoleTree,
  inserAppPermisson,
  insertApp,
  getUserData, getUserGroup,
} from '@/services/userManager';
import { getRoleDataTree } from '@/services/roleManger';
import { getDefaultConfirmProps } from '@/utils/common';
import styles from '../userConfig.less';
import { getRoleOrgData } from '@/services/roleManger';
import { CMessage } from '@/components/common/BasicWidgets';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';
import { getAppColumns, getPcColumns } from '@/components/RoleManager/columns';

const { TabPane } = Tabs;
const { confirm } = Modal;

const checkObj = {
  caninherit: 0, // 继承
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

class Ctab extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super();
    this.state = {
      loading: false,
      expandedRowKeys: [], // 数据权限选中的组
      activeDetail: {}, // 当前选中的角色
      dataSourcePC: [], // pc树
      dataSourceApp: [], // app树
      tree: [], // 功能角色树
      dataTree: [], // 数据角色树
      functionRole: [], // 功能角色列表
      dataRole: [], // 数据角色列表
      id: '',
      pcObj: checkObj, // pc头部选中的权限
      appObj: checkObj, // app头部选中的权限
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.tabDefaultConfig.activeDetail.id !== this.state.activeDetail.id) {
      this.setState({
        activeDetail: nextProps.tabDefaultConfig.activeDetail,
        expandedRowKeys: [],
        pcObj: checkObj,
        appObj: checkObj,
      });
    }
  }

  componentDidUpdate() {
    // const height = document.getElementById('pc_user') && document.getElementById('pc_user').offsetHeight;
    // const table = document.querySelector('#pc_user .ant-table-body-inner');
    // if (table) table.style.maxHeight = `${height - 38}px`;
  }

  /**
   * 获取关联角色权限
   * @param id
   */
  getUserOfRoleAuthority = (id) => {
    this.setState({ loading: true });
    let params = { mainId: id };
    getUserOfRoleTree(params).then((res) => {
      const { tree, functionRole, dataRole } = res;
      this.setState({ loading: false, tree, functionRole, dataRole });
      this.props.tabDefaultConfig.updateRoleState(dataRole, functionRole, tree);
    });
  };

  /**
   * 获取角色对应的权限
   */
  getPCauthority = (id) => {
    this.setState({ loading: true });
    let params = { relationId: id };
    getUserPermissionTree(params).then((res) => {
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
    getUserAppree(params).then((res) => {
      this.setState({
        loading: false,
        dataSourceApp: res,
      });
    });
  };
  CustomExpandIcon1 = (props) => {
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
  CustomExpandIcon = (props) => {
    let icon = null;
    if (props.expanded && Array.isArray(props.record.children) && props.record.children.length) {
      icon = 'icon-arrow-open';
    } else if (!props.expanded && (props.record.childCount)) {
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
    e.stopPropagation();
    const { langLib } = this.context;
    const { id } = this.state.activeDetail;
    const { pcObj } = this.state;
    let data;
    this.setState({ loading: true });
    const isCheck = e.target.checked ? 1 : 0;
    if (type === 'all') {
      data = {
        relationId: id,
        // caninherit: e.target.checked ? 1 : 0,
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
          caninherit: 0,
          all: isCheck,
        },
      });
    } else {
      data = {
        relationId: id,
        [type]: isCheck,
      };
      if (type === 'caninherit') {
        this.setState({
          pcObj: {
            all: 0,
            canadd: 0,
            canmodify: 0,
            candelete: 0,
            canview: 0,
            canprint: 0,
            candesign: 0,
            canAddFolder: 0,
            canUploadFile: 0,
            canRelation: 0,
            canUpdateFolder: 0,
            canDelFolderFile: 0,
            caninherit: isCheck,
          },
        });
      } else {
        let checkPcType = {
          ...pcObj,
          [type]: isCheck,
        };

        this.setState({
          pcObj: {
            ...pcObj,
            caninherit: 0,
            all: checkPcType.canAddFolder && checkPcType.canUploadFile && checkPcType.canRelation && checkPcType.canUpdateFolder && checkPcType.canDelFolderFile && checkPcType.canadd && checkPcType.candelete && checkPcType.candesign && checkPcType.canmodify && checkPcType.canprint && checkPcType.canview ? 1 : 0,
            [type]: isCheck,
          },
        })
        ;
      }
    }
    updateUserRowFunctionPerssion(data).then(res => {
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
    e.stopPropagation();
    const { langLib } = this.context;
    const { id } = this.state.activeDetail;
    let data;
    const checkValue = e.target.checked ? 1 : 0;
    this.setState({ loading: true });
    if (type === 'all') {
      data = {
        relationId: id,
        functionId: record.id,
        canadd: checkValue,
        //     caninherit: e.target.checked ? 1 : 0,
        canmodify: checkValue,
        candelete: checkValue,
        canview: checkValue,
        canprint: checkValue,
        candesign: checkValue,
        canAddFolder: checkValue,
        canUploadFile: checkValue,
        canRelation: checkValue,
        canUpdateFolder: checkValue,
        canDelFolderFile: checkValue,
      };
    } else {
      data = {
        relationId: id,
        functionId: record.id,
        [type]: checkValue,
      };
    }
    let params;
    if (type !== 'caninherit') {
      params = Object.assign({ ...record.attributes }, data);
      delete params.caninherit;
    } else {
      params = Object.assign({}, params, data, { id: record.attributes && record.attributes.id });
    }
    updateUserFunctionPerssion(params).then((res) => {
      CMessage(langLib['reload.real'], 'success');
      this.getPCauthority(id);
    }, err => {
      this.setState({ loading: false });
    });
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
    const isCheck = e.target.checked ? 1 : 0;
    let data;
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
          caninherit: 0,
          all: isCheck,
        },
      });
    } else {
      data = {
        relationId: id,
        [type]: isCheck,
      };
      if (type === 'caninherit') {
        this.setState({
          appObj: {
            all: 0,
            canadd: 0,
            canmodify: 0,
            candelete: 0,
            canview: 0,
            canprint: 0,
            candesign: 0,
            caninherit: isCheck,
          },
        });
      } else {
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
        })
        ;
      }
    }
    this.setState({ loading: true });
    updateRowUser(data).then(res => {
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
    const isCheck = e.target.checked ? 1 : 0;
    let data;
    this.setState({ loading: true });
    if (record.type === 'APP') {
      if (type === 'caninherit') {
        data = {
          relationId: id,
          appId: record.id,
          [type]: isCheck,
        };

        let params = Object.assign({}, record.attributes, data);
        insertApp(params).then(res => {
          CMessage(langLib['reload.real'], 'success');
          this.getAPPauthority(id);
        }, err => {
          this.setState({ loading: false });
        });
      } else {
        data = {
          relationId: id,
          appId: record.id,
          [type]: isCheck,
        };
        let params = Object.assign({}, record.attributes, data);
        if (record.caninherit && type !== 'caninherit') {
          params.caninherit = 0;
        }
        inserAppPermisson(params).then(res => {
          CMessage(langLib['reload.real'], 'success');
          this.getAPPauthority(id);
        }, err => {
          this.setState({ loading: false });
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
        };
      } else {
        data = {
          relationId: id,
          bundleId: record.id,
          [type]: isCheck,
        };
      }
      let params;
      if (type !== 'caninherit') {
        params = Object.assign({ ...record.attributes }, data);
        delete params.caninherit;
      } else {
        params = Object.assign({}, params, data, {
          id: record.attributes.id,
          // bundleId: record.attributes && record.attributes.bundleId,
        });
      }
      updateUserApp(params).then(res => {
        CMessage(langLib['reload.real'], 'success');
        this.getAPPauthority(id);
      }, err => {
        this.setState({ loading: false });
      });
    }

  };
  /**
   * 面板切换
   * @param active
   */
  changeTabActive = (active) => {
    const { id } = this.state.activeDetail;
    this.props.tabDefaultConfig.changeTab(active, () => {
      if (active === 'role') {
        this.getUserOfRoleAuthority(id);
      } else if (active === 'pc') {
        this.getPCauthority(id);
      } else if (active === 'app') {
        this.getAPPauthority(id);
      } else if (active === 'data') {
        this.getRoleDataTree();
      } else if (active === 'copy') {
        this.relationTabRef && this.relationTabRef.getData();
      }
    });
  };
  // 数据权限树
  getRoleDataTree = () => {
    const { id } = this.state.activeDetail;
    let params = {
      userId: id,
    };
    this.setState({
      loading: true,
    });
    getUserData(params).then(data => {
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
    let { tree, functionRole, dataRole } = this.state;
    let menuTreeList = tree;
    if (record.baseType === 1) {
      if (isCheck) {
        if (functionRole.findIndex(v => {
          return v.id === record.id;
        }) === -1) {
          functionRole.push({
            name: record.name,
            id: record.id,
          });
        }

      } else {
        functionRole.splice(functionRole.findIndex(v => {
          return v.id === record.id;
        }), 1);
      }
    }
    if (record.baseType === 2) {
      if (isCheck) {
        if (dataRole.findIndex(v => {
          return v.id === record.id;
        }) === -1) {
          dataRole.push({
            name: record.name,
            id: record.id,
          });
        }
      } else {
        dataRole.splice(dataRole.findIndex(v => {
          return v.id === record.id;
        }), 1);
      }
    }

    this.getMenuBtnList(menuTreeList, isCheck, record);
    this.setState({
      tree: menuTreeList,
      id: '',
    });
    this.props.tabDefaultConfig.updateRoleState(dataRole, functionRole, menuTreeList);
  };
  /**
   * 关联角色全选
   * @param e
   */
  checkRoleAll = (e) => {
    e.stopPropagation();
    const isCheck = e.target.checked;
    let { tree } = this.state;
    let menuTreeList = tree;
    if (!isCheck) {
      this.setState({
        dataRole: [],
        functionRole: [],
        id: '',
      });
      this.props.tabDefaultConfig.updateRoleState([], []);
    }
    this.changeRoleTree(menuTreeList, isCheck);
    this.setState({
      tree: menuTreeList,
      id: '',
    });
  };
  /**
   * 全选或者取消时改变数据类型
   */
  changeRoleTree = (menuTreeList, isCheck) => {
    let { dataRole, functionRole } = this.state;
    for (let item of menuTreeList) {
      if (isCheck) {
        if (item.baseType === 1 && !item.isGroup) {
          if (functionRole.findIndex(v => {
            return v.id === item.id;
          }) === -1) {
            functionRole.push({
              name: item.name,
              id: item.id,
            });
          }

        }
        if (item.baseType === 2 && !item.isGroup) {
          if (dataRole.findIndex(v => {
            return v.id === item.id;
          }) === -1) {
            dataRole.push({
              name: item.name,
              id: item.id,
            });
          }
        }
        this.setState({
          functionRole, dataRole,
        });
        this.props.tabDefaultConfig.updateRoleState(dataRole, functionRole);
      }
      item.checked = isCheck;
      if (Array.isArray(item.children) && item.children.length) {
        this.changeRoleTree(item.children, isCheck);
      }
    }
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
        if (!render) {
          // if (Array.isArray(item.children) && item.children.length) {
          //   this.checkChildTrue(item.children, isCheck, params);
          // }
        }
      } else if (Array.isArray(item.children) && item.children.length) {
        this.getMenuBtnList(item.children, isCheck, params, render);
      }
    }
    this.setState({ dataTree });
  };
  checkChildTrue = (menuTreeList, isCheck) => {
    let { roleData = [] } = this.state;
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
  /**
   * 选中行
   * @param recordROw
   * @returns {{onClick: onClick}}
   */
  onClickRow = (recordRow) => {
    return {
      onClick: () => {
        this.setState({
          id: recordRow.id,
        });
      },
    };
  };
  /**
   * 选中行
   * @param recordROw
   * @returns {{onClick: onClick}}
   */
  onClickRowData = (recordRow) => {
    return {
      onClick: () => {
        this.setState({
          id: recordRow.orgId,
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
    return record.id === this.state.id ? 'clickRowStyl' : '';
  };
  setDataRowClassName = (record) => {
    return record.orgId === this.state.id ? 'clickRowStyl' : '';
  };
  /**
   * 删除对应的数据
   * @param type
   */
  delFunction = (type) => {
    const { langLib } = this.context;
    if (this.state.id) {
      let { close } = ModalBox.confirm({
        ...getDefaultConfirmProps(langLib),
        onOk: () => {
          let menuTreeList = this.state.tree;
          let functionRole = this.state.functionRole;
          let dataRole = this.state.dataRole;
          this.delMenuBtnList(menuTreeList, type);
          this.setState({
            tree: menuTreeList,
          });
          if (type === 'function') {
            functionRole.splice(functionRole.findIndex(v => {
              return v.id === this.state.id;
            }), 1);
          } else {
            dataRole.splice(dataRole.findIndex(v => {
              return v.id === this.state.id;
            }), 1);
          }
          closeModal();
        },
        onCancel: () => closeModal(),
      });
      const closeModal = () => {
        close();
      };
      // confirm({
      //   ...getDefaultConfirmProps(langLib),
      //   title: '确定删除数据？',
      //   onOk: () => {
      //     let menuTreeList = this.state.tree;
      //     let functionRole = this.state.functionRole;
      //     let dataRole = this.state.dataRole;
      //     this.delMenuBtnList(menuTreeList, type);
      //     this.setState({
      //       tree: menuTreeList,
      //     });
      //     if (type === 'function') {
      //       functionRole.splice(functionRole.findIndex(v => {
      //         return v.id === this.state.id;
      //       }), 1);
      //     } else {
      //       dataRole.splice(dataRole.findIndex(v => {
      //         return v.id === this.state.id;
      //       }), 1);
      //     }
      //   },
      //   onCancel() {
      //     console.log('Cancel');
      //   },
      // });
    } else {
      message.error('请选择一条数据删除');
    }
  };
  delMenuBtnList = (menuTreeList, type) => {
    const basetype = type === 'function' ? 1 : 2;
    for (let item of menuTreeList) {
      if (!item.isGroup && item.baseType === basetype && item.id === this.state.id) {
        item.checked = false;
      } else if (Array.isArray(item.children) && item.children.length) {
        this.delMenuBtnList(item.children, type);
      }
    }
  };
  // 权限单选
  Checkbox = (e, record) => {
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
    // 递归勾选数据
    this.getMenuBtnList(menuTreeList, isCheck, record);
    this.setState({
      dataTree: menuTreeList,
      roleData,
    }, () => {
      isCheck && this.familyTree(record.rootId); // 递归把当前节点的所有父节点勾选上
    });
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

  checkDataAll = (e) => {
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
    this.changeDatTree(menuTreeList, isCheck);
    this.setState({
      dataTree: menuTreeList,
    });
  };
  changeDatTree = (menuTreeList, isCheck) => {
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
        this.changeDatTree(item.children, isCheck);
      }
    }
  };
  delOrg = () => {
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
    } else {
      message.error(langLib['confirm.choose.delete']);
    }
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
          // this.checkChildTrue(record.children, record.checked);
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
    const { activeDetail, dataTree, roleData, expandedRowKeys, pcObj, appObj } = this.state;
    const pcColumns = getPcColumns({
      canmodify,
      pcObj,
      checkTypeAll: this.checkTypeAll,
      checkType: this.checkType,
      isUser: true,
    });

    const appColumns = getAppColumns({
      canmodify,
      appObj,
      checkAppAll: this.checkAppAll,
      checkApp: this.checkApp,
      isUser: true,
    });


    const functionColumns = [
      {
        title: <FormattedMessage id="role.table.function"/>,
        dataIndex: 'name',
        key: 'name',
        width: '80%',
      },
      {
        title: (
          <div><Checkbox onChange={e => this.checkRoleAll(e)}/></div>),
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
    const functionRoleColumns = [
      {
        title: <FormattedMessage id="user.form.function"/>,
        dataIndex: 'name',
        key: 'name',
        width: '36%',
      },
      {
        title: (
          <div><span onClick={() => this.delFunction('function')}
                     className={`iconfont icondelete custom-color ${styles.delBtn}`}></span>
          </div>),
        dataIndex: 'caninherit',
        key: 'caninherit',
        width: '8%',
      },
    ];
    const dataRoleColumns = [
      {
        title: <FormattedMessage id="user.form.data"/>,
        dataIndex: 'name',
        key: 'name',
        width: '36%',
      },
      {
        title: (
          <div><span onClick={() => this.delFunction('data')}
                     className={`iconfont icondelete custom-color ${styles.delBtn}`}></span>
          </div>),
        dataIndex: 'caninherit',
        key: 'caninherit',
        width: '8%',
      },
    ];
    const { loading, dataSourcePC, dataSourceApp, tree, functionRole, dataRole } = this.state;
    const PCDeafaultConfig = {
      className: styles.tabHeight,
      columns: pcColumns,
      dataSource: dataSourcePC,
      pagination: false,
      loading: loading,
      // defaultExpandAllRows: true,
      expandRowByClick: true,
      expandIcon: this.CustomExpandIcon1,
      scroll: { x: 1500, y: 92 },
      rowKey: record => record.nodeKey,
    };
    const APPDeafaultConfig = {
      className: styles.tabHeight,
      columns: appColumns,
      dataSource: dataSourceApp,
      rowKey: record => record.nodeKey,
      pagination: false,
      loading: loading,
      defaultExpandAllRows: true,
      expandRowByClick: true,
      expandIcon: this.CustomExpandIcon1,
    };
    const treeDeafaultConfig = {
      columns: functionColumns,
      dataSource: tree,
      loading: loading,
      defaultExpandAllRows: true,
      expandRowByClick: true,
      expandIcon: this.CustomExpandIcon1,
      rowKey: record => record.nodeKey,
      // rowSelection: rowSelection,
      pagination: false,
    };
    const functionListConfig = {
      columns: functionRoleColumns,
      dataSource: functionRole,
      loading: loading,
      rowKey: record => record.id,
      pagination: false,
      rowClassName: this.setRowClassName,
      onRow: this.onClickRow,
    };

    const dataListConfig = {
      columns: dataRoleColumns,
      dataSource: dataRole,
      loading: loading,
      rowKey: record => record.id,
      pagination: false,
      rowClassName: this.setRowClassName,
      onRow: this.onClickRow,
    };
    const dataColumns = [ // 数据权限
      {
        title: <FormattedMessage id="role.table.orgid"/>,
        dataIndex: 'name',
        key: 'name',
        width: '80%',
      },
      {
        // title: (
        //   <div><Checkbox onChange={e => this.checkDataAll(e)}/></div>),
        title: '',
        dataIndex: 'caninherit1',
        key: 'caninherit1',
        width: '8%',
        render: (text, record) => {
          return (<div>{record.isGroup ? null :
            <Checkbox checked={record.checked} onChange={e => this.Checkbox(e, record)}/>
          }</div>);
        },
      },
    ];
    const treeDateDeafaultConfig = { // 数据权限
      columns: dataColumns,
      dataSource: dataTree,
      loading: loading,
      // defaultExpandAllRows: true,
      expandedRowKeys,
      expandRowByClick: true,
      expandIcon: this.CustomExpandIcon,
      rowKey: record => record.nodeKey,
      // rowSelection: rowSelection,
      pagination: false,
      onRow: record => {
        return {
          onClick: event => {
            this.clickTreeRow(record);
          }, // 点击行
          onDoubleClick: event => {
          },
          onContextMenu: event => {
          },
          onMouseEnter: event => {
          }, // 鼠标移入行
          onMouseLeave: event => {
          },
        };
      },
    };
    const dataOrgColumns = [
      {
        title: <FormattedMessage id="role.table.orgid"/>,
        dataIndex: 'orgName',
        key: 'orgName',
        width: '36%',
      },
      {
        title: (
          <div><span onClick={() => this.delOrg()}
                     className={`iconfont icondelete custom-color ${styles.delBtn}`}></span>
          </div>),
        dataIndex: 'caninherit3',
        key: 'caninherit3',
        width: '8%',
      },
    ];
    const dataListOrg = { // 已经选中的组织
      columns: dataOrgColumns,
      dataSource: roleData,
      loading: loading,
      rowKey: record => record.orgId,
      pagination: false,
      rowClassName: this.setDataRowClassName,
      onRow: this.onClickRowData,
    };

    return (
      <Tabs
        defaultActiveKey={tabDefaultConfig.tabsActive}
        activeKey={tabDefaultConfig.tabsActive}
        animated={false}
        className={`${tabDefaultConfig.className} userTabStyle`}
        onChange={(activeKey) => this.changeTabActive(activeKey)}
      >
        <TabPane tab={<FormattedMessage id="splitLine.title.basic"/>} key="base">
          <div className={styles.formWrap}>
            <FormConfigDetial tabDefaultConfig={tabDefaultConfig}/>
          </div>
        </TabPane>
        <TabPane tab={<FormattedMessage id="user.form.relationuser"/>} key="role"> {/*关联复制*/}
          {tabDefaultConfig.tabsActive === 'role' ? (<div style={{ 'width': '100%', 'height': 'calc(100%)' }}>
            <div className={styles.tabTitleSty}>
              <FormattedMessage id="role.table.relation"/>
              <span className="custom-color">【{activeDetail.username}】</span>
              <FormattedMessage id="user.form.relationuser"/>
            </div>
            <Row>
              <Col span={14}>
                <CTable {...treeDeafaultConfig}/>
              </Col>
              <Col span={10}>
                <div className={styles.divFlex}>
                  <div className={styles.divFlexSty}>
                    <CTable {...functionListConfig}/>
                  </div>
                  <div className={styles.divFlexSty}>
                    <CTable {...dataListConfig}/>
                  </div>
                </div>
              </Col>
            </Row></div>) : null}
        </TabPane>

        <TabPane tab={<FormattedMessage id="user.form.copyuser"/>} key="copy"> {/*角色复制*/}
          {tabDefaultConfig.tabsActive === 'copy' ? (<div style={{ 'width': '100%', 'height': 'calc(100%)' }}>
            <div className={styles.tabTitleSty}>
              <FormattedMessage id="role.table.jiang"/>
              <span className="custom-color">【{activeDetail.username}】</span>
              <FormattedMessage id="role.table.Permissionreplication"/>
            </div>
            <CopyRole style={{ 'height': 'calc(100% - 42px)' }}
                      activeDetail={activeDetail}
                      ref={ref => this.relationTabRef = ref}
                      updateFrameState={tabDefaultConfig.updateFrameState1}/></div>) : null}
        </TabPane>

        <TabPane tab={<FormattedMessage id="role.tab.pc"/>} key="pc"> {/*pc权限*/}
          {tabDefaultConfig.tabsActive === 'pc' ? (<div style={{ 'width': '100%', 'height': 'calc(100%)' }}>
            <div className={styles.tabTitleSty}><FormattedMessage id="role.table.relation"/><span
              className="custom-color">【{activeDetail.username}】</span><FormattedMessage id="role.table.to"/>
            </div>
            <CTable id="pc_user" {...PCDeafaultConfig}/></div>) : null}
        </TabPane>
        <TabPane tab={<FormattedMessage id="role.tab.app"/>} key="app"> {/*app权限*/}
          {tabDefaultConfig.tabsActive === 'app' ? (<div style={{ 'width': '100%', 'height': 'calc(100%)' }}>
            <div className={styles.tabTitleSty}><FormattedMessage id="role.table.relation"/><span
              className="custom-color">【{activeDetail.username}】</span><FormattedMessage id="role.table.to"/>
            </div>
            <CTable {...APPDeafaultConfig}/></div>) : null}
        </TabPane>
        <TabPane tab={<FormattedMessage id="role.role.data"/>} key="data">  {/*数据权限*/}
          {tabDefaultConfig.tabsActive === 'data' ? (<div style={{ 'width': '100%', 'height': 'calc(100%)' }}>
            <div className={styles.tabTitleSty}><FormattedMessage id="role.table.relation"/><span
              className="custom-color">【{activeDetail.username}】</span><FormattedMessage id="role.table.to"/></div>
            <Row className={styles.rowHeight}>
              <div style={{ 'flex': 2, 'marginRight': '20px' }}>
                <CTable {...treeDateDeafaultConfig}/>
              </div>
              <div style={{ 'flex': 1 }}>
                < CTable {...dataListOrg}/>
              </div>
            </Row></div>) : null}
        </TabPane>
      </Tabs>);
  }
}

export default Ctab;
