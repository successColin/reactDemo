/*
 * @Author: Fus
 * @Date:   2020-02-04 09:13:03
 * @Desc: 基本信息
 */
import { Component, Fragment } from 'react';
import { Form, Checkbox, Select, Upload, Icon, Input, Radio } from 'antd';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import Zmage from 'react-zmage';
import { SplitLine, CSelect, CMessage, SearchSelect } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import Slider from '../Slider/Slider';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';
import FooterButton from '../FooterButton/FooterButton';
import { MENU_STYLES, BaseContext, THEME_COLOR, TOP_STYLE, LOGIN_STYLE } from '@/constants/global';
import { getHomePageConfig, saveHomePageConfig, clearNetworkCache } from '@/services/mainPageConfig';
import styles from './BasicForm.less';
import query from '@/constants/query';
import { getCookie, getDefaultConfirmProps } from '@/utils/common';

const { Option } = Select;
// 菜单风格
const menuStyleOptions = Object.keys(MENU_STYLES).map(item => <Option key={item} value={+item}><FormattedMessage
  id={MENU_STYLES[item]}
/></Option>);

const themeStyleRadios = THEME_COLOR.map(item => <Radio value={item.id} key={item.id}>
  <span className={styles.radioGroupSty}><FormattedMessage id={item.name}/> <span className={styles.radioSty} style={{
    'background': item.color,
  }}
  ></span></span>
</Radio>);

const topStyleRadios = TOP_STYLE.map(item => <Radio value={item.id} key={item.id}>
  <span className={styles.radioGroupSty}><FormattedMessage id={item.name}/> <span className={styles.radioSty} style={{
    'background': item.color,
  }}
  ></span></span>
</Radio>);
const loginStyleRadios = LOGIN_STYLE.map(item => <Radio value={item.id} key={item.id}>
  <span className={styles.radioGroupSty}><FormattedMessage id={item.name}/> <span className={styles.radioSty} style={{
    'background': item.color,
  }}
  ></span></span>
</Radio>);

@connect(state => ({
  mainPageConfig: state.global.mainPageConfig,
  functionData: state.tabs.activeTabData.functionData,
  userInfo: state.user.userInfo,
}))
class BasicForm extends Component {
  static contextType = BaseContext;
  state = {
    data: {}, // 数据
    loadingData: false, // 加载状态
    loadingSave: {
      save: false, // 保存按钮
      clear: false, // 清除缓存
    }, // 保存状态
    urlObj: {}, // 图片路径
  };

  componentDidMount() {
    const { mainPageConfig } = this.props;
    const { basicData } = mainPageConfig;
    this.setState({
      urlObj: {
        loginBackGroupURL: basicData.loginBackGroupURL, // 登录界面背景图片
        loginLogoURL: basicData.loginLogoURL, // 登录界面logo
        systemLogo: basicData.systemLogo, // 系统logo
        pcRotationChartOne: basicData.pcRotationChartOne, // 登录页轮播图
        pcRotationChartTwo: basicData.pcRotationChartTwo, // 登录页轮播图
        pcRotationChartThree: basicData.pcRotationChartThree, // 登录页轮播图
        pcLoginLogo: basicData.pcLoginLogo, // 登录页轮播logo
        appLoginLogo: basicData.appLoginLogo, // 登录页轮播logo
      },
    });
  }


  // 清除系统缓存
  clearSystemCache = () => {
    const { langLib, dispatch } = this.context;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      title: langLib['global.clear.cache'],
      // content: langLib['global.clear.content'],
      onOk: () => {
        clearNetworkCache({}).then(res => {
          CMessage(langLib['message.save.success'], 'success');
          close();
        });
      },
      onCancel: () => close(),
    });

  };
  // 保存
  handleSubmit = () => {
    const { langLib, dispatch } = this.context;
    const { mainPageConfig } = this.props;
    const { basicData } = mainPageConfig;
    const { urlObj, loadingSave } = this.state;
    this.props.form.validateFields((errs, values) => {
      if (errs) return;
      const params = {
        id: basicData.id,
        companyId: basicData.companyId || 0,
        ...values,
      };
      Object.keys(values).filter(key => key !== 'menuStyle').forEach(key => {
        params[key] = +values[key];
      });
      let newParams = {
        ...params,
        ...urlObj,
        recordCode: values.recordCode,
        companyName: values.companyName,
        technicalSupport: values.technicalSupport,
        feedback: params.feedback === 1 ? 1 : 2,
      };
      this.setState({ loadingSave: { ...loadingSave, save: true } });
      saveHomePageConfig(newParams).then(res => {
          CMessage(langLib['message.save.success'], 'success');
          this.setState({ loadingSave: { ...loadingSave, save: false } });
          localStorage.setItem('ttt', res.themeColor);
          localStorage.setItem('topt', res.headerStyle);
          localStorage.setItem('sss', res.systemLogo || '');
          localStorage.setItem('hhh', res.systemLogoHeight || 25);
          dispatch({
            type: 'global/getMainPageBasicConfig',
          });
        }, err => {
          this.setState({ loadingSave: { ...loadingSave, save: false } });
        },
      );
    });
  };
  // 上传前校验
  beforeUpload = file => {
    const { size, type } = file;
    const { langLib } = this.context;
    const isLtMax = size / 1024 / 1024 < 2;
    // 文件过大
    if (!isLtMax) {
      // CMessage(langLib['file.overSize'](2), 'error');
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
  onchange = ({ file, fileList }, name) => {
    const { status } = file;
    const { langLib, dispatch } = this.context;
    const { mainPageConfig } = this.props;
    const { basicData } = mainPageConfig;
    // 上传中
    if (status === 'uploading') {

    } else if (status === 'error') {
      // 上传异常
      CMessage(langLib['file.error'], 'error');
      return;
    } else if (status === 'done' && file.response) {
      if (!file.response.success) {
        CMessage(langLib['file.error'], 'error');
        return;
      }
      const { size, type } = file;
      const isLtMax = size / 1024 / 1024 < 2;
      // 文件过大
      if (!isLtMax) {
        CMessage(langLib['file.overSize'](2), 'error');
        return;
      }
      const { url } = file.response.data[0];
      const { urlObj } = this.state;
      this.setState({
        urlObj: {
          ...urlObj,
          [name]: url,
        },
      });
    }
  };

  setContent = (name) => {
    // const { mainPageConfig } = this.props;
    // const { basicData } = mainPageConfig;
    const { urlObj } = this.state;
    const content = urlObj[name] ?
      <Fragment>
        <div className="zmage-wrap">
          <img style={{ 'width': '100%' }} src={urlObj[name]} onClick={(e) => {
            e.stopPropagation();
            Zmage.browsing({ src: urlObj[name] });
          }
          } alt=""
          />
        </div>
        <div className="zmage-del-wrap" onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          this.handleRemove(name);
        }}
        >
          <i className="iconfont icon-del"/>
        </div>
      </Fragment> :
      <div className={styles.upload}>
        <Icon type="plus"/>
        <div className="ant-upload-text">
          <FormattedMessage id="global.upload"/>
        </div>
      </div>;
    return content;
  };

  // 删除文件
  handleRemove = (name) => {
    const { langLib, dispatch } = this.context;
    const { mainPageConfig } = this.props;
    const { basicData } = mainPageConfig;
    let that = this;
    return new Promise((resolve, reject) => {
      let { close } = ModalBox.confirm({
        ...getDefaultConfirmProps(langLib),
        onOk: () => {
          let { urlObj } = that.state;
          that.setState({
            urlObj: {
              ...urlObj,
              [name]: '',
            },
          });
          closeModal();
        },
        onCancel: () => closeModal(),
      });
      const closeModal = () => {
        close();
      };
    });
  };
  // 获取表单配置
  getFormConfigs = () => {
    const { mainPageConfig } = this.props;
    const { basicData = {} } = mainPageConfig;
    console.log(basicData, 'basicData');
    const { urlObj } = this.state;
    return [
      {			// 基本设置
        key: 'basicLine-base',
        comType: 'static',
        colSpan: 24,
        component: <SplitLine title={<FormattedMessage id="mainPageConfig.tab.basic"/>}/>,
      }, {
        key: 'enabledAccountInformation',
        label: null,
        config: {
          initialValue: basicData.enabledAccountInformation,
          valuePropName: 'checked',
        },
        colSpan: 8,
        component: <Checkbox><FormattedMessage id="mainPageConfig.basic.userBasic"/></Checkbox>,
      }, {
        key: 'enabledPersonalQualification',
        label: null,
        config: {
          initialValue: basicData.enabledPersonalQualification,
          valuePropName: 'checked',
        },
        colSpan: 8,
        component: <Checkbox><FormattedMessage id="mainPageConfig.basic.userPua"/></Checkbox>,
      }, {
        key: 'enabledAccountSecuritySettings',
        label: null,
        config: {
          initialValue: basicData.enabledAccountSecuritySettings,
          valuePropName: 'checked',
        },
        colSpan: 8,
        component: <Checkbox><FormattedMessage id="mainPageConfig.basic.userPwd"/></Checkbox>,
      }, {
        key: 'enabledLanguageSwitchButton',
        label: null,
        config: {
          initialValue: basicData.enabledLanguageSwitchButton,
          valuePropName: 'checked',
        },
        colSpan: 8,
        component: <Checkbox><FormattedMessage id="mainPageConfig.basic.lang"/></Checkbox>,
      }, {
        key: 'enabledSystemVersion',
        label: null,
        config: {
          initialValue: basicData.enabledSystemVersion,
          valuePropName: 'checked',
        },
        colSpan: 8,
        component: <Checkbox><FormattedMessage id="mainPageConfig.basic.version"/></Checkbox>,
      }, {
        key: 'enabledThirdPartyLinks',
        label: null,
        config: {
          initialValue: basicData.enabledThirdPartyLinks,
          valuePropName: 'checked',
        },
        colSpan: 8,
        component: <Checkbox><FormattedMessage id="mainPageConfig.basic.url"/></Checkbox>,
      }, {
        key: 'systemLogo',
        label: <FormattedMessage id="mainPageConfig.basic.systemLogo"/>,
        colSpan: 8,
        config: {
          initialValue: urlObj.systemLogo || '',
        },
        component: (
          <Upload
            className={styles.uploadBox}
            showUploadList={false}
            multiple={false}
            beforeUpload={(file) => {
              this.beforeUpload(file);
            }}
            action={query.EDITOR_UPLOAD}
            headers={{ token: getCookie('token') }}
            accept="image/*"
            listType="picture-card"
            onChange={(e) => this.onchange(e, 'systemLogo')}
          >
            {this.setContent('systemLogo')}
          </Upload>
        ),
      }, {
        key: 'systemLogoHeight', // 系统logo宽度
        label: <FormattedMessage id="mainPageConfig.basic.systemLogoHeight"/>,
        colSpan: 8,
        config: {
          initialValue: basicData.systemLogoHeight || 25,
        },
        component: (
          <Slider onChange={this.changeLogoWidth} min={20} max={40}/>
        ),
      }, {			// pc配置
        key: 'basicLine-userConfig',
        comType: 'static',
        colSpan: 24,
        component: <SplitLine title={<FormattedMessage id="mainPageConfig.basic.pcConfig"/>}/>,
      }, {
        key: 'enabledAppDownload',
        label: null,
        config: {
          initialValue: basicData.enabledAppDownload,
          valuePropName: 'checked',
        },
        colSpan: 8,
        component: <Checkbox><FormattedMessage id="mainPageConfig.basic.app"/></Checkbox>,
      }, {
        key: 'enabledHelpDocument',
        label: null,
        config: {
          initialValue: basicData.enabledHelpDocument,
          valuePropName: 'checked',
        },
        colSpan: 8,
        component: <Checkbox><FormattedMessage id="mainPageConfig.basic.help"/></Checkbox>,
      }, {
        key: 'enabledFullScreenButton',
        label: null,
        config: {
          initialValue: basicData.enabledFullScreenButton,
          valuePropName: 'checked',
        },
        colSpan: 8,
        component: <Checkbox><FormattedMessage id="mainPageConfig.basic.fullScreen"/></Checkbox>,
      }, {
        key: 'feedback',
        label: null,
        config: {
          initialValue: basicData.feedback === 1 ? true : false,
          valuePropName: 'checked',
        },
        colSpan: 8,
        component: <Checkbox><FormattedMessage id="mainPageConfig.basic.feedback"/></Checkbox>,
      }, {			// app配置
        key: 'basicLine-menuConfig-app',
        comType: 'static',
        colSpan: 24,
        component: <SplitLine title={<FormattedMessage id="mainPageConfig.basic.appConfig"/>}/>,
      }, {
        key: 'enabledMyQRCode',
        label: null,
        config: {
          initialValue: basicData.enabledMyQRCode,
          valuePropName: 'checked',
        },
        colSpan: 8,
        component: <Checkbox><FormattedMessage id="mainPageConfig.basic.qrcode"/></Checkbox>,
      }, {
        key: 'enabledFeedback',
        label: null,
        config: {
          initialValue: basicData.enabledFeedback,
          valuePropName: 'checked',
        },
        colSpan: 8,
        component: <Checkbox><FormattedMessage id="mainPageConfig.basic.feedback"/></Checkbox>,
      }, {
        key: 'enabledClearCache',
        label: null,
        config: {
          initialValue: basicData.enabledClearCache,
          valuePropName: 'checked',
        },
        colSpan: 8,
        component: <Checkbox><FormattedMessage id="mainPageConfig.basic.cache"/></Checkbox>,
      }, {
        key: 'enabledLogout',
        label: null,
        config: {
          initialValue: basicData.enabledLogout,
          valuePropName: 'checked',
        },
        colSpan: 8,
        component: <Checkbox><FormattedMessage id="mainPageConfig.basic.logout"/></Checkbox>,
      }, {
        key: 'appThemeColor',
        label: <FormattedMessage id="mainPageConfig.basic.appThemeStyle"/>,
        config: {
          initialValue: basicData.appThemeColor || 1,
        },
        colSpan: 24,
        component: (
          <Radio.Group>
            {themeStyleRadios}
          </Radio.Group>
        ),
      }, {
        key: 'technicalSupport',
        label: <FormattedMessage id="mainPageConfig.basic.technicalSupport"/>,
        config: {
          initialValue: basicData.technicalSupport || '',
        },
        colSpan: 8,
        component: (
          <Input/>
        ),
      }, {
        key: 'appLoginLogo',
        label: <FormattedMessage id="mainPageConfig.basic.appLoginLogo"/>,
        config: {
          initialValue: urlObj.appLoginLogo || '',
        },
        colSpan: 24,
        component: (
          <Upload
            className={styles.uploadBox}
            showUploadList={false}
            multiple={false}
            beforeUpload={(file) => {
              this.beforeUpload(file);
            }}
            action={query.EDITOR_UPLOAD}
            headers={{ token: getCookie('token') }}
            accept="image/*"
            listType="picture-card"
            onChange={(e) => this.onchange(e, 'appLoginLogo')}
          >
            {this.setContent('appLoginLogo')}
          </Upload>
        ),
      }, {			// 菜单配置
        key: 'basicLine-menuConfig-file',
        comType: 'static',
        colSpan: 24,
        component: <SplitLine title={<FormattedMessage id="mainPageConfig.basic.menuConfig"/>}/>,
      }, {
        key: 'menuStyle',
        label: <FormattedMessage id="mainPageConfig.basic.menuStyle"/>,
        config: {
          initialValue: basicData.menuStyle,
        },
        className: styles.selectItem,
        colSpan: 8,
        component: (
          <CSelect>
            {menuStyleOptions}
          </CSelect>
        ),
      }, {			// 主题色设置
        key: 'mainPageConfig.basic.themeConfig',
        comType: 'static',
        colSpan: 24,
        component: <SplitLine title={<FormattedMessage id="mainPageConfig.basic.themeConfig"/>}/>,
      }, {
        key: 'themeColor',
        label: <FormattedMessage id="mainPageConfig.basic.themeStyle"/>,
        config: {
          initialValue: basicData.themeColor || 2,
        },
        colSpan: 24,
        component: (
          <Radio.Group>
            {themeStyleRadios}
          </Radio.Group>
        ),
      }, {  // 顶部样式风格
        key: 'headerStyle',
        label: <FormattedMessage id="mainPageConfig.basic.headerStyle"/>,
        config: {
          initialValue: basicData.headerStyle || 1,
        },
        colSpan: 24,
        component: (
          <Radio.Group>
            {topStyleRadios}
          </Radio.Group>
        ),
      }, {			// pc端登录页配置
        key: 'basicLine-basicLine-menuConfig`-login',
        comType: 'static',
        colSpan: 24,
        component: <SplitLine title={<FormattedMessage id="mainPageConfig.basic.pcLoginConfig"/>}/>,
      }, {  // 登录页样式
        key: 'pcLoginStyle',
        label: <FormattedMessage id="mainPageConfig.basic.pcLoginStyle"/>,
        config: {
          initialValue: basicData.pcLoginStyle || 1,
        },
        colSpan: 24,
        component: (
          <Radio.Group>
            {loginStyleRadios}
          </Radio.Group>
        ),
      }, {
        key: 'loginBackGroupURL',
        label: <FormattedMessage id="mainPageConfig.basic.loginBackGroupURL"/>,
        colSpan: 24,
        config: {
          initialValue: urlObj.loginBackGroupURL || '',
        },
        component: (
          <Upload
            className={styles.uploadBox}
            showUploadList={false}
            multiple={false}
            beforeUpload={(file) => {
              this.beforeUpload(file);
            }}
            action={query.EDITOR_UPLOAD}
            headers={{ token: getCookie('token') }}
            accept="image/*"
            listType="picture-card"
            onChange={(e) => this.onchange(e, 'loginBackGroupURL')}
          >
            {this.setContent('loginBackGroupURL')}
          </Upload>
        ),
      }, {
        key: 'loginLogoURL',
        label: <FormattedMessage id="mainPageConfig.basic.loginLogoURL"/>,
        config: {
          initialValue: urlObj.loginLogoURL || '',
        },
        colSpan: 24,
        component: (
          <Upload
            className={styles.uploadBox}
            showUploadList={false}
            multiple={false}
            beforeUpload={(file) => {
              this.beforeUpload(file);
            }}
            action={query.EDITOR_UPLOAD}
            headers={{ token: getCookie('token') }}
            accept="image/*"
            listType="picture-card"
            onChange={(e) => this.onchange(e, 'loginLogoURL')}
          >
            {this.setContent('loginLogoURL')}
          </Upload>
        ),
      }, {
        key: 'pcRotationChartOne',
        label: <FormattedMessage id="mainPageConfig.basic.pcRotationChartOne"/>,
        config: {
          initialValue: urlObj.pcRotationChartOne || '',
        },
        colSpan: 24,
        component: (
          <Upload
            className={styles.uploadBox}
            showUploadList={false}
            multiple={false}
            beforeUpload={(file) => {
              this.beforeUpload(file);
            }}
            action={query.EDITOR_UPLOAD}
            headers={{ token: getCookie('token') }}
            accept="image/*"
            listType="picture-card"
            onChange={(e) => this.onchange(e, 'pcRotationChartOne')}
          >
            {this.setContent('pcRotationChartOne')}
          </Upload>
        ),
      }, {
        key: 'pcRotationChartTwo',
        label: <FormattedMessage id="mainPageConfig.basic.pcRotationChartTwo"/>,
        config: {
          initialValue: urlObj.pcRotationChartTwo || '',
        },
        colSpan: 24,
        component: (
          <Upload
            className={styles.uploadBox}
            showUploadList={false}
            multiple={false}
            beforeUpload={(file) => {
              this.beforeUpload(file);
            }}
            action={query.EDITOR_UPLOAD}
            headers={{ token: getCookie('token') }}
            accept="image/*"
            listType="picture-card"
            onChange={(e) => this.onchange(e, 'pcRotationChartTwo')}
          >
            {this.setContent('pcRotationChartTwo')}
          </Upload>
        ),
      }, {
        key: 'pcRotationChartThree',
        label: <FormattedMessage id="mainPageConfig.basic.pcRotationChartThree"/>,
        config: {
          initialValue: urlObj.pcRotationChartThree || '',
        },
        colSpan: 24,
        component: (
          <Upload
            className={styles.uploadBox}
            showUploadList={false}
            multiple={false}
            beforeUpload={(file) => {
              this.beforeUpload(file);
            }}
            action={query.EDITOR_UPLOAD}
            headers={{ token: getCookie('token') }}
            accept="image/*"
            listType="picture-card"
            onChange={(e) => this.onchange(e, 'pcRotationChartThree')}
          >
            {this.setContent('pcRotationChartThree')}
          </Upload>
        ),
      }, {
        key: 'pcLoginLogo',
        label: <FormattedMessage id="mainPageConfig.basic.pcLoginLogo"/>,
        config: {
          initialValue: urlObj.pcLoginLogo || '',
        },
        colSpan: 24,
        component: (
          <Upload
            className={styles.uploadBox}
            showUploadList={false}
            multiple={false}
            beforeUpload={(file) => {
              this.beforeUpload(file);
            }}
            action={query.EDITOR_UPLOAD}
            headers={{ token: getCookie('token') }}
            accept="image/*"
            listType="picture-card"
            onChange={(e) => this.onchange(e, 'pcLoginLogo')}
          >
            {this.setContent('pcLoginLogo')}
          </Upload>
        ),
      }, {
        key: 'recordCode',
        label: <FormattedMessage id="mainPageConfig.basic.copy"/>,
        config: {
          initialValue: basicData.recordCode || '',
        },
        colSpan: 8,
        component: (
          <Input/>
        ),
      }, {
        key: 'companyName',
        label: <FormattedMessage id="mainPageConfig.basic.companyName"/>,
        config: {
          initialValue: basicData.companyName || '',
        },
        colSpan: 8,
        component: (
          <SearchSelect
            modalContentType="company"
            showType="list"
            otherQueryParams={{ tableName: basicData.companyName }}
            selectConfig={{
              isMulti: false,
              keyName: 'columnName',
            }}
            setSelected={selectedRows => this.setCompanyName(selectedRows)}
          />
        ),
      },
      // {
      //   key: 'companyName',
      //   label: <FormattedMessage id="mainPageConfig.basic.companyName"/>,
      //   config: {
      //     initialValue: basicData.companyName || '',
      //   },
      //   colSpan: 8,
      //   component: (
      //     <Input/>
      //   ),
      // },
    ];
  };
  // 修改logo宽度
  changeLogoWidth = (value) => {
    const { mainPageConfig } = this.props;
    const { basicData = {} } = mainPageConfig;
    const { dispatch } = this.context;
    localStorage.setItem('hhh', value); // logo高度
    dispatch({
      type: 'global/updateState',
      payload: {
        mainPageConfig: {
          ...mainPageConfig,
          basicData: {
            ...basicData,
            systemLogoHeight: value,
          },
        },
      },
    });
  };
  // 设置公司名称
  setCompanyName = (value) => {
    const { mainPageConfig } = this.props;
    const { basicData = {} } = mainPageConfig;
    const { dispatch } = this.context;
    dispatch({
      type: 'global/updateState',
      payload: {
        mainPageConfig: {
          ...mainPageConfig,
          basicData: {
            ...basicData,
            companyName: value.length ? value[0].name : '',
            companyId: value.length ? value[0].id : '',
          },
        },
      },
    });
  };


  render() {
    const { form, functionData, userInfo } = this.props;
    const { loadingData, loadingSave } = this.state;
    const { canmodify } = functionData.attributes;
    return (
      <Fragment>
        <Form className={styles.wrap}>
          <FormItems
            formConfigs={this.getFormConfigs()}
            form={form}
            loading={loadingData}
          />
        </Form>
        <FooterButton
          userInfo={userInfo}
          canmodify={canmodify}
          loading={loadingSave}
          doClear={this.clearSystemCache}
          handleSubmit={this.handleSubmit}
        />
      </Fragment>
    );
  }
}

export default Form.create()(BasicForm);
