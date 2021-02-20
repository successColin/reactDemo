/*
 * @Author: Fus
 * @Date:   2019-04-24 14:16:46
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-02-18 13:56:26
 * @Desc: 主体layout 包括Header/Sidebar/Footer
 */
import React, { Component } from 'react';
import { Layout, message } from 'antd';
import router from 'umi/router';
import { connect } from 'dva';
import classNames from 'classnames';
import Locale from './Locale/Locale';
import BasicHeader from './BasicHeader/BasicHeader';
import Sidebar from './Sidebar/Sidebar';
import ConTainer from './Container/Container';
import { BaseContext, THEME_COLOR, URL_PREFIX } from '../constants/global';
import { getUrl, ssoByAccount, getLoginAccount } from '@/services/login';
import { getVariableValue } from '@/services/globalcenter';
import { base64Encode } from '@/constants/base64encode';
import axios from 'axios';
import { setCookie, getCookie } from '@/utils/common';
import secret from '@/constants/secret';
import themes from '../themes';
import styles from './MainLayout.less';

const { Content } = Layout;

@connect(state => ({
  theme: state.global.theme,
  langLib: state.global.langLib,
  showSidebar: state.global.showSidebar,
  mainPageConfig: state.global.mainPageConfig,
}))
class MainLayout extends Component {

  constructor(props) {
    super(props);
    this.state = {
      isSsoByAccount: true,
    };
  }

  componentWillMount() {
    let ttt = localStorage.getItem('ttt');
    getUrl().then(res => {
      ttt = res.themeColor || 2;
      localStorage.setItem('ttt', ttt);
      localStorage.setItem('topt', res.headerStyle);
      localStorage.setItem('hhh', res.systemLogoHeight || 25); // logo高度
      localStorage.setItem('sss', res.systemLogo || '');
      this.setTheme(ttt);
    }, err => {
      this.setTheme(ttt);
    });
    // !!ttt && this.setTheme(ttt);
    this.ssoByAccount();
  }

  setTheme = (ttt = 2) => {
    const { dispatch } = this.props;
    let themeType = THEME_COLOR.find(item => item.id === Number(ttt)) || {};
    let theme = themeType.type || 'blue';
    dispatch({
      type: 'global/updateTheme',
      payload: {
        theme,
      },
    });
  };

  ssoByAccount = () => {
    // 上海电器单点登录
    getVariableValue({ variableName: 'useSsoPc' }).then(res => {
      const eam_info = getCookie('eaminfo');
      if (res == 3) {
        const pathname = this.props.location.pathname;
        const LtpaToken = getCookie('LtpaToken');
        if (pathname === '/' && LtpaToken) {
          this.setState({
            isSsoByAccount: true,
          });
          const params = {
            'itToken': LtpaToken,
            // "userCode": "",
            // "password": "",
            'hasCompanyInfo': true, // 是否需要包含组织结构信息
            'hasAuthInfo': true, // 是否需要包含权限数据
          };
          axios({
            method: 'post',
            url: '/eam/itSso/getAccount',
            data: params,
            headers: {
              'content-type': 'application/json;charset=UTF-8',
              // 'Authorization': `Basic ${base64Encode('ITSYS:ITSYS2AUTH:Gt54rfvb')}`,
            },
          }).then(data => {
            const res = data.data
            if (res && res.account && res.account.code) {
              let newParams = {
                account: secret.encrypt(res.account.code),
                tag: 'PC',
                language: '',
              };
              ssoByAccount(newParams).then((res) => {
                const _this = this;
                setTimeout(() => {
                  _this.setState({
                    isSsoByAccount: false,
                  });
                }, 100);
                setCookie('token', res.token, 2);
                setCookie('eaminfo', encodeURIComponent(escape(JSON.stringify(res))), 2);
                localStorage.setItem('sss', res.systemLogo || ''); // 系统logourl
                localStorage.setItem('ttt', res.themeColor); // 系统色
                localStorage.setItem('ccc', true);  // 设置次数，用于提示授权到期提醒
              }, (err) => {
                this.layout();
                message.error(err || '请求失败');
                // this.setState({
                //   isSsoByAccount: false,
                // });
              });
            } else {
              message.error(res.message || '请求失败');
            }
          }, (err) => {
            this.layout();
          //   // this.setState({
          //   //   isSsoByAccount: false,
          //   // });
          });

        } else if (!LtpaToken) {
          message.error('获取不到LtpaToken');
          this.setState({
            isSsoByAccount: false,
          });
        } else {
          this.setState({
            isSsoByAccount: false,
          });
        }
      } else {
        this.setState({
          isSsoByAccount: false,
        });
      }
    }, (err) => {
      this.setState({
        isSsoByAccount: false,
      });
    });
  };

  layout = () => {
    getVariableValue({ variableName: 'LoginOUTURL' }).then(res => {
      if (res) {
        window.location.href = res;
      } else {
        // window.location.href = `${URL_PREFIX}/login`;
        router.push(`${URL_PREFIX}/login`);
      }
    });
  };



  render() {
    const { theme, dispatch, langLib, showSidebar, mainPageConfig } = this.props;
    const { isSsoByAccount } = this.state;
    const { basicData = {} } = mainPageConfig;
    const { menuStyle } = basicData;
    const activeTheme = themes[theme];
    const wrapCls = `theme-${theme}`;
    const wrapLayoutCls = classNames({
      [activeTheme[wrapCls]]: true,
      [styles.wrap]: true,
    });
    const contentWrapCls = classNames({
      [styles.contentWrap]: true,
      mainLayout: true,
      [styles.menuCenterContentWrap]: menuStyle === 3,
    });
    const contentCls = classNames({
      [styles.showSidebar]: showSidebar,
    });
    if (isSsoByAccount) return null;
    return (
      <BaseContext.Provider value={{ langLib, theme, dispatch }}>
        <Locale>
          <Layout className={wrapLayoutCls} id="main-container">
            <BasicHeader showSidebar={showSidebar}/>
            <Layout className={contentWrapCls}>
              <Sidebar/>
              <Content className={contentCls}>
                <ConTainer/>
              </Content>
            </Layout>
          </Layout>
        </Locale>
      </BaseContext.Provider>
    );
  }
}

export default MainLayout;
