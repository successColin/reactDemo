import React, { Component } from 'react';
import { Upload, Input } from 'antd';
import { connect } from 'dva';
import { CButton, CMessage } from '@/components/common/BasicWidgets';
import { FormattedMessage } from 'react-intl';
import { BaseContext } from '@/constants/global';
import query from '@/constants/query';
import { getCookie } from '@/utils/common';
import styles from '../BundleDetail.less';

@connect(state => ({
  appHomeConfig: state.appHomeConfig,
}))
class UploadUrlToInput extends Component {
  static contextType = BaseContext;

  static getDerivedStateFromProps(props, state) {
    if (props.value !== state.value) {
      return {
        value: props.value,
      };
    }
    return null;
  }

  state = {
    value: '',
  };
  // 上传前校验
  beforeUpload = file => {
    const { size, type } = file;
    const { fileType } = this.props;
    const { langLib } = this.context;
    const isLtMax = size / 1024 / 1024 < 2;
    // 文件过大
    if (!isLtMax) {
      CMessage(langLib['file.overSize'](2), 'error');
      return false;
    } else if (fileType === 'image' && type.indexOf(fileType) === -1) { // 上传文件类型不支持（图片）
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
  // 图片上传
  handleFileChange = ({ file, fileList }) => {
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
      const fileObj = file.response ? file.response.data[0] : {};
      this.changeUrl(fileObj.url);
      return;
    }
  };
  // 设置图片路径
  changeUrl = (value) => {
    const { activeBundle } = this.props.appHomeConfig;
    const newActiveBundle = {
      ...activeBundle,
      picpath: value,
    };
    this.context.dispatch({
      type: 'appHomeConfig/updateState',
      payload: { activeBundle: newActiveBundle },
    });
  };

  render() {
    const { value } = this.state;
    const uploadProps = {
      className: styles.urlBoxLeft,
      beforeUpload: this.beforeUpload,
      showUploadList: false,
      action: query.EDITOR_UPLOAD,
      accept: 'image/*',
      headers: {
        token: getCookie('token'),
      },
      onChange: this.handleFileChange,
    };
    return (
      <div className={styles.urlbox}>
        <Upload {...uploadProps}>
          <CButton>
            <span className={`custom-color iconUpload iconfont ${styles.icon}`}></span>
            <FormattedMessage id="global.uploadBasic"/>
          </CButton>
        </Upload>
        <Input value={value} onChange={e => this.changeUrl(e.target.value)}/>
      </div>);
  }
}

export default UploadUrlToInput;
