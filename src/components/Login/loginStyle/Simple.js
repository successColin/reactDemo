import React, { Component } from 'react';
import { Form, Icon, Checkbox, Row, Col, message } from 'antd';
import { connect } from 'dva';
import CInput from '@/components/common/BasicWidgets/Widgets/CInput/CInput';
import CButton from '@/components/common/BasicWidgets/Widgets/CButton/CButton';
import { login, getCode, getUrl } from '@/services/login';
import secret from '@/constants/secret';
import { THEME_COLOR, URL_PREFIX } from '@/constants/global';
import { getVariableValue } from '@/services/globalcenter';
import classNames from 'classnames';
import Styles from '../Login.less';
import login_bg from '../../../assets/login_bg.jpg';
import adLogo from '../../../assets/adlogo.png';
import name from '../../../assets/name.png';
import query from '@/constants/query';
import themes from '@/themes';

@connect(state => ({
  theme: state.global.theme,
}))
class Simple extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentWillMount() {
  }

  componentDidMount() {
  }

  handleSubmit = (e) => {
    const { handleSubmit } = this.props;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      handleSubmit(err, values);
    });
  };

  render() {
    const { theme, form, checked, hasVerifyCode, disabled, configObj, loading, keepPassword, formData, setCode,url } = this.props;
    const { getFieldDecorator } = form;
    const activeTheme = themes[theme];
    const wrapCls = `theme-${theme}`;
    let isChecked = localStorage.getItem('checked') || 'false';
    // const { checked, hasVerifyCode, disabled, configObj, loading } = this.state;
    if (loading) {
      return (<div></div>);
    }
    const wrapLayoutCls = classNames({
      [activeTheme[wrapCls]]: true,
      [Styles.box]: true,
    });
    const style = {
      'backgroundSize': '100% 100%',
      'backgroundPosition': 'center',
      'backgroundRepeat': 'no-repeat',
      'backgroundImage': `url("${configObj.loginBackGroupURL || login_bg}")`,
    };
    return (
      <div className={wrapLayoutCls} style={style}>
        {/* fst <img src={name} alt=""*/}
        {/*     style={{ 'width': '200px', 'position': 'absolute', 'top': '27px', 'left': '61px', 'zIndex': 1 }}/>*/}
        <div className={Styles.loginForm}>
          <div className={`${Styles.formLeft} ${configObj.loginLogoURL ? Styles.formLeftBg : ''}`}>
            <div><img className={Styles.adLogin} src={configObj.loginLogoURL || adLogo} alt=""/></div>
          </div>
          <div className={Styles.formRight}>
            <p className={`${Styles.loginName} custom-color`}>Login</p>
            <Form className={Styles.FormDetial} onSubmit={this.handleSubmit}>
              <Form.Item>
                {getFieldDecorator('username', {
                  initialValue: formData.username,
                  rules: [{ required: true, message: '请输入用户名!' }],
                })(
                  <CInput
                    className={hasVerifyCode ? Styles.commonInput1 : Styles.commonInput}
                    prefix={<Icon type="user" className={`${Styles.iconSty} custom-color`}/>}
                    placeholder="请输入用户名"
                  />,
                )}
              </Form.Item>
              <Form.Item>
                {getFieldDecorator('password', {
                  initialValue: formData.password,
                  rules: [
                    { required: true, message: '请输入密码!' },
                    // {
                    //   pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#%_*])[\da-zA-Z~!@#%_*]{8,}$/,
                    //   message: '大小写字母、数字和特殊字符(~!@#%_*)8位以上',
                    // },
                  ],
                })(
                  <CInput
                    className={hasVerifyCode ? Styles.commonInput1 : Styles.commonInput}
                    prefix={<Icon type="lock" className={`${Styles.iconSty} custom-color`}/>}
                    type="password"
                    placeholder="请输入密码"
                  />,
                )}
              </Form.Item>
              {hasVerifyCode ? <Row>
                <Col span={20}>
                  <Form.Item>
                    {getFieldDecorator('code', {
                      rules: [
                        { required: true, message: '请输入验证码!' },
                      ],
                    })(
                      <CInput
                        className={hasVerifyCode ? Styles.commonInput1 : Styles.commonInput}
                        prefix={<Icon type="safety" className={Styles.iconSty}/>}
                        placeholder="请输入验证码"
                      />,
                    )}
                  </Form.Item></Col>
                <Col span={4}>
                  <img onClick={() => setCode()} className={Styles.imgSafe} src={url} alt=""/>
                </Col>
              </Row> : null}
              <Form.Item>
                <Row className={Styles.forget}>
                  <Col span={12} className={Styles.forgetLeft}><Checkbox
                    checked={checked}
                    onChange={keepPassword}
                    className={Styles.chekboxSty}
                  ></Checkbox>记住密码</Col>
                  {/* <Col span={12} className={Styles.forgetRight}>忘记密码?</Col>*/}
                </Row>
                <Row className={Styles.forget}>
                  <Col span={24} className="loginBtn custom-color">
                    <CButton disabled={disabled} htmlType="submit" onClick={this.handleSubmit}>登录</CButton>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </div>
        </div>

        <div className={Styles.RecordNumber}>
          <a href={'http://beian.miit.gov.cn'} target={'_black'}>{configObj.recordCode || ''}</a>
        </div>
      </div>
    );
  }
}

export default Form.create()(Simple);
