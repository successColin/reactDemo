/*
 * @Author: tjf
 * @Date:   2019-06-19 08:46:41
 * @Last Modified by: tjf
 * @Last Modified time: 2019-08-10 11:56:29
 * @Desc: 知识库
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { Table, Modal, Icon, Select, Upload, Button } from 'antd';
import secret from '@/constants/secret';
import classNames from 'classnames';
import { CTextArea, CInput, CSearch } from '@/components/common/BasicWidgets';
import { BaseContext } from '@/constants/global';
import NormalSearchSelect from '@/components/userManager/component/NormalSearchSelect/NormalSearchSelect';
import { VALID_REQUIRED_MESSAGE } from '@/constants/global';
import CModal from '../../common/CreateModal/CreateModal';
import Crumb from '@/components/knowledgeBase/Crumb/Crumb';
import query from '@/constants/query';
import styles from '@/components/knowledgeBase/component/fileDetial.less';
import FormItems from '@/components/common/FormItems/FormItems';
import { CMessage } from '@/components/common/BasicWidgets';
import { formatTime, ImageCompression } from '@/utils/common';
import {
  deleteFile, getFilesDetails, deleteFileGroup,
} from '@/services/knowledgeBase';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const { Option } = Select;
const { confirm } = Modal;
const selectArr = [{
  name: <FormattedMessage id="role.tab.function"/>,
  value: 1,
},
  {
    name: <FormattedMessage id="role.tab.data"/>,
    value: 2,
  }];

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
  userInfo: state.user.userInfo,
}))
class formConfig extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      tabActive: 'base', // 激活的面板
      treeData: [], // 树数据
      activeTreeNodeDetail: {}, // 当前选中的树节点信息
      activeDetail: {}, // 根据树节点信息获取的该节点具体详情
      actionType: '', // 操作类型
      loadingStatus: { // loading状态
        saveBtn: false, // 保存按钮
        getDetail: false, // 点击树节点获取详情
        getTree: false, // 获取树数据
      },
      isEdit: false,
      title: '', // 头部
    };
  };


  toggle = (title, type, isFlag) => {
    if (type === 'upload') {
      // this.changeIsNull(title, type, isFlag);
    }
  };
  // 文件下载
  downloadFile = (e, i) => {
    const { userInfo } = this.props;
    const token = userInfo.token;
    let id = e.id;
    // let url = query.DOWNLOAD_FILE + '?id=' + id + '&token=' + token;
    let url = `${query.DOWNLOAD_FILE}?id=${id}&token=${token}`;
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
    let size = length + 'K';
    if (length >= 1024) {
      size = parseInt(length / 10.24) / 100 + 'M';
    }
    return size;
  };
  // 新建文件夹
  confirmFunction = e => {
    const { addFileGroupFunction, form, rootId, editFileGroupFunction, editActiveDetail, activeDetail = {} } = this.props.tabDefaultConfig;
    // let param = form.getFieldsValue();
    form.validateFields((errs, values) => {
      if (errs) return;
      const { filegroupList = [] } = activeDetail;
      let existList = filegroupList.filter(item => {
        if (!this.state.isEdit) return item.name === values.name && item.orgId === values.orgId;
        return item.id !== editActiveDetail.id && item.name === values.name && item.orgId === values.orgId;
      });
      if (existList.length) {
        const { langLib } = this.context;
        CMessage(langLib['file.is.exist'], 'error');
        return;
      }
      if (!this.state.isEdit) {
        values.rootId = rootId;
        addFileGroupFunction(e, values);
      } else {
        values.id = editActiveDetail.id;
        values.rootId = editActiveDetail.rootId;
        editFileGroupFunction(e, values);
      }
      this.setState({
        isEdit: false,
        title: '',
      });
    });
  };
  // 取消新建文件夹
  cancelFunction = e => {
    const { hideModal } = this.props.tabDefaultConfig;
    hideModal();
    this.setState({
      isEdit: false,
      title: '',
    });
  };
  // 删除文件
  deleteFiles = (e, type, d) => {
    const { langLib } = this.context;
    const { undateFileDetails } = this.props.tabDefaultConfig;
    const { groupId } = this.props.tabDefaultConfig;
    let id = e.id;
    let { close } = ModalBox.confirm({
      title: langLib['confirm.del.default'],
      onOk() {
        let param = { 'filesJson': '[{id:' + id + '}]' };
        // let param = {
        //   'filesJson': [{ id }]
        // };
        deleteFile(param).then(result => {
          let param = { groupId: groupId };
          getFilesDetails(param).then(res => {
            CMessage(langLib['message.del.success'], 'success');
            undateFileDetails(res);
            closeModal();
          });
        });

      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
  };
  // 删除文件夹
  deleteFileGroup = (e, type, d) => {
    const { langLib } = this.context;
    const { undateFileDetails, groupId } = this.props.tabDefaultConfig;
    let id = e.id;
    let { close } = ModalBox.confirm({
      title: langLib['confirm.del.default'],
      onOk() {
        let param = { id: id };
        deleteFileGroup(param).then(result => {
          let param = { groupId: groupId };
          getFilesDetails(param).then(res => {
            CMessage(langLib['message.del.success'], 'success');
            undateFileDetails(res);
            closeModal();
          });
        });
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
  };
  // 编辑文件夹
  editFiles = (id, record) => {
    const { showModalEdit } = this.props.tabDefaultConfig;
    showModalEdit(id);
    this.setState({
      isEdit: true,
      title: <FormattedMessage id="global.editFile"/>,
    });
  };
  // 选择字段
  handleSetSelectSearchValue = (selected, name, id) => {
    let { activeTreeNodeDetail } = this.props.tabDefaultConfig;
    this.props.tabDefaultConfig.form.setFieldsValue({
      [id]: selected[0].id,
      [name]: selected[0].name,
    });
    this.props.tabDefaultConfig.updateFrameState({
      activeTreeNodeDetail: {
        ...activeTreeNodeDetail,
        [id]: selected[0].id,
        [name]: selected[0].name,
      },
    });
  };

  // 新建文件夹表单选项
  getFormConfigs() {
    const { langLib } = this.context;
    const { editActiveDetail, form } = this.props.tabDefaultConfig;
    const publicProps = { disabled: false };
    // 描述
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
        config: {
          initialValue: editActiveDetail.orgName || '',
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }],
        },
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
      }, { // 组织机构
        key: 'orgId',
        colSpan: 12,
        config: {
          initialValue: editActiveDetail.orgId,
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

    let dataConfig = [];
    return [
      ...publicBasicConfig,
      ...dataConfig,
    ];
  }

  // 上传前校验
  beforeUpload = file => {
    const { size, type, name } = file;
    const { fileType = 'image', tabDefaultConfig: { activeDetail = {} } } = this.props;
    const { max } = this.state;
    const { langLib } = this.context;
    const isLtMax = size / 1024 / 1024 < 2;
    const { fileList = [] } = activeDetail;
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
      if (fileList.find(item => item.name === name)) {
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
    } else if (name.toLowerCase().indexOf('.jpg') !== -1 || name.toLowerCase().indexOf('.jpeg') !== -1 || name.toLowerCase().indexOf('.png') !== -1 || name.toLowerCase().indexOf('.bmp') !== -1) {
      result = 'img';
    } else {
      result = 'file';
    }
    return result;
  };
  onChange = ({ file, fileList }) => {
    const { status } = file;
    const { langLib } = this.context;
    const { setLoadingStatus } = this.props.tabDefaultConfig;
    // 上传中
    if (status === 'uploading') {
      setLoadingStatus('getDetail', true);
    } else if (status === 'error') {
      // 上传异常
      CMessage(langLib['file.error'], 'error');
      setLoadingStatus('getDetail', false);
    } else if (status === 'done' && file.response) {
      setLoadingStatus('getDetail', false);
      if (!file.response.success) {
        CMessage(file.response.msg, 'error');
        return;
      }
      CMessage(langLib['file.success'], 'success');
      // 文件上传完成
      const { undateFileDetails } = this.props.tabDefaultConfig;
      // fetchTree(activeTreeNodeDetail.nodeKey);
      const { groupId } = this.props.tabDefaultConfig;
      let param = { groupId: groupId };
      getFilesDetails(param).then(res => {
        undateFileDetails(res);
      });
      return;
    }
    // this.setState({ fileList: [...fileList] });
  };
  // 文件图标
  showNameHtml = (name, id) => {
    if (!id.isGroupFile) {
      const iconCls = classNames({
        'iconfont-app': true,
        'custom-color': true,
        [this.formatIcon(name)]: true,
      });
      return <div><span className={iconCls}></span><span>{name}</span></div>;
    } else {
      return <div><span style={{ cursor: 'default' }} className="iconfont icon-file-yellow"></span><span>{name}</span>
      </div>;
    }
  };

  formatIcon = (name) => {
    let names = name.split('.');
    let iconname = 'icon-file-zip';
    name = names[names.length - 1];
    if (name == 'jpg' || name == 'jpeg') {
      iconname = 'icon-file-jpg';
    } else if (name == 'png') {
      iconname = 'icon-file-png';
    } else if (name == 'doc' || name == 'docx') {
      iconname = 'icon-file-doc';
    } else if (name == 'pptx' || name == 'ppt') {
      iconname = 'icon-file-ppt';
    } else if (name == 'zip' || name == 'rar') {
      iconname = 'icon-file-zip';
    } else if (name == 'pdf') {
      iconname = 'icon-file-pdf';
    } else if (name == 'xls' || name == 'xlsx') {
      iconname = 'icon-file-xls';
    } else if (name == 'txt') {
      iconname = 'icon-file-txt';
    } else if (name == 'zip' || name == 'rar') {
      iconname = 'icon-file-zip';
    }
    return iconname;
  };
  // 操作图标
  showIconHtml = (name, id, record) => {
    let item = record;
    const { functionData } = this.props;
    let icon1 = '', icon2 = '';
    if (!id.isGroupFile) {
      if (functionData.attributes.candelete === 1) {
        icon1 = <span onClick={this.deleteFiles.bind(this, id, 1)} className="iconfont icondelete custom-color"/>;
      }
      if (functionData.attributes.canview === 1) {
        icon2 = <span onClick={this.downloadFile.bind(this, id)} className="iconfont iconDown custom-color"/>;
      }
      return <div>{icon2}{icon1}</div>;
    }
    {
      if (functionData.attributes.candelete === 1) {
        icon1 = <span onClick={this.deleteFileGroup.bind(this, id, 2)} className="iconfont icondelete custom-color"/>;
      }
      if (functionData.attributes.canmodify === 1) {
        icon2 = <span onClick={this.editFiles.bind(this, id, item)} className="iconfont iconEdit custom-color"/>;
      }
      return <div>{icon2}{icon1}</div>;
    }
  };

  setContent = () => {
    const content = (
      <div className={styles.uploadBtn} onClick={() => this.toggle('上传文件', 'upload', true)}>
        <Icon className={styles.addnewBtnIco} type="plus-square"/>
        <FormattedMessage id="global.uploadFile"/>
      </div>
    );
    return content;
  };
  // 搜索
  searchDetails = (name) => {
    const { searchFiles } = this.props.tabDefaultConfig;
    searchFiles(name);
  };
  handleTableData = () => {
    const { activeDetail } = this.props.tabDefaultConfig;
    let arr = [];
    let arr1 = activeDetail.filegroupList;
    let arr2 = activeDetail.fileList;
    for (let p in arr1) {
      arr1[p].createDate = arr1[p].createDate ? formatTime(arr1[p].createDate) : '';
      arr1[p].updateDate = arr1[p].updateDate ? formatTime(arr1[p].updateDate) : '';
      arr1[p].isGroupFile = true;
      arr1[p].formatFileLength = arr1[p].counts ? arr1[p].counts + '项' : '0项';
      arr1[p].details = arr1[p];
      arr.push(arr1[p]);
    }
    for (let p in arr2) {
      arr2[p].name = arr2[p].displayFileName;
      arr2[p].formatFileLength = this.formatSize(arr2[p].fileLength);
      arr2[p].createDate = arr2[p].createDate ? formatTime(arr2[p].createDate) : '';
      arr2[p].updateDate = '';
      arr2[p].isGroupFile = false;
      arr2[p].details = arr2[p];
      arr.push(arr2[p]);
    }
    return arr;
  };

  render() {
    const { loading, form, groupId, activeDetail, treeData, activeTreeNodeDetail } = this.props.tabDefaultConfig;
    const { userInfo, functionData } = this.props;
    const { title } = this.state;
    const { langLib } = this.context;
    const { Column, ColumnGroup } = Table;
    let visible = this.props.tabDefaultConfig.visible;
    const uploadProps = {
      action: query.FILE_UPLOAD,
      listType: 'file-card',
      data: {
        tableName: secret.encrypt('files'),
        token: userInfo.token,
        groupId: groupId || 1,
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
    let upload = '';
    if (functionData.attributes.canadd === 1) {
      upload = <Upload {...uploadProps} className="upload ant-btn-primary ant-btn">
        {this.setContent()}

      </Upload>;
    }
    return (
      <div className={styles.containerWrap}>
        <div className={styles.headerTitleWrap}>
          <Crumb crumbProps={crumbProps}/>
          {upload}

          <CSearch
            className={styles.search}
            onSearch={e => this.searchDetails(e)}
          />
        </div>
        <Table dataSource={this.handleTableData()} pagination={{ hideOnSinglePage: true }} loading={loading}>
          <Column title={<FormattedMessage id="knowledge.name"/>} dataIndex="name" key="name"
                  render={(name, id) => (
                    <div>{this.showNameHtml(name, id)}</div>
                  )}
          />
          <Column title={<FormattedMessage id="knowledge.updateDate"/>} dataIndex="updateDate" key="updateDate"/>
          <Column title={<FormattedMessage id="knowledge.formatFileLength"/>} dataIndex="formatFileLength"
                  key="fileLength"
          />
          <Column title={<FormattedMessage id="knowledge.createDate"/>} dataIndex="createDate" key="createDate"/>
          <Column title={<FormattedMessage id="knowledge.orgName"/>} dataIndex="orgName" key="orgName"/>
          <Column title={<FormattedMessage id="knowledge.memo"/>} dataIndex="memo" key="memo"/>
          <Column title={<FormattedMessage id="knowledge.right"/>}
                  key="id"
                  align="right"
                  render={(name, record, id) => (
                    <span>{this.showIconHtml(name, record, id)}</span>
                  )}
          />
        </Table>

        <CModal
          title={title || <FormattedMessage id="global.createFile"/>}
          visible={visible}
          size="default"
          // onOk={this.confirmFunction.bind(this)}
          onCancel={this.cancelFunction.bind(this)}
          // okText="保存"
          // cancelText="取消"
          centered="true"
          destroyOnClose="true"
          bodyStyle={{ padding: '20px 0' }}
          footer={[
            <Button key="cancel" loading={loading} type="default" onClick={() => this.cancelFunction()}>
              {langLib['confirm.cancel']}
            </Button>, <Button key="submit" loading={loading} type="primary" onClick={() => this.confirmFunction()}>
              {langLib['confirm.ok']}
            </Button>]}
        >
          <FormItems
            formConfigs={this.getFormConfigs()}
            form={form}
            loading={loading}
          />
        </CModal>
      </div>
    );
  }
}

export default formConfig;
