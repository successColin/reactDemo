/*
 * @Author: Fus
 * @Date:   2019-12-16 14:16:14
 * @Desc: 关联文档
 */
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import secret from '@/constants/secret';
import { Table, Modal, Icon, Select, Upload, Button, Form, Breadcrumb } from 'antd';
import { CTextArea, CInput, CSearch } from '@/components/common/BasicWidgets';
import { BaseContext } from '@/constants/global';
import CTable from '@/components/common/BasicWidgets/Widgets/CTable/CTable';
import NormalSearchSelect from '@/components/userManager/component/NormalSearchSelect/NormalSearchSelect';
import { VALID_REQUIRED_MESSAGE } from '@/constants/global';
import styles from './RelationFileTab.less';
import { CMessage } from '@/components/common/BasicWidgets';
import { formatTime, ImageCompression } from '@/utils/common';
import {
  insertFilesRelations,
  deleteFilesRelations,
  batchInsertFilesRelations,
  getRelationFiles,
  getFileGroupTree,
} from '@/services/relationFileTab';
import {
  createFileGroup,
  getFilesDetails,
  updateFileGroup,
} from '@/services/knowledgeBase';
import query from '@/constants/query';
import CModal from '@/components/common/CreateModal/CreateModal';
import FormItems from '@/components/common/FormItems/FormItems';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const { confirm } = Modal;
// @connect(state => ({
//   functionData: state.tabs.activeTabData.functionData,
//   userInfo: state.user.userInfo,
// }))

class RelationFileTab extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      tabActive: 'base', // 激活的面板
      treeData: [], // 树数据
      activeTreeNodeDetail: {}, // 当前选中的树节点信息
      activeDetail: {}, // 根据树节点信息获取的该节点具体详情
      editActiveDetail: {}, // 根据树节点信息获取的该节点具体详情
      actionType: '', // 操作类型
      loading: false,
      visible: false,
      groupId: '',
      rootId: '',
      keywords: '', // 关键字
      queryParam: { // 获取文件接口传参
        relationId: '',
        relationTableName: '',
        rootId: '',
        relationColumnName: 'id',
        tableGroupName: '',
      },
      filePath: [],
      activeFiles: {},
      saveLoading: false,
      modalTitle: '',
      relationFileTree: [], //关联资料文件树
      relationVisible: false, //关联资料文件树显示
      expandedRowKeys: [],
      selected: [],
      relationLoading: false,
      typeId: 2, //typeId = 1 为知识库关联文件
    };
  }

  // 获取关联文档
  fetchRelationFiles = (queryParam = this.state.queryParam, type) => {
    // queryParam.rootId = this.state.rootId || '';
    const { filePath } = this.state;
    this.setState({
      queryParam,
      loading: true,
    });
    this.getRelationFilesPost(queryParam);
  };
  // 获取关联资料文件树
  getRelationFileTree = (record) => {
    const params = {
      rootId: record ? record.rootId : 1,
      rootpath: record ? record.rootpath : '/',
      keywords: '',
    };
    getFileGroupTree(params).then(res => {
      this.setState({
        relationFileTree: res,
        relationLoading: false,
      });

    }, err => this.setState({ relationLoading: false }));
  };

  // 获取关联文档接口请求
  getRelationFilesPost = (param, type, item, data) => {
    const { filePath, typeId } = this.state;
    if (filePath.length === 1 && type === 1) {
      param.rootId = '';
      param.filesRelationsId = '';
    }
    let api = getRelationFiles;
    let params = param;
    if (typeId !== 2) {
      api = getFilesDetails;
      params = {
        groupId: param.rootId,
      };
    }
    api(params).then(activeDetail => {
      if (type === 1) {  // 刷新
        this.setState({
          activeDetail,
          loading: false,
        });
      } else if (type === 2) {  // 下一级文档
        let path = filePath;
        path.push(item);
        this.setState({
          activeDetail,
          groupId: item.id,
          rootId: item.id,
          loading: false,
        });
      } else if (type === 3) { // 文件路径
        this.setState({
          activeDetail,
          filePath: item,
          groupId: data.id,
          rootId: data.id,
          loading: false,
        });
      } else {
        this.setState({
          activeDetail,
          rootId: activeDetail.rootId,
          filePath: [{ 'name': '关联文档', id: activeDetail.rootId, typeId: 2 }],
          loading: false,
          typeId: 2,
        });

      }
    }, err => this.setState({ loading: false }));
  };
  // 获取下一级文档
  getFilesDetailsFunc = (item) => {
    const { queryParam, filePath } = this.state;
    const { relationId, relationTableName, relationColumnName, tableGroupName } = queryParam;
    this.setState({
      activeFiles: item,
      loading: true,
      typeId: item.typeId || '',
    }, () => {
      const param = {
        relationId,
        relationTableName,
        rootId: item.id,
        relationColumnName,
        filesRelationsId: item.filesRelationsId,
        tableGroupName,
      };
      this.getRelationFilesPost(param, 2, item);
    });

  };
  // 获取关联文档
  getRelationFilesFunc = () => {
    const { queryParam, rootId, filePath } = this.state;
    const { relationId, relationTableName, relationColumnName, tableGroupName } = queryParam;
    const param = {
      relationId,
      relationTableName,
      rootId: rootId,
      relationColumnName,
      filesRelationsId: filePath.length ? filePath[filePath.length - 1].filesRelationsId : null,
      tableGroupName,
    };
    this.setState({ loading: true });
    this.getRelationFilesPost(param, 1);
  };
  goToStep = (item, index) => {
    const { queryParam, filePath, rootId } = this.state;
    let path = filePath.slice(0, index + 1);
    const { relationId, relationTableName, relationColumnName, tableGroupName } = queryParam;
    let param = {
      relationId,
      relationTableName,
      rootId: item ? item.id : rootId,
      relationColumnName,
      filesRelationsId: item.filesRelationsId ? item.filesRelationsId : '',
      tableGroupName,
    };
    if (index === 0) {
      param = {
        relationId,
        relationTableName,
        relationColumnName,
        tableGroupName,
      };
      this.setState({
        typeId: 2,
      });
    }
    this.setState({
      loading: true,
      typeId: item.typeId,
    }, () => {
      this.getRelationFilesPost(param, 3, path, item);
    });

  };
  // 搜索
  searchDetails = (name) => {
    const { queryParam, rootId, filePath, typeId } = this.state;
    const { relationId, relationTableName, relationColumnName, tableGroupName } = queryParam;
    let param = {
      relationId,
      relationTableName,
      rootId: filePath.length > 1 ? rootId : '',
      name,
      relationColumnName,
      filesRelationsId: filePath.length ? filePath[filePath.length - 1].filesRelationsId : null,
      tableGroupName,
    };
    if (typeId === 2) {
      getRelationFiles(param).then(activeDetail => {
        this.setState({
          activeDetail,
        });
      });
    } else {
      param = {
        name,
        groupId: filePath.length > 1 ? rootId : '',
      };
      getFilesDetails(param).then(activeDetail => {
        this.setState({
          activeDetail,
        });
      });
    }

  };
  // 文件下载
  downloadFile = (e, i) => {
    const { userInfo } = this.props;
    const token = userInfo.token;
    let id = e.id;
    let url = query.RELATION_DOWNLOAD_FILE + '?id=' + id + '&token=' + token;
    const aElement = document.createElement('a');
    document.body.appendChild(aElement);
    aElement.style.display = 'none';
    aElement.setAttribute('target', '_blank');
    aElement.setAttribute('download', 'download');
    aElement.href = url;
    aElement.download = e.displayFileName;
    aElement.click();
    document.body.removeChild(aElement);
  };
  formatSize = (length) => {
    let size = '';
    if (length < 1024) {
      size = length + 'K';
    } else if (length >= 1024) {
      size = parseInt(length / 10.24) / 100 + 'M';
    }
    return size;
  };

  // 显示关联资料树
  showRelationFileModal = () => {
    this.setState({
      relationVisible: true,
      relationLoading: true,
    });
    this.getRelationFileTree();
  };

  // 显示新建文件夹
  showCreateModal = () => {
    const { langLib } = this.context;
    this.setState({
      visible: true,
      modalTitle: langLib['file.createFile'],
      isEdit: false,
    });
  };
  // 确认关联
  confirmRelation = e => {
    this.batchRelationFile();
  };
  // 取消关联
  cancelRelation = e => {
    this.setState({
      relationVisible: false,
      expandedRowKeys: [],
      selected: [],
    });
  };
  // 确认新建文件夹
  confirmFunction = e => {
    const { form } = this.props;
    const { rootId, editActiveDetail } = this.state;
    let param = form.getFieldsValue();
    form.validateFields((errs, values) => {
      if (errs) return;
      const { activeDetail: { filegroupList = [] } } = this.state;
      let existList = filegroupList.filter(item => {
        if (!this.state.isEdit) return item.name === values.name && item.orgId === values.orgId;
        return item.id !== editActiveDetail.id && item.name === values.name && item.orgId === values.orgId;
      });
      if (existList.length) {
        const { langLib } = this.context;
        CMessage(langLib['file.is.exist'], 'error');
        return;
      }
      this.setState({
        saveLoading: true,
      });
      if (!this.state.isEdit) {
        param.rootId = rootId;
        this.addFileGroupFunction(e, param);
      } else {
        let detail = editActiveDetail;
        detail.memo = param.memo;
        detail.name = param.name;
        detail.orgId = param.orgId;
        detail.orgName = param.orgName;
        param.id = editActiveDetail.id;
        param.rootId = editActiveDetail.rootId;
        this.editFileGroupFunction(e, param);
      }
    });
  };
  // 取消新建文件夹
  cancelFunction = e => {
    this.setState({
      isEdit: false,
      visible: false,
      editActiveDetail: {},
    });
  };
  // 确认新建文件夹
  addFileGroupFunction = (e, param) => {
    const { queryParam } = this.state;
    createFileGroup(param).then(res => {
      this.relationFile(res.id, 1, res.orgId);
    }, err => {
      this.setState({
        saveLoading: false,
        typeId: 2,
      });
    });
  };
  // 修改文件夹
  editFileGroupFunction = (e, param) => {
    const { langLib } = this.context;
    updateFileGroup(param).then(res => {
      this.getRelationFilesFunc();
      this.setState({
        visible: false,
        editActiveDetail: {},
        saveLoading: false,
        typeId: 2,
      });
      CMessage(langLib['message.save.success'], 'success');
    }, err => {
      this.setLoadingStatus('getTree', false);
      this.setState({
        saveLoading: false,
      });
    });
  };
  // 删除文件夹
  deleteFileGroup = (e, type, d) => {
    const { langLib } = this.context;
    const { queryParam, rootId, filePath } = this.state;
    const { relationId, relationTableName, relationColumnName, tableGroupName } = queryParam;
    let id = e.filesRelationsId;
    let { close } = ModalBox.confirm({
      title: langLib['confirm.del.default'],
      onOk: () => {
        let param = { id: id };
        this.setState({
          loading: true,
        });
        deleteFilesRelations(param).then(result => {
          const param = {
            relationId,
            relationTableName,
            rootId: filePath[filePath.length - 1].id,
            relationColumnName,
            filesRelationsId: filePath.length ? filePath[filePath.length - 1].filesRelationsId : null,
            tableGroupName,
          };
          this.getRelationFilesPost(param, type);
          closeModal();
        });
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
  };
  // 编辑文件夹
  editFiles = (item, record) => {
    const { langLib } = this.context;
    this.setState({
      isEdit: true,
      visible: true,
      editActiveDetail: item,
      modalTitle: langLib['file.editFile'],
    });
  };
  // 选择组织字段
  handleSetSelectSearchValue = (selected, name, id) => {
    const { activeTreeNodeDetail } = this.state;
    this.props.form.setFieldsValue({
      [id]: selected[0].id,
      [name]: selected[0].name,
    });
    this.setState({
      activeTreeNodeDetail: {
        ...activeTreeNodeDetail,
        [id]: selected[0].id,
        [name]: selected[0].name,
      },
    });
  };

  // 新建文件夹表单选项
  getFormConfigs() {
    const {
      editActiveDetail,
    } = this.state;
    const publicProps = { disabled: false };
    const { langLib } = this.context;
    // 描述
    const { form } = this.props;
    const publicBasicConfig = [
      {
        key: 'name',
        colSpan: 12,
        label: <FormattedMessage id="element.name"/>,
        config: {
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }, {
            pattern: /^[^\s]*$/,
            message: langLib['No.spaces'],
          }],
          initialValue: editActiveDetail.name || '',
        },
        component: <CInput {...publicProps} />,

      }, {
        key: 'orgName',
        label: <FormattedMessage id="global.org"/>,
        component: (
          <NormalSearchSelect
            form={form}
            type="org"
            treeNodeType={2}
            currentKey={editActiveDetail.orgId + '-ORGANIZATION'}
            currentId={editActiveDetail.orgId}
            setSelected={selecteds => this.handleSetSelectSearchValue(selecteds, 'orgName', 'orgId')}
          />
        ),
        config: {
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }],
          initialValue: editActiveDetail.orgName || '',
        },
      }, { // 组织机构
        key: 'orgId',
        colSpan: 12,
        config: {
          initialValue: editActiveDetail.orgId || -1,
        },
        component: (
          <CInput style={{ 'display': 'none' }}/>
        ),
      }, {
        key: 'memo',
        label: <FormattedMessage id="global.memo"/>,
        config: {
          initialValue: editActiveDetail.memo || '',
        },
        colSpan: 24,
        component: <CTextArea/>,
      },
    ];

    return [
      ...publicBasicConfig,
    ];
  }

  // 上传前校验
  beforeUpload = file => {
    const { size, type, name } = file;
    const { fileType = 'image' } = this.props;
    const { max } = this.state;
    const { langLib } = this.context;
    const isLtMax = size / 1024 / 1024 < 2;
    // 文件过大
    // if (!isLtMax) {
    //   CMessage(langLib['file.overSize'](max), 'error');
    //   return false;
    // }
    if (this.checkFileType(name) == 'forbid') {
      CMessage(langLib['file.unAcceptType'], 'error');
      return false;
    }
    return new Promise((resolve, reject) => {
      const { activeDetail: { fileList = [] } } = this.state;
      if (fileList.find(item => item.displayFileName === name)) {
        CMessage(langLib['messge.error.keycode'](name), 'error');
        reject(file);
      } else if (this.checkFileType(name) == 'forbid') {
        reject(file);
      } else {
        // 图片压缩
        if (this.checkFileType(name) == 'img') {
          ImageCompression({ file, quality: 0.6 }, (imgFile) => {
            resolve(imgFile);
          });
        } else {
          resolve(file);
        }
      }
    });
  };
  checkFileType = (name) => {
    let result;
    if (name.indexOf('.jsp') !== -1 || name.indexOf('.jspx') !== -1 || name.indexOf('.jspf') !== -1 || name.indexOf('.asp') !== -1 || name.indexOf('.asa') !== -1 || name.indexOf('.cer') !== -1 || name.indexOf('.aspx') !== -1) {
      result = 'forbid';
    } else if (name.toLowerCase().indexOf('.jpg') !== -1 || name.toLowerCase().indexOf('.jpeg') !== -1 || name.toLowerCase().indexOf('.png') !== -1 || name.toLowerCase().indexOf('.bmp') !== -1 || name.toLowerCase().indexOf('.gif') !== -1 || name.toLowerCase().indexOf('.heic') !== -1) {
      result = 'img';
    } else {
      result = 'file';
    }
    return result;
  };
  onChange = ({ file, fileList }) => {
    const { status } = file;
    const { langLib } = this.context;
    // 上传中
    if (status === 'uploading') {
      this.setState({
        loading: true,
      });
    } else if (status === 'error' || (status === 'done' && !file.response)) {
      // 上传异常
      CMessage(langLib['file.error'], 'error');
      this.setState({
        loading: false,
      });
    } else if (status === 'done' && file.response) {
      if (!file.response || !file.response.success) {
        CMessage(langLib['file.error'], 'error');
        this.setState({
          loading: false,
        });
        return;
      }
      // CMessage(langLib['file.success'], 'success');
      // 文件上传完成后关联
      // this.goToStep();
      const { userInfo } = this.props;
      const { queryParam, rootId } = this.state;
      const { relationId, relationTableName } = queryParam;
      const param = {
        relationId,
        relationTableName,
        rootId: rootId,
      };
      const orgId = userInfo.orgId || -1;
      this.relationFile(file.response.data[0].id, 2, orgId);
      // this.getRelationFilesPost(param, 1)
      this.setState({
        loading: false,
      });
      return;
    }
  };
  // 关联文件
  relationFile = (mainId, basetype, orgId) => {
    const { langLib } = this.context;
    const { queryParam, rootId, filePath } = this.state;
    const { relationId, relationTableName, relationColumnName, tableGroupName } = queryParam;
    const param = {
      mainId,
      relationId,
      relationTableName,
      basetype,
      relationColumnName,
      filesRelationsId: filePath.length ? filePath[filePath.length - 1].filesRelationsId : null,
      orgId: orgId || -1,
      tableGroupName,
      typeId: 2,
    };
    insertFilesRelations(param).then(res => {
      const param = {
        relationId,
        relationTableName,
        rootId: filePath[filePath.length - 1].id || rootId,
        relationColumnName,
        filesRelationsId: filePath.length ? filePath[filePath.length - 1].filesRelationsId : null,
        tableGroupName,
      };
      this.setState({
        visible: false,
        editActiveDetail: {},
        loading: true,
        saveLoading: false,
      });
      this.getRelationFilesPost(param, 1);
      CMessage(langLib['message.save.success'], 'success');
    });
  };

  // 批量关联文件
  batchRelationFile = (mainId, basetype) => {
    const { langLib } = this.context;
    const { queryParam, rootId, selected, filePath } = this.state;
    const { userInfo } = this.props;
    const { relationId, relationTableName, relationColumnName, tableGroupName } = queryParam;
    if (!selected.length) {
      CMessage(langLib['message.error.noSelected'], 'error');
      return;
    }
    const params = selected.map((item) => {
      return {
        mainId: item.id,
        relationId,
        relationTableName,
        basetype: item.type === 'FILES' ? 2 : 1,
        relationColumnName,
        filesRelationsId: filePath.length ? filePath[filePath.length - 1].filesRelationsId : null,
        orgId: userInfo.orgId || -1,
        tableGroupName,
        typeId: 1,
      };
    });
    batchInsertFilesRelations({ fileString: JSON.stringify(params) }).then(res => {
      const param = {
        relationId,
        relationTableName,
        rootId: rootId,
        relationColumnName,
        filesRelationsId: filePath.length ? filePath[filePath.length - 1].filesRelationsId : null,
        tableGroupName,
      };
      this.setState({
        relationVisible: false,
        expandedRowKeys: [],
        selected: [],
      });
      this.getRelationFilesPost(param, 1);
      CMessage(langLib['message.save.success'], 'success');
    });
  };
  // 当前文件路径
  itemRender = () => {
    const { filePath } = this.state;
    return filePath.map((item, index) => {
      if (index === filePath.length - 1) {
        return <span onClick={() => this.goToStep(item, index)}>{item.name}</span>;
      } else {
        return <span onClick={() => this.goToStep(item, index)}>{item.name} > </span>;
      }
    });
  };
  // 文件图标
  showNameHtml = (name, id, record) => {
    if (id.formatFileLength) {
      return <div><span className="iconfont icon-export-docx custom-color"></span><span>{name}</span></div>;
    } else {
      return <div style={{ 'cursor': 'pointer' }} onClick={this.getFilesDetailsFunc.bind(this, id, record)}><span
        className="iconfont icon-file-yellow"
      ></span><span>{name}</span></div>;
    }
  };
  // 操作图标
  showIconHtml = (name, id, record) => {
    const { typeId } = this.state;
    const { functionData } = this.props;
    const { attributes } = functionData;
    const { canUpdateFolder, canDelFolderFile } = attributes;
    const updateIcon = canUpdateFolder === 1 && id.typeId === 2 ?
      <span onClick={this.editFiles.bind(this, id, item)} className="iconfont iconEdit custom-color"/> : '';
    const deleteIcon = canDelFolderFile === 1 && typeId === 2 ? <span
      onClick={this.deleteFileGroup.bind(this, id, 1)} className="iconfont icondelete custom-color"
    /> : '';
    const item = record;
    if (id.formatFileLength) {
      return <div><span onClick={this.downloadFile.bind(this, id)}
                        className="iconfont iconDown custom-color"/>{deleteIcon}</div>;
    } else {
      return <div>{updateIcon}{deleteIcon}</div>;
    }
  };

  setContent = () => {
    const content = (
      <div className={styles.uploadBtn}>
        <Icon className={styles.addnewBtnIco} type="plus-square"/>
        <FormattedMessage id="global.uploadFile"/>
      </div>
    );
    return content;
  };
  handleTableData = () => {
    const { activeDetail } = this.state;
    let arr = [];
    let arr1 = activeDetail.filegroupList || [];
    let arr2 = activeDetail.fileList || [];
    arr1.forEach((element, index) => {
      let data = { ...element };
      data.createDate = element.createDate ? formatTime(element.createDate) : '';
      data.updateDate = element.updateDate ? formatTime(element.updateDate) : '';
      data.isGroup = true;
      data.details = element;
      data.index = 'group' + index;
      arr.push(data);
    });

    arr2.forEach((element, index) => {
      let data = { ...element };
      data.name = element.displayFileName;
      data.formatFileLength = this.formatSize(element.fileLength);
      data.createDate = element.createDate ? formatTime(element.createDate) : '';
      data.updateDate = '';
      data.isGroup = false;
      data.details = element;
      data.index = 'file' + index;
      arr.push(data);
    });
    // for (let p in arr1) {
    //   arr1[p].createDate = arr1[p].createDate ? formatTime(arr1[p].createDate) : '';
    //   arr1[p].updateDate = arr1[p].updateDate ? formatTime(arr1[p].updateDate) : '';
    //   arr1[p].isGroup = true;
    //   arr1[p].details = arr1[p];
    //   arr.push(arr1[p]);
    // }
    // for (let p in arr2) {
    //   arr2[p].name = arr2[p].displayFileName;
    //   arr2[p].formatFileLength = this.formatSize(arr2[p].fileLength);
    //   arr2[p].createDate = arr2[p].createDate ? formatTime(arr2[p].createDate) : '';
    //   arr2[p].updateDate = arr2[p].updateDate ? formatTime(arr2[p].updateDate) : '';
    //   arr2[p].isGroup = false;
    //   arr2[p].details = arr2[p];
    //   arr.push(arr2[p]);
    // }
    return arr;
  };
  CustomExpandIcon = (props) => {
    let icon;
    if (props.expanded && props.record.isGroup) {
      icon = 'icon-arrow-open';
    } else if (!props.expanded && props.record.isGroup) {
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
  onExpandClick = (record) => {
    const { relationFileTree, expandedRowKeys, selected } = this.state;
    if (expandedRowKeys.includes(record.nodeKey)) {
      let index = expandedRowKeys.findIndex(item => item === record.nodeKey);

      expandedRowKeys.splice(index, 1);
      this.setState({ expandedRowKeys });
    } else {
      expandedRowKeys.push(record.nodeKey);
      this.setState({ expandedRowKeys, relationLoading: true });

      const params = {
        rootId: record ? record.id : 1,
        rootpath: record ? record.rootpath : '/',
        keywords: '',
      };
      getFileGroupTree(params).then(res => {
        record.children = res;
        this.setState({
          relationFileTree,
          relationLoading: false,
        });

      }, err => this.setState({ relationLoading: false }));
    }
  };

  // 列表选中数据
  onClickRow = (record, selectedRows) => {
    const { langLib } = this.context;
    const list = this.handleTableData();
    const isExist = list.filter(file => file.id === record.id).length === 0;
    if (isExist) {
      this.setState({
        selected: selectedRows,
      });
    } else {
      const selected = selectedRows.filter(file => file.id !== record.id);
      this.setState({
        selected,
      });
      CMessage(langLib['message.file.isExist'], 'error');
    }

  };

  render() {
    const { loading, rootId, activeDetail, treeData, activeTreeNodeDetail, visible, saveLoading, modalTitle, relationVisible, relationFileTree, selected, expandedRowKeys, relationLoading, typeId } = this.state;
    const { langLib } = this.context;
    const { Column, ColumnGroup } = Table;
    const { form, userInfo, functionData } = this.props;
    const { attributes } = functionData;
    const { canUploadFile, canAddFolder, canRelation } = attributes;
    const uploadProps = {
      action: query.FILE_UPLOAD,
      listType: 'file-card',
      data: {
        tableName: secret.encrypt('files'),
        token: userInfo.token,
        groupId: rootId || '',
        orgId: userInfo.orgId || -1,
      },
      onChange: this.onChange,
      beforeUpload: this.beforeUpload,
    };
    const crumbProps = {
      activeDetail,
      treeData,
      activeTreeNodeDetail,
    };

    const columns = [
      {
        title: '名称',
        dataIndex: 'name',
        key: 'name',
      },
    ];
    const rowSelection = {
      // type: 'checkbox',
      selectedRowKeys: selected.map(item => item.nodeKey),
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
    const relationConfig = {
      columns: columns,
      dataSource: relationFileTree,
      pagination: false,
      loading: relationLoading,
      expandedRowKeys,
      rowKey: (record) => record.nodeKey,
      // expandRowByClick: true,
      expandIcon: this.CustomExpandIcon,
      defaultExpandAllRows: true,
      rowSelection,
      onExpand: (expanded, record) => this.onExpandClick(record),
      onRow: record => {
        return {
          onClick: event => {
            this.onExpandClick(record);
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
    return (
      <div className={styles.containerWrap}>
        <div className={styles.headerTitleWrap}>
          <div className={styles.crumbWrap}>
            {this.itemRender()}
          </div>
          {canUploadFile === 1 && typeId === 2 && <Upload {...uploadProps} className="upload ant-btn-primary ant-btn">
            {this.setContent()}

          </Upload>}
          {canAddFolder === 1 && typeId === 2 &&
          <div className="createFileBtn ant-btn-primary ant-btn" onClick={this.showCreateModal}>
            <Icon className={styles.addnewBtnIco} type="folder-add"/>
            <FormattedMessage id="global.createFile"/>
          </div>}
          {canRelation === 1 && typeId === 2 &&
          <div className="createFileBtn ant-btn-primary ant-btn" onClick={this.showRelationFileModal}>
            <Icon className={styles.addnewBtnIco} type="plus-square"/>
            <FormattedMessage id="relation.addfile"/>
          </div>}
          <CSearch
            className={styles.search}
            onSearch={e => this.searchDetails(e)}
          />
        </div>
        <div className={styles.tableWrap}>
          <CTable dataSource={this.handleTableData()} rowKey="index" pagination={false}
                  loading={loading}
                  scroll={{ x: 'max-content', y: 92 }}
                  className={styles.tableDetial}
          >
            <Column title="名称" dataIndex="name" key="name"
                    key="name"
                    render={(name, id, record) => (
                      <div>{this.showNameHtml(name, id)}</div>
                    )}
            />
            <Column title="更新时间" dataIndex="updateDate" key="updateDate"/>
            <Column title="大小" dataIndex="formatFileLength" key="fileLength"/>
            <Column title="创建时间" dataIndex="createDate" key="createDate"/>
            <Column title="组织" dataIndex="orgName" key="orgName"/>
            <Column title="备注" dataIndex="memo" key="memo"/>
            <Column title="操作"
                    key="id"
                    align="right"
                    render={(name, record, id) => (
                      <span>{this.showIconHtml(name, record, id)}</span>
                    )}
            />
          </CTable>
        </div>

        <CModal
          title={modalTitle}
          visible={visible}
          size="default"
          // onOk={this.confirmFunction.bind(this)}
          onCancel={this.cancelFunction.bind(this)}
          okText="保存"
          cancelText="取消"
          centered={true}
          destroyOnClose="true"
          bodyStyle={{ padding: '20px 0' }}
          footer={[
            <Button key="cancel" loading={loading} type="default" onClick={() => this.cancelFunction()}>
              {langLib['confirm.cancel']}
            </Button>, <Button key="submit" loading={saveLoading} type="primary" onClick={() => this.confirmFunction()}>
              {langLib['confirm.ok']}
            </Button>]}
        >
          <FormItems
            formConfigs={this.getFormConfigs()}
            form={form}
            loading={loading}
          />
        </CModal>

        {/* 文件树 */}
        <CModal
          title='关联资料'
          visible={relationVisible}
          size="default"
          // onOk={this.confirmFunction.bind(this)}
          onCancel={this.cancelRelation.bind(this)}
          okText="保存"
          cancelText="取消"
          centered={true}
          destroyOnClose="true"
          bodyStyle={{ padding: '20px 0' }}
          footer={[
            <Button key="cancel" loading={loading} type="default" onClick={() => this.cancelRelation()}>
              {langLib['confirm.cancel']}
            </Button>, <Button key="submit" loading={saveLoading} type="primary" onClick={() => this.confirmRelation()}>
              {langLib['confirm.ok']}
            </Button>]}
        >
          <CTable {...relationConfig} />
        </CModal>
      </div>
    );
  }
}

export default Form.create()(RelationFileTab);
// export default RelationFileTab;
