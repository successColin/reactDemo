import React, { Component } from 'react';
import { Form, message } from 'antd';
import { connect } from 'dva';
import { login, getUrl } from '@/services/login';
import secret from '@/constants/secret';
import { THEME_COLOR, URL_PREFIX } from '@/constants/global';
import { getVariableValue } from '@/services/globalcenter';
import Simple from './loginStyle/Simple';
import Internet from './loginStyle/Internet';
import login_bg from '../../assets/login_bg.jpg';
import adLogo from '../../assets/adlogo.png';
import name from '../../assets/name.png';
import query from '@/constants/query';
import themes from '@/themes';

@connect(state => ({
  theme: state.global.theme,
}))
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked: false, // 记住密码
      hasVerifyCode: false, // 是否需要验证码
      isEncryption: false, // 是否加密
      disabled: true,
      configObj: {},// 配置集合
      loading: false,
      banners: [],
      infoEmptyTip: false,
      infoErrorTip: false,
    };
  }

  componentWillMount() {
    this.setState({ loading: true });
    this.getUrlMethod();
  }

  componentDidMount() {
    let isChecked = localStorage.getItem('checked') || 'false';
    let checked = isChecked === 'false' ? false : true;
    this.setState({
      checked,
    });
    this.setCode();
    this.getGolbalValue();
    // this.getUrlMethod();
  }

  getDefaultData = () => {
    let data = {};
    let isChecked = localStorage.getItem('checked') || 'false';
    let checked = isChecked === 'false' ? false : true;
    if (checked) {
      let account = secret.decrypt(localStorage.getItem('account'));
      let password = secret.decrypt(localStorage.getItem('password'));
      data = {
        username: account,
        password,
      };
    } else {
      data = {
        username: '',
        password: '',
      };
    }
    return data;
  };

  // 获取配置的背景图
  getUrlMethod = () => {
    getUrl({}).then(res => {
      let banners = [];
      res.pcRotationChartOne != 0 && banners.push(res.pcRotationChartOne);
      res.pcRotationChartTwo != 0 && banners.push(res.pcRotationChartTwo);
      res.pcRotationChartThree != 0 && banners.push(res.pcRotationChartThree);
      this.setState({
        configObj: res,
        banners,
      }, () => {
        this.setTheme();
      });
    });
  };
  setTheme = () => {
    const { configObj } = this.state;
    const { dispatch } = this.props;
    let themeType = THEME_COLOR.find(item => item.id === configObj.themeColor) || {};
    let theme = themeType.type || 'blue';
    dispatch({
      type: 'global/updateTheme',
      payload: {
        theme,
      },
    });
    setTimeout(() => {
      this.setState({ loading: false });
    }, 0);
  };

  // 获取全局变量中的配置 是否加密，是否需要验证码
  getGolbalValue = () => {
    Promise.all([getVariableValue({ variableName: 'PasswrodEncrypted' }), getVariableValue({ variableName: 'VerifyCode' })]).then(res => {
      this.setState({
        isEncryption: res[0] === '0' ? false : true,
        hasVerifyCode: res[1] === '0' ? false : true,
        disabled: false,
      });
    }).catch(err => {
      this.setState({
        disabled: true,
      });
      err && err.msg && message.error(err.msg);
    });
  };

  handleSubmit = (err, values) => {
    // e.preventDefault();
    // this.props.form.validateFields((err, values) => {
    if (!!!values.password || !!!values.username) {
      this.setState({
        infoEmptyTip: true,
        infoErrorTip: false,
      });
      return;
    }
    if (!err) {
      const { checked, isEncryption, hasVerifyCode } = this.state;
      let newParams = {
        ...values,
        username: isEncryption ? secret.encrypt(values.username) : values.username,
        password: isEncryption ? secret.encrypt(values.password) : values.password,
        tag: 'PC',
        isValidate: hasVerifyCode ? 1 : 0,
      };
      this.setState({
        infoEmptyTip: false,
        infoErrorTip: false,
      });
      !hasVerifyCode && delete newParams.isValidate;
      login(newParams).then((res) => {
        this.setCookie('token', res.token, 2);
        this.setCookie('eaminfo', encodeURIComponent(escape(JSON.stringify(res))), 2);
        // window.location.href = `${URL_PREFIX}/`;
        // router.push(`${URL_PREFIX}/`);
        const { origin, pathname } = window.location;
        window.location.href = `${origin}${pathname}`;
        localStorage.setItem('isNormalLogin', 1);//是否正常登录，1-正常登录；0-需要走其他逻辑
        if (checked) {
          localStorage.setItem('account', secret.encrypt(values.username));
          localStorage.setItem('password', secret.encrypt(values.password));
          localStorage.setItem('checked', checked);
        } else {
          localStorage.setItem('account', '');
          localStorage.setItem('password', '');
          localStorage.setItem('checked', checked);
        }
        const { configObj } = this.state;
        localStorage.setItem('sss', configObj.systemLogo || ''); // 系统logourl
        localStorage.setItem('ttt', configObj.themeColor); // 系统色
        localStorage.setItem('topt', configObj.headerStyle); // 顶部颜色
        localStorage.setItem('hhh', configObj.systemLogoHeight || 25); // logo高度
        localStorage.setItem('ccc', true);  // 设置次数，用于提示授权到期提醒
      }, (err) => {
        this.setState({
          infoErrorTip: true,
          infoEmptyTip: false,
        });
        this.setCode();
        // message.error(err.data.msg);
      });
    }
    // });
  };


  setCode = () => {
    let that = this;
    let xhr = new XMLHttpRequest();
    xhr.open('get', query.GETCODE, true);
    xhr.responseType = 'blob';
    xhr.setRequestHeader('content-type', 'application/json;charset=UTF-8');
    xhr.onload = function(e) {
      if (this.status === 200) {
        let imageType = xhr.getResponseHeader('Content-Type');
        let blob = new Blob([this.response], { type: imageType });
        let url = (window.URL || window.webkitURL).createObjectURL(blob);
        that.setState({ url });
      }
    };
    xhr.send();
  };
  keepPassword = (e) => {
    this.setState({
      checked: e.target.checked,
    });
  };
  // 获取cookie
  getCookie = (key) => {
    if (document.cookie.length > 0) {
      var start = document.cookie.indexOf(key + '=');
      if (start !== -1) {
        start = start + key.length + 1;
        var end = document.cookie.indexOf(';', start);
        if (end === -1) end = document.cookie.length;
        return unescape(document.cookie.substring(start, end));
      }
    }
    return '';
  };

  // 保存cookie
  setCookie = (cName, value, expiredays) => {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = cName + '=' + decodeURIComponent(value) +
      ((expiredays == null) ? '' : ';expires=' + exdate.toGMTString());
  };

  render() {
    const { theme, form } = this.props;
    const { getFieldDecorator } = form;
    const activeTheme = themes[theme];
    const wrapCls = `theme-${theme}`;
    let isChecked = localStorage.getItem('checked') || 'false';
    const { checked, hasVerifyCode, disabled, configObj, loading, infoErrorTip, infoEmptyTip, banners, url } = this.state;
    const { pcLoginStyle } = configObj;
    if (loading) {
      return (<div></div>);
    }
    const formData = this.getDefaultData();
    const loginConfigs = {
      checked,
      hasVerifyCode,
      disabled,
      configObj,
      loading,
      infoErrorTip,
      infoEmptyTip,
      banners,
      formData,
      pcLoginStyle,
      url,
      setCode: this.setCode,
      keepPassword: this.keepPassword,
      handleSubmit: this.handleSubmit,
    };
    return (<div>
      {pcLoginStyle === 2 ? <Internet  {...loginConfigs} /> : <Simple {...loginConfigs} />}
    </div>);
  }
}

export default Form.create()(Login);
