/*
 * @Author: Fus
 * @Date:   2019-08-29 09:33:43
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-03-12 17:33:24
 * @Desc: 上传组件
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Upload, Icon, Button } from 'antd';
import { CMessage } from '@/components/common/BasicWidgets';
import Zmage from 'react-zmage';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import secret from '@/constants/secret';
import classNames from 'classnames';
import query from '@/constants/query';
import { getFileRelation, deleteFileRelation, deleteFile } from '@/services/fileManger';
import { BaseContext } from '@/constants/global';
import { getDefaultConfirmProps, getCookie, getFileAcceptType, getBase64, ImageCompression } from '@/utils/common';
import styles from '../../index.less';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

class CUpload extends Component {
  static contextType = BaseContext;
  static defaultProps = {
    fileType: 'image', // 可允许上传的文件类型
    max: 20, // 文件最大值（M）
    multiple: true, // 多文件上传
    showUploadList: true, // 显示上传列表
    fromType: '', // 调用处类型（avatar-头像  personalPua-个人资质）
    relationParams: {}, // 上传文件后的关联业务信息
    needFetchDetail: true, // 是否需要获取详情
  };

  static getDerivedStateFromProps(props, state) {

    const { relationId } = props.relationParams;
    if (relationId !== state.relationId) {
      if (props.fromType === 'personalPua' && !state.relationId) {
        return null;
      }
      // 新增数据时清空文件列表
      if (!relationId) {
        return {
          relationId,
          fileList: [],
        };
      }
      // 切换节点
      return {
        relationId: props.relationParams.relationId,
      };
    }
    return null;
  }

  state = {
    previewVisible: false,
    relationId: null,
    previewImage: '',
    fileList: [],
    loading: false, // 上传中
  };

  componentDidMount() {
    this.props.needFetchDetail && this.props.relationParams.relationId && this.fetchRelationFiles();
    if (this.props.relationParams.defaultValue) {
      const relationParams = this.props.relationParams;
      const relationFileObj = this.props.relationFileObj;
      const defaultFiles = relationParams.filePassList[relationParams.defaultValue] || [];
      const defaultFileList = defaultFiles ? defaultFiles.map(item => ({
        ...item,
        uid: -item.id,
        hasRelation: false,
      })) : [];
      if (defaultFiles.length) {
        defaultFiles.forEach(item => {
          const mainId = item.mainId || item.id;
          relationFileObj[mainId] = {
            stateId: relationParams.relationStateId,
            typeId: relationParams.relationTypeId,
            priorityId: relationParams.relationPriorityId,
          };
        });
        relationParams.updataState({
          fileRelationList: {
            ...relationFileObj,
          },
        });
      }
      const { fileList } = this.state;
      const allFileList = [
        ...fileList,
        ...defaultFileList,
      ];
      this.setState({ fileList: allFileList });
    }

  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.relationId !== this.state.relationId) {
      this.fetchRelationFiles();
    }
  }

  // 获取关联文件
  fetchRelationFiles = () => {
    const { relationParams } = this.props;
    const { relationId } = this.state;
    if (!relationId && !relationParams.relationId) return;
    getFileRelation({
      ...relationParams,
      relationId: relationId ? relationId : relationParams.relationId,
      status: 'done',
      basetype: 2,
    }).then(res => {
      const fileList = res.map(item => ({
        ...item,
        uid: -item.id,
        name: item.displayFileName,
        hasRelation: true,
      }));

      this.setState({ fileList });
      if (relationParams.parameter) {
        const datas = res.map(item => ({
          ...item,
          stateId: relationParams.relationStateId,
          typeId: relationParams.relationTypeId,
          priorityId: relationParams.relationPriorityId,
        }));
        // const newFilePass = {
        //   [fileId]:datas
        // }
        let files = relationParams.filePassList[relationParams.parameter] || [];
        files = [
          ...files,
          ...datas,
        ];
        let newFilePassList = relationParams.filePassList;
        newFilePassList[relationParams.parameter] = files;
        relationParams.setFrameState({
          filePassList: newFilePassList,
        });
      }
    });
  };
  handleCancel = () => this.setState({ previewVisible: false });

  handlePreview = async file => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    this.setState({
      previewImage: file.url || file.preview,
      previewVisible: true,
    });
  };
  // 删除文件
  handleRemove = file => {
    const { mainId, id, hasRelation } = file;
    const { langLib } = this.context;
    const { fileList } = this.state;
    const { onRemoveFile, relationParams } = this.props;
    return new Promise((resolve, reject) => {
      let { close } = ModalBox.confirm({
        ...getDefaultConfirmProps(langLib),
        onOk: () => {
          const handleAfterDel = () => {
            CMessage(langLib['message.del.success']);
            resolve();
            // const newRelationFileList = [...fileRelationList];
            // const delIndex = newRelationFileList.indexOf(mainId);
            // delIndex !== -1 && newRelationFileList.splice(delIndex, 1);
            // this.props.setFileInfo(newRelationFileList);
            this.setState({
              fileList: fileList.filter(item => item.mainId !== mainId),
              // }, () => {
              //   this.getFileListResults();
            });
            if (relationParams.parameter) {
              let files = relationParams.filePassList[relationParams.parameter] || [];
              let newFilePassList = relationParams.filePassList;
              const fileId = id || file.response.data[0].id;
              newFilePassList[relationParams.parameter] = files.filter(item => item.id !== fileId);
              relationParams.setFrameState({
                filePassList: newFilePassList,
              });
            }
          };
          // 未关联业务，需要走删除文件接口
          if (!hasRelation) {
            deleteFile({ filesJson: JSON.stringify([{ id: mainId }]) }).then(res => {
              handleAfterDel();
              // fileRelationList.splice(fileRelationList.findIndex(item => item === mainId), 1);
              // setFileInfo(fileRelationList);
              onRemoveFile && onRemoveFile(mainId);
            }, err => reject());
            closeModal();
            return;
          }
          // 已关联业务，则删除关联关系
          deleteFileRelation({ id }).then(res => {
            handleAfterDel();
          }, err => reject());
          closeModal();
        },
        onCancel: () => closeModal(),
      });
      const closeModal = () => {
        close();
      };
    });
  };
  // 获取icon
  getFileTypeClassName = (format) => {
    if (format === 'mp3') {
      return {
        name: 'icon-mp3-style',
        color: '#FF932F',
      };
    } else if (format === 'mp4') {
      return {
        name: 'icon-mp4-style',
        color: '#4E7DD9',
      };
    } else if (format === 'xls' || format === 'xlsx') {
      return {
        name: 'icon-xls-style',
        color: '#FFAC02',
      };
    } else if (format === 'png') {
      return {
        name: 'icon-png-style',
        color: '#4E94D9',
      };
    } else if (format === 'txt') {
      return {
        name: 'icon-txt-style',
        color: '#B9C1CF',
      };
    } else if (format === 'jpg') {
      return {
        name: 'icon-jpg-style',
        color: '#FF8102',
      };
    } else if (format === 'pdf') {
      return {
        name: 'icon-pdf-style',
        color: '#F15643',
      };
    } else if (format === 'doc' || format === 'docx') {
      return {
        name: 'icon-doc-style',
        color: '#FF933D',
      };
    } else if (format === 'ppt' || format === 'pptx') {
      return {
        name: 'icon-ppt-style',
        color: '#47C69A',
      };
    } else if (format === 'zip') {
      return {
        name: 'icon-zip-style',
        color: '#B9C1CF',
      };
    } else {
      return {
        name: 'icon-else-style',
        color: '#B9C1CF',
      };
    }
  };

  onChange = ({ file, fileList, event }) => {
    const { status } = file;
    const { langLib } = this.context;

    // 上传中
    if (status === 'uploading') {
      this.setState({ loading: true, fileList: [...fileList] });
    } else if (status === 'error') {
      // 上传异常
      CMessage(langLib['file.error'], 'error');
      this.setState({ loading: false });
      return;
    } else if (status === 'done' && file.response) {
      if (!file.response) {
        CMessage(langLib['file.error'], 'error');
        return;
      }
      const { fromType } = this.props;
      if (fromType === 'avatar') {
        this.props.setFileInfo(file.response.data[0].url, file.response.data[0]);
        this.setState({
          loading: false,
          fileList: fileList.map(item => ({
            ...item,
            id: item.id,
            mainId: item.mainId || (item.response ? item.response.data[0].id : ''),
            thumbUrl: item.thumbUrl || (item.response ? item.response.data[0].url : ''),
          })),
          // }, () => {
          // this.getFileListResults();
        });
        return;
      }
      this.props.setFileInfo(file.response.data[0].id, file.response.data[0]);
      // 文件上传完成
      this.setState({
        loading: false,
        fileList: fileList.map(item => ({
          ...item,
          id: item.id,
          name: item.name || (item.response ? item.response.data[0].name : ''),
          mainId: item.mainId || (item.response ? item.response.data[0].id : ''),
          url: item.url || (item.response ? item.response.data[0].url : ''),
          thumbUrl: item.thumbUrl || (item.response ? item.response.data[0].url : ''),
        })),
      });
      return;
    }
  };
  beforeUploadFile = (file) => {
    const { size, type, name } = file;
    const { max, fileType } = this.props;
    const { langLib } = this.context;
    const isLtMax = size / 1024 / 1024 < max;
    const accept = getFileAcceptType('file');

    const fileNameArr = name.split('.');
    const fileNameType = fileNameArr[fileNameArr.length - 1];
    // 文件过大
    if (!isLtMax) {
      CMessage(langLib['file.overSize'](max), 'error');
      return false;
    } else if (!(fileNameType && accept.includes(fileNameType))) { // 上传文件类型不支持（图片）
      CMessage(langLib['file.unAcceptType'], 'error');
      return false;
    }
    return new Promise((resolve, reject) => {
      if (!isLtMax) {
        reject(file);
      } else {
        resolve(file);
      }
    });
  };
  // 上传前校验
  beforeUpload = file => {
    const { size, type } = file;
    const { max, fileType } = this.props;
    const { langLib } = this.context;
    const isLtMax = size / 1024 / 1024 < max;
    // 文件过大
    if (!isLtMax) {
      CMessage(langLib['file.overSize'](max), 'error');
      return false;
    } else if (fileType === 'image' && type.indexOf(fileType) === -1) { // 上传文件类型不支持（图片）
      CMessage(langLib['file.unAcceptType'], 'error');
      return false;
    }
    return new Promise((resolve, reject) => {
      if (!isLtMax) {
        reject(file);
      } else {
        // 图片压缩
        ImageCompression({ file, quality: 0.6 }, (imgFile) => {
          resolve(imgFile);
        });
      }
    });
  };

  setContent = () => {
    const { fromType, children } = this.props;
    const { fileList, loading } = this.state;
    // 上传按钮
    const uploadButton = (
      <div>
        <Icon type="plus"/>
        <div className="ant-upload-text">
          <FormattedMessage id="global.upload"/>
        </div>
      </div>
    );
    // 加载中
    const loadingBtn = (
      <Fragment>
        <Icon type="loading"/>
      </Fragment>
    );
    const content = loading ? loadingBtn : (children || uploadButton);
    // 头像
    if (fromType === 'avatar') {
      const curFile = fileList.length && fileList[fileList.length - 1];
      const url = curFile ? (curFile.url || (curFile.response && curFile.response.data[0].url)) : '';
      if (loading) return <Icon type="loading"/>;
      return url ? <img src={url} alt="avatar"/> : children;
    }
    return content;
  };
  // 上传参数
  getUploadData = () => {
    const { children, className, relationParams, fromType, fileType, disabled, eleObj = {}, ...restProps } = this.props;
    if (fromType === 'avatar') return {};
    const { waterMarkId, priorityId, stateId, typeId } = eleObj;
    let data = {
      tableName: relationParams.relationTableName ? secret.encrypt(relationParams.relationTableName) : '',
      basetype: 2,
      token: getCookie('token'),
      waterMarkId,
      priorityId,
      stateId,
      typeId,
    };
    Object.keys(data).forEach(item => {
      if (!data[item]) delete data[item];
    });
    return data;
  };

  renderContent = () => {
    const { previewVisible, previewImage, fileList = [], loading, files } = this.state;
    const { children, className, relationParams, fromType, fileType, disabled, eleObj, ...restProps } = this.props;
    const wrapCls = classNames({
      [styles.cUpload]: true,
      [styles.isDisabled]: disabled,
      [styles[fromType]]: true,
      [className]: !!className,
    });
    const accept = getFileAcceptType(fileType);
    const uploadProps = {
      action: fromType !== 'avatar' ? query.FILE_UPLOAD : query.EDITOR_UPLOAD,
      accept,
      listType: 'picture-card',
      headers: {
        token: getCookie('token'),
      },
      // fileList,
      // defaultFileList: fileList,
      data: this.getUploadData,
      disabled: disabled,
      onPreview: this.handlePreview,
      onChange: this.onChange,
      onRemove: this.handleRemove,
      beforeUpload: this.beforeUpload,
      ...restProps,
    };
    // 不知道为什么头像上传如果加了fileList就不行
    if (fromType !== 'avatar') uploadProps.fileList = fileList;
    const dom = disabled && !fileList.length ?
      <div className={styles.alignStyle}><FormattedMessage id="global.noData"/></div> : (<div className={wrapCls}>
        <Upload {...uploadProps}>
          {this.setContent()}
        </Upload>
        <CreateModal visible={previewVisible} footer={null} onCancel={this.handleCancel}>
          <Zmage
            controller={{
              // 关闭按钮
              close: true,
              // 缩放按钮
              zoom: false,
              // 旋转按钮
              rotate: true,
            }}
            onZooming={state => {
              console.info('Zooming State: ', state);
            }}
            style={{ width: '100%' }} src={previewImage}
          />
          {/* <img alt="example" style={{ width: '100%' }} src={previewImage}/>*/}
        </CreateModal>
      </div>);
    return dom;
  };
  renderFileContent = () => {
    const { fileList } = this.state;
    const preViewType = ['gif', 'jpg', 'png', 'pdf'];
    const { children, className, relationParams, fromType, fileType, disabled, eleObj, ...restProps } = this.props;
    const accept = getFileAcceptType('file');
    const props = {
      action: query.FILE_UPLOAD,
      accept,
      headers: {
        token: getCookie('token'),
      },
      fileList,
      data: this.getUploadData,
      disabled: disabled,
      onChange: this.onChange,
      onRemove: this.handleRemove,
      beforeUpload: this.beforeUploadFile,
      showUploadList: false,
      // showUploadList: {
      //   showPreviewIcon: true,
      //   showDownloadIcon: true,
      //   downloadIcon: 'download ',
      // },
    };
    const classStyles = classNames({
      'iconUpload': true,
      'iconfont': true,
      'custom-color': true,
      [styles.marginRight]: true,
    });
    return (
      <div className={styles.cUpload}>
        <Upload {...props}>
          <Button><span className={classStyles}></span><FormattedMessage id="element.type.imageText"/></Button>
        </Upload>
        <ul>
          {fileList.map((item, index) => {
            const { name, url } = item;
            const formTypeArr = name.split('.');
            const type = formTypeArr[formTypeArr.length - 1];
            const config = this.getFileTypeClassName(type);
            const newurl = url ? '/' + url.split('/').slice(3).join('/') : '';
            const relUrl = preViewType.includes(type) ? url : newurl;
            return (<li className={styles.fileWrap} key={index}>
              <a href={relUrl} download={name} target="_blank">
                <i className={`iconfont ${styles.iconWrap} ${config.name}`} style={{ color: config.color }}/>

                <p className={styles.fileName} title={name}>{name}</p>
              </a>
              {!disabled && <i onClick={() => {
                this.handleRemove(item);
              }} className={`${styles.del} custom-color icondelete iconfont`}></i>}
            </li>);
          })}
        </ul>
      </div>
    );
  };

  render() {
    const { eleObj = {} } = this.props;
    const { basetype = '' } = eleObj;
    const content = basetype === 13 ? this.renderFileContent() : this.renderContent();
    return (<div>{content}</div>);
  }
}

export default CUpload;
