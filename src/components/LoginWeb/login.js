import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Icon, Input, Checkbox, Row, Col, message } from 'antd';
import classNames from 'classnames';
import themes from '@/themes';
import Styles from './Login.less';
import secret from '@/constants/secret';
import { THEME_COLOR } from '@/constants/global';
import { loginSaas, getUrl } from '@/services/login';

import login_bg from '@/assets/login_bg.jpg';
import adLogo from '@/assets/adlogo.png';

import CInput from '@/components/common/BasicWidgets/Widgets/CInput/CInput';
import CButton from '@/components/common/BasicWidgets/Widgets/CButton/CButton';
import VerificationBtn from './VerificationBtn/VerificationBtn';
import PerfectPersonal from './PerfectPersonal/PerfectPersonal';

@connect(state => ({
  theme: state.global.theme,
}))
class LoginWeb extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginType: 2,//登录类型：1-验证码登录；2-密码登录
      disabled: true,
      configObj: {},// 配置集合
      loading: false,
      whether: 1//用于登录后判断是否已经更新过用户信息.1-已经更新（显示登录界面）；2-未更新
    }
    this.currentTelphone = '' // 当前电话号码
    this.loginMsg = {}//登录信息
    //清空cookie与本地存储
    document.cookie = ''
    localStorage.clear()
  }
  componentWillMount () {
    this.getUrlMethod();
  }
  componentDidMount () {

  }

  // 获取配置
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
  }
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
  }

  hangdleAgree = (e) => {//是否同意规则
    this.setState({
      disabled: !e.target.checked
    });
  }

  // 保存cookie
  setCookie = (cName, value, expiredays) => {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = cName + '=' + decodeURIComponent(value) +
      ((expiredays == null) ? '' : ';expires=' + exdate.toGMTString());
  }

  //登录
  setCookieAndStorage = (updateMsg) => {//设置cookie和缓存
    const loginMsg = { ...this.loginMsg, ...updateMsg },
      { token } = loginMsg,
      { configObj } = this.state,
      { origin, pathname } = window.location;

    this.setCookie('token', token, 2);
    this.setCookie('eaminfo', encodeURIComponent(escape(JSON.stringify(loginMsg))), 2);
    window.location.href = `${origin}${pathname}`;
    localStorage.setItem('account', '');
    localStorage.setItem('password', '');

    localStorage.setItem('sss', configObj.systemLogo || ''); // 系统logourl
    localStorage.setItem('ttt', configObj.themeColor); // 系统色
    localStorage.setItem('topt', configObj.headerStyle); // 顶部颜色
    localStorage.setItem('hhh', configObj.systemLogoHeight || 25); // logo高度
    localStorage.setItem('ccc', true);  // 设置次数，用于提示授权到期提醒
  }
  //修改用户完善状态
  setWhether = (whether) => {
    this.setState({ whether, loginType: 2 })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {//如果没有验证问题需要进行登录注册
        let loginParam = { ...values }
        loginParam.loginType = this.state.loginType

        if (loginParam.loginType === 2) loginParam.password = secret.encrypt(values.password) //如果为密码登录，对密码进行加密

        loginSaas(loginParam).then(res => {
          this.loginMsg = { ...res }
          const { whether } = res;
          //whether用于判断是已经完善过用户信息
          //已经完善过用户信息，那么这次进入主页
          //如果没有完善用户信息，默认先到完善界面进行完善信息
          if (whether === 1) this.setCookieAndStorage();
          else this.setWhether(whether);

        })
      }
    })
  }

  handleTelphone = (e) => {//处理电话号号码改变时
    e.persist()
    const currenValue = e.target.value
    //如果填入的电话号符合规则，这设置当前电话号，如果是验证码登录，那么可以点击发送验证码
    if (/^1[3456789]\d{9}$/.test(currenValue)) this.currentTelphone = currenValue
    else this.currentTelphone = ''
  }

  changeLoginType = () => {//切换登录状态
    const { loginType } = this.state
    let currentType = loginType === 1 ? 2 : 1
    this.setState({ loginType: currentType });
    const tel = this.props.form.getFieldValue('telephone')
    this.props.form.resetFields(['telephone'])
    this.props.form.setFieldsValue({ telephone: tel })
  }

  loginRender = () => {//登录的界面
    const { theme, form } = this.props,
      activeTheme = themes[theme],//当前的主题色
      wrapCls = `theme-${theme}`;

    const { getFieldDecorator } = form;

    const { configObj, loginType, disabled } = this.state
    const wrapLayoutCls = classNames({
      [activeTheme[wrapCls]]: true,
      [Styles.box]: true,
    }),
      loginTypeTip = `${loginType === 1 ? '账号密码' : '手机号注册'}登录`;
    const style = {
      'backgroundSize': '100% 100%',
      'backgroundPosition': 'center',
      'backgroundRepeat': 'no-repeat',
      'backgroundImage': `url("${configObj.loginBackGroupURL || login_bg}")`,
    };
    //手机号码，如果是账号密码登录时，不用校验手机号码
    let telephoneRule = [{ required: true, message: loginType === 1 ? '手机号码不能为空!' : '账号不能为空!' }],
      telephonePlaceholder = loginType === 1 ? '请输入手机号码' : '请输入账号'
    loginType === 1 && telephoneRule.push({ pattern: new RegExp(/^1[3456789]\d{9}$/), message: '手机号码格式错误!' })
    // form.setFieldsValue(content)

    return <div className={wrapLayoutCls} style={style}>
      <div className={Styles.loginForm}>
        <div className={`${Styles.formLeft}`}>
          <div><img className={Styles.adLogin} src={configObj.loginLogoURL || adLogo} alt="" /></div>
        </div>
        <div className={Styles.formRight}>
          <p className={`${Styles.loginName} custom-color`}>Login</p>
          <Form className={Styles.FormDetial}>
            <Form.Item>
              {getFieldDecorator('telephone', {
                validateFirst: true,
                rules: telephoneRule,
              })(
                <CInput
                  prefix={<Icon type="mobile" className={`${Styles.iconSty} custom-color`} />}
                  className={Styles.commonInput1}
                  placeholder={telephonePlaceholder}
                  onChange={this.handleTelphone}
                />,
              )}
            </Form.Item>
            {loginType === 1 ?
              <Row>
                <Col span={16}>
                  <Form.Item>
                    {getFieldDecorator('code', {
                      rules: [{ required: true, message: '验证码不能为空!' }],
                    })(
                      <Input
                        prefix={<Icon type="safety-certificate" className={`${Styles.iconSty} custom-color`} />}
                        className={Styles.commonInput1}
                        placeholder="请输入验证码"
                      />
                    )}
                  </Form.Item>
                </Col>
                <Col span={8} className="verificationBtn custom-color">
                  <VerificationBtn currentTelphone={this.currentTelphone} ></VerificationBtn>
                </Col>
              </Row>
              :
              <Form.Item>
                {getFieldDecorator('password', {
                  rules: [{ required: true, message: '密码不能为空' }],
                })(
                  <Input.Password
                    prefix={<Icon type="lock" className={`${Styles.iconSty} custom-color`} />}
                    className={Styles.commonInput1}
                    placeholder="请输入密码"
                  />
                )}
              </Form.Item>
            }

            <Form.Item>
              <Row>
                <Col span={12}>
                  <Checkbox
                    className={Styles.chekboxSty}
                    onChange={this.hangdleAgree}
                  >
                    登录并同意<a href={`${window.location.origin}/pdf/APIoT用户协议.pdf`} target="_blank">《APIoT用户协议》</a>
                  </Checkbox>
                </Col>
                <Col span={12} style={{ textAlign: 'right' }}>
                  <a className={Styles.loginMode} onClick={this.changeLoginType}>{loginTypeTip}</a>
                </Col>
              </Row>
              <Row>
                <Col span={24} className="loginBtn custom-color">
                  <CButton disabled={disabled} htmlType="submit" onClick={this.handleSubmit}>登录</CButton>
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  }

  render () {
    const { whether } = this.state
    const perfectParams = {
      configObj: this.state.configObj,
      loginMsg: this.loginMsg
    }
    return (
      <div>
        { whether === 1 ? this.loginRender() : <PerfectPersonal perfectParams={perfectParams} setWhether={this.setWhether}></PerfectPersonal>}
      </div>
    )
  }
}

export default Form.create()(LoginWeb);
