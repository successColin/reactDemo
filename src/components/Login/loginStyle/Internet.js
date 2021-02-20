import React, { Component } from 'react';
import { Form, Icon, Checkbox, Row, Col, message, Input } from 'antd';
import { connect } from 'dva';
// import { FormattedMessage } from 'react-intl';
import CInput from '@/components/common/BasicWidgets/Widgets/CInput/CInput';
import CButton from '@/components/common/BasicWidgets/Widgets/CButton/CButton';
import { login, getCode, getUrl, ssoByAccount } from '@/services/login';
import secret from '@/constants/secret';
import { THEME_COLOR, URL_PREFIX } from '@/constants/global';
import { getVariableValue } from '@/services/globalcenter';
// import LanguageSelect from './Language/LanguageSelect.js';
import classNames from 'classnames';
import Styles from '../Internet.less';
import login_bg from '../../../assets/login_bg.jpg';
import adLogo from '../../../assets/adlogo.png';
// import iconFont from '@/styles/iconfont/pc/iconfont.js'
import name from '../../../assets/name.png';
import query from '@/constants/query';
import themes from '@/themes';
import { getCookie } from '@/utils/common';

@connect(state => ({
  theme: state.global.theme,
}))
class Internet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentBanner: 0,
      prevBanner: null,
    };
  }

  componentWillMount() {
    // setTimeout(function(){
    var uAgent = window.navigator.userAgent;
    var isIOS = uAgent.match(/iphone/i);
    var deviceWidth = document.body.clientWidth || document.documentElement.clientWidth;
    document.documentElement.style.fontSize = deviceWidth / 14.4 + 'px';
    // },500)
  }

  componentDidMount() {
    const { banners } = this.props;
    if (banners.length > 1) {
      setInterval(() => {
        this.carouselBanner();
      }, 3000);
    }
  }

  handleSubmit = e => {
    const { handleSubmit } = this.props;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      handleSubmit(err, values);
    });
  };
  // 生成banner图
  getBannerList = () => {
    const { prevBanner, currentBanner } = this.state;
    const { banners } = this.props;
    let bannerList = [];
    banners.forEach((item, index) => {
      const bannerCls = classNames({
        [Styles.bannerItem]: true,
        [Styles.prevBanner]: prevBanner === index,
        [Styles.currentBanner]: currentBanner === index,
      });
      bannerList.push(
        <div className={bannerCls} style={{ backgroundImage: `url("${item}")` }}></div>,
      );
    });
    return bannerList;
  };
  // 轮播
  carouselBanner = () => {
    const { prevBanner, currentBanner } = this.state;
    const { banners } = this.props;
    const len = banners.length;
    let prev, current;
    if (currentBanner === len - 1) {
      current = 0;
      prev = len - 1;
    } else {
      current = currentBanner + 1;
      prev = currentBanner;
    }
    this.setState({
      currentBanner: current,
      prevBanner: prev,
    });
    setTimeout(() => {
      this.setState({
        prevBanner: null,
      });
    }, 1000);
  };

  render() {
    const { theme, form, checked, hasVerifyCode, disabled, configObj, loading, infoErrorTip, infoEmptyTip, banners, keepPassword, formData, setCode, url } = this.props;
    const { currentBanner } = this.state;
    const { getFieldDecorator } = form;
    const activeTheme = themes[theme];
    const wrapCls = `theme-${theme}`;
    const wrapLayoutCls = classNames({
      [activeTheme[wrapCls]]: true,
      [Styles.box]: true,
    });
    let isChecked = localStorage.getItem('checked') || 'false';
    if (loading) {
      return (<div></div>);
    }
    return (
      <div className={wrapLayoutCls}>
        <div className={Styles.loginWrap}>
          <div className={Styles.loginLeftWrap}>
            <div className={Styles.loginBanner}>
              {banners.length && this.getBannerList()}
            </div>
            <ul className={Styles.spotList}>
              {banners.length && banners.map((item, index) => {
                return <li className={`${currentBanner === index ? Styles.currentSpot : ''}`}></li>;
              })}
            </ul>
            {configObj.pcLoginLogo && <img className={Styles.pcLoginLogo} src={configObj.pcLoginLogo} alt=""/>}
          </div>
          <div className={Styles.loginRightWrap}>
            {/* <div className={Styles.langWrap}>
              <LanguageSelect/>
          </div> */}
            <div className={Styles.formRight}>
              <p className={`${Styles.loginName}`}>Login</p>
              <p className={Styles.hello}>欢迎登录APIoT平台!</p>
              {infoEmptyTip && <p className={Styles.infoEmptyTip}>你好！请输入账号和密码再登录。</p>}
              {infoErrorTip && <p className={Styles.infoErrorTip}>你好！请输入正确的账号和密码。</p>}
              <Form className={Styles.FormDetial} onSubmit={this.handleSubmit}>
                <Form.Item label="账号">
                  {getFieldDecorator('username', {
                    initialValue: formData.username,
                    labelCol: { span: 24 },
                    // rules: [{ required: true, message: '' }],
                  })(
                    // <div>
                    // <p className={Styles.loginLabel}>账号</p>
                    <CInput
                      className={hasVerifyCode ? Styles.commonInput1 : Styles.commonInput}
                      // prefix={<Icon type="user" className={`${Styles.iconSty} custom-color`}/>}
                      placeholder="请输入用户名"
                    />
                    // </div>
                    ,
                  )}
                </Form.Item>
                <Form.Item label="密码">
                  {getFieldDecorator('password', {
                    initialValue: formData.password,
                    rules: [
                      // { required: true,  },
                      // {
                      //   pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#%_*])[\da-zA-Z~!@#%_*]{8,}$/,
                      //   message: '大小写字母、数字和特殊字符(~!@#%_*)8位以上',
                      // },
                    ],
                  })(
                    // <div>
                    // <p className={Styles.loginLabel}>密码</p>

                    <Input.Password className={hasVerifyCode ? Styles.commonInput1 : Styles.commonInput}
                                    placeholder="请输入密码"/>
                    ,
                  )}
                </Form.Item>
                {hasVerifyCode ? <Row>
                  <Col span={20}>
                    <Form.Item>
                      {getFieldDecorator('code', {
                        rules: [
                          { required: true },
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
                      className={`${Styles.chekboxSty} rememberPassword`}
                    ></Checkbox>记住密码</Col>
                    {/* <Col span={12} className={Styles.forgetRight}>忘记密码?</Col> */}
                  </Row>
                  <Row className={Styles.forget}>
                    <Col span={24} className={Styles.loginBtn}>
                      <CButton disabled={disabled} htmlType="submit" onClick={this.handleSubmit}>登录</CButton>
                    </Col>
                  </Row>
                  {/* <Row className={Styles.forget}>
                  <Col span={24} className={Styles.register}>
                    还没账号?<span>立即注册</span>
                  </Col>
                </Row> */}
                </Form.Item>
              </Form>
            </div>

            <div className={Styles.RecordNumber}>
              <a href={'http://beian.miit.gov.cn'} target={'_black'}>{configObj.recordCode || '浙江公网安备：浙B2-20080101'}</a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Form.create()(Internet);
