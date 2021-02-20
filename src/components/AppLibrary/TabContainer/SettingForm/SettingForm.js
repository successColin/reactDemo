/*
 * @Author: Fus
 * @Date:   2019-09-10 19:01:48
 * @Desc: APP详情表单
 */
import { Component } from 'react';
import { Form, Upload } from 'antd';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { CInput, CDatePicker, CMessage } from '@/components/common/BasicWidgets';
import { Radio, Select } from 'antd';
import FormItems from '@/components/common/FormItems/FormItems';
import { VALID_REQUIRED_MESSAGE } from '@/constants/global';
import moment from 'moment';
import styles from './SettingForm.less';
import Styles from '@/components/LicenseManager/LicenseManager.less';
import query from '@/constants/query';
import CButton from '@/components/common/BasicWidgets/Widgets/CButton/CButton';
import { BaseContext } from '@/constants/global';

const { Option } = Select;

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
  userInfo: state.user.userInfo,
}))
class SettingForm extends Component {
  static contextType = BaseContext;
  state = {
    url: '', // 更新地址
    loading: false,
    type: '', // 选择的更新内容
  };

  componentDidMount() {
    const { activeAppDetail, userInfo } = this.props;
    activeAppDetail.upgradeMode === 3 && this.setState({ type: 3 });
  }

  // 选中手动更新把对应的控件url显示
  handleChange = (value) => {
    this.setState({ type: value === 3 ? 3 : '' });
  };

  onChange = ({ file, fileList }, type) => {
    const { status, name } = file;
    const { form } = this.props;
    const { langLib } = this.context;
    // 上传中
    this.setState({ loading: true });
    if (status === 'uploading') {
    } else if (status === 'error') {
      // 上传异常
      this.setState({ loading: false });
      CMessage(langLib['file.error'], 'error');
    } else if (status === 'done' && file.response) {
      if (!file.response) {
        this.setState({ loading: false });
        CMessage(langLib['file.error'], 'error');
        return;
      }
      if (file.response.success) {
        CMessage(langLib['file.success'], 'success');
        if (type === 'upload') {
          form.setFieldsValue({
            upgradeUrl: file.response.data[0].url,
          });
        } else if (type === 'uploadAPK') {
          form.setFieldsValue({
            androidDownloadUrl: file.response.data[0].url,
          });
        }
        this.setState({ url: file.response.data[0].url, loading: false });
      } else {
        CMessage(file.response.msg, 'error');
        this.setState({ loading: false });
      }
      return;
      // 文件上传完成
    }
  };
  // 获取表单配置项
  getFormConfigs = () => {
    const { activeAppDetail, userInfo } = this.props;
    const { url, type } = this.state;
    const token = userInfo.token;
    const arr = [
      {
        key: 'keycode',
        label: <FormattedMessage id="global.keycode"/>,
        config: {
          initialValue: activeAppDetail.keycode,
        },
        component: <CInput/>,
      }, {
        key: 'name',
        label: <FormattedMessage id="global.name"/>,
        config: {
          initialValue: activeAppDetail.name,
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }],
        },
        component: <CInput/>,
      }, {
        key: 'version',
        label: <FormattedMessage id="appLibrary.version"/>,
        config: {
          initialValue: activeAppDetail.version,
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }],
        },
        component: <CInput/>,
      }, {
        key: 'overdueDate',
        label: <FormattedMessage id="appLibrary.expireTime"/>,
        config: {
          initialValue: activeAppDetail.overdueDate ? moment(activeAppDetail.overdueDate) : '',
        },
        component: <CDatePicker/>,
      }, {
        key: 'iosDownloadUrl',
        label: <FormattedMessage id="appLibrary.iosDownloadUrl"/>,
        config: {
          initialValue: activeAppDetail.iosDownloadUrl,
        },
        component: <CInput/>,
      }, {
        key: 'upgradeMode',
        label: <FormattedMessage id="appLibrary.update.type"/>,
        config: {
          initialValue: activeAppDetail.upgradeMode || 1,
        },
        component: (<Select onChange={(value) => this.handleChange(value)}>
          <Option value={1}><FormattedMessage id="appLibrary.update.wgt"/></Option>
          <Option value={2}><FormattedMessage id="appLibrary.update.apk"/></Option>
          <Option value={3}><FormattedMessage id="appLibrary.update.hande"/></Option>
        </Select>),
      }, {
        key: 'uploadApk',
        label: <FormattedMessage id="appLibrary.uploadAPK"/>,
        component: (
          <Upload
            showUploadList={false}
            className={Styles.import}
            accept=".apk"
            onChange={(e) => this.onChange(e, 'uploadAPK')}
            action={query.APP_UPLOAD}
            data={{ token: token, appId: activeAppDetail.id, upgradeType: 2 }}
          >
            <CButton className={Styles.import}>
              <span className="iconUpload iconfont"></span>
            </CButton>
          </Upload>
        ),
      }, {
        key: 'upload',
        label: <FormattedMessage id="appLibrary.upload"/>,
        component: (
          <Upload
            showUploadList={false}
            className={Styles.import}
            accept=".wgt"
            onChange={(e) => this.onChange(e, 'upload')}
            action={query.APP_UPLOAD}
            data={{ token: token, appId: activeAppDetail.id, upgradeType: 1 }}
          >
            <CButton className={Styles.import}>
              <span className="iconUpload iconfont"></span>
            </CButton>
          </Upload>
        ),
      }, {
        key: 'androidDownloadUrl',
        label: <FormattedMessage id="appLibrary.androidDownloadUrl"/>,
        config: {
          initialValue: activeAppDetail.androidDownloadUrl,
        },
        component: <CInput disabled={false}/>,
      }, {
        key: 'upgradeUrl',
        label: <FormattedMessage id="appLibrary.upgradeUrl"/>,
        config: {
          initialValue: activeAppDetail.upgradeUrl || url,
        },
        component: <CInput disabled={true}/>,
      },
    ];
    const installAtionPackAgeURL = {
      key: 'installAtionPackAgeURL',
      label: <FormattedMessage id="appLibrary.update.handeUrl"/>,
      config: {
        initialValue: activeAppDetail.installAtionPackAgeURL || '',
      },
      component: <CInput/>,
    };
    if (type === 3) {
      arr.push(installAtionPackAgeURL);
    } else {
      let index = arr.findIndex(item => item.key === 'installAtionPackAgeURL');
      index > -1 && arr.splice(index, 1);
    }
    return arr;
  };

  render() {
    const { form } = this.props;
    const { loading } = this.state;
    return (
      <div className={styles.form}>
        <Form>
          <FormItems
            formConfigs={this.getFormConfigs()}
            form={form}
            loading={loading}
          />
        </Form>
      </div>
    );
  }
}

export default Form.create()(SettingForm);
