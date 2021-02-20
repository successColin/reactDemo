/*
 * @Author: Fus
 * @Date:   2020-05-13 08:59:23
 * @Desc: banner配置
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Upload } from 'antd';
import { connect } from 'dva';
import { CButton, CInput, CMessage, CSpin } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { saveAppBannerList, getAppBannerList } from '@/services/appLibrary';
import { BaseContext } from '@/constants/global';
import styles from './BannerConfig.less';
import Styles from '@/components/LicenseManager/LicenseManager.less';
import query from '@/constants/query';
import { getCookie } from '@/utils/common';

const itemLayout = {
  labelCol: {
    sm: { span: 24 },
  },
  wrapperCol: {
    sm: { span: 24 },
  },
};

@connect(state => ({
  appHomeConfig: state.appHomeConfig,
  functionData: state.tabs.activeTabData.functionData,
}))
class BannerConfig extends Component {
  static contextType = BaseContext;
  state = {
    loading: false, // 保存加载中状态
    listData: [], // url列表
  };

  componentDidMount() {
    this.fetchBannerList();
  }

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
  handleFileChange = ({ file, fileList }, index) => {
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
      this.changeUrl(fileObj.url, index, false);
      return;
    }
  };

  // 获取APP数据
  fetchBannerList = () => {
    const { appData = {} } = this.props.appHomeConfig;
    const { id: appId } = appData;
    this.setState({ loading: true });
    getAppBannerList({ appId }).then(listData => {
      this.setState({ listData, loading: false });
    }, err => this.setState({ loading: false }));
  };
  // 保存banner列表
  handleSave = () => {
    const { langLib } = this.context;
    const { appData } = this.props.appHomeConfig;
    const { id: appId } = appData;
    const list = this.setUrlToList();
    // console.log(this.state.listData, list);
    // return;
    // this.props.form.validateFields((errs, values) => {
    // if (errs) return;
    // const list = this.setUrlToList(values);
    const params = {
      appId,
      list,
    };
    this.setState({ loadingSave: true });
    saveAppBannerList(params).then(res => {
      CMessage(langLib['message.save.success']);
      this.setState({ loadingSave: false });
      this.fetchBannerList();
    });
    // });
  };
  // 将五个url地址改成列表格式
  setUrlToList = (formData) => {
    const { listData } = this.state;
    const resultList = [];
    for (let i = 0; i < 5; i++) {
      resultList.push({
        sno: i + 1,
        linkUrl: listData[i] && listData[i].linkUrl ? listData[i].linkUrl : '',
      });
    }
    // Object.keys(formData).map(key => {
    //   const splitArr = key.split('url_') || [];
    //   const index = splitArr[1];
    //   resultList.push({
    //     sno: +index,
    //     linkUrl: formData[key],
    //   });
    // });
    return resultList;
  };
  // 修改路径
  changeUrl = (value = '', index, isloading = false) => {
    const { listData } = this.state;
    let newListData = JSON.parse(JSON.stringify(listData));
    newListData[index - 1] = {
      ...newListData[index - 1],
      linkUrl: value,
    };
    this.setState({
      listData: newListData,
      loading: isloading,
    });
  };
  // 渲染列表
  renderUrlSetting = () => {
    const { listData } = this.state;
    const uploadProps = {
      className: styles.urlBoxLeft,
      beforeUpload: this.beforeUpload,
      showUploadList: false,
      action: query.EDITOR_UPLOAD,
      accept: 'image/*',
      headers: {
        token: getCookie('token'),
      },
    };
    const urlArr = new Array(5).fill(1).map((o, index) => index + 1);
    return urlArr.map(key => {
      const urlObj = listData[key - 1] || {};
      const initialValue = urlObj.linkUrl || '';
      return (<div>
        <div className={styles.urlTitle}>{`URL${key}`}</div>
        <div className={styles.Urlbox}>
          <Upload {...uploadProps} onChange={(data) => {
            this.handleFileChange(data, key);
          }}>
            <CButton>
              <span className={`custom-color iconUpload iconfont ${styles.icon}`}></span>
              <FormattedMessage id="global.uploadBasic"/>
            </CButton>
          </Upload>
          <CInput onChange={(e) => this.changeUrl(e.target.value, key)} value={initialValue}/>
        </div>
      </div>);
    });
  };
  // 获取表单配置项
  // getFormConfigs = () => {
  //   const { listData } = this.state;
  //   const urlArr = new Array(5).fill(1).map((o, index) => index + 1);
  //   return urlArr.map(key => {
  //     const urlObj = listData[key - 1] || {};
  //     const initialValue = urlObj.linkUrl || '';
  //     return {
  //       key: `url_${key}`,
  //       label: `URL${key}`,
  //       config: {
  //         initialValue,
  //       },
  //       colSpan: 24,
  //       itemLayout,
  //       component: <CInput/>,
  //     };
  //   });
  // };

  render() {
    const { loading, loadingSave } = this.state;
    const { form, functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    return (
      <div className={styles.wrap}>
        <CSpin spinning={loading}>
          <div className={styles.content}>
            <p className={styles.tit}>
              <div className={styles.titBox}><FormattedMessage id="appHomeConfig.bannerConfig.title"/></div>
            </p>
            <div className={styles.formWrap}>
              {this.renderUrlSetting()}
              {/*<FormItems*/}
              {/*  formConfigs={this.getFormConfigs()}*/}
              {/*  form={form}*/}
              {/*  loading={loading}*/}
              {/*/>*/}
            </div>

          </div>
          <div className={styles.footer}>
            {canmodify ? <CButton type="primary" onClick={() => this.handleSave()} loading={loadingSave}>
              <FormattedMessage id="global.save"/>
            </CButton> : null}
          </div>
        </CSpin>
      </div>
    );
  }
}

export default Form.create()(BannerConfig);
