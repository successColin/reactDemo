/*
 * @Author: Fus
 * @Date:   2019-04-24 14:16:13
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-03-18 14:49:29
 * @Desc: 头部模块
 *      包含：logo、帮助文档、个人中心等
 */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'dva';

import { FormattedMessage } from 'react-intl';
import { Layout, Input, Select, Popover, Tooltip, notification } from 'antd';
import secret from '@/constants/secret';

import { BaseContext, HEADER_SEARCH_TYPE, DB_LANG_TYPE_TO_FRONT } from '@/constants/global';
import moment from 'moment';
import { getCookie } from '@/utils/common';
import UserCenter from './UserCenter/UserCenter';
import HelpDocs from './HelpDocs/HelpDocs';
import LanguageSelect from './Language/LanguageSelect.js';
import QBList from './Qrcode/Qrcode';
import VersionInfo from './VersionInfo/VersionInfo';
import HeaderBg from './HeaderBg/HeaderBg';
import styles from './BasicHeader.less';
import logo from '@/assets/logo.png';
import sublogo from '@/assets/sub_logo.png';
import avatar from '@/assets/avatar.png';
// import VideoModal from './VideoModal/VideoModal';

const { Header } = Layout;
const { Search } = Input;
const { Option } = Select;

// 头部搜索分类
// const searchOptions = Object.keys(HEADER_SEARCH_TYPE).map(item => <Option value={item} key={item}>{<FormattedMessage
//   id={HEADER_SEARCH_TYPE[item]}
// />}</Option>);


@connect(state => ({
  showMenuCenter: state.global.showMenuCenter,
  showSidebar: state.global.showSidebar,
  userInfo: state.user.userInfo,
  avatarInfo: state.user.avatarInfo,
  mainPageConfig: state.global.mainPageConfig,
}))
class BasicHeader extends React.Component {
  static contextType = BaseContext;
  state = {
    visibleBrief: false, // 个人中心简要
    visibleHelpDoc: false, // 帮助文档
    visibleVisionInfo: false, // 版本信息
    isFullScreen: false, // 全屏
    visibleTell: false, // 呼叫弹框
  };

  componentWillMount() {
    console.log('componentWillMount', '----base--');
  }

  componentDidMount() {
    const eam_info = getCookie('eaminfo');
    console.log('componentDidMount', '----base--');
    const userInfo = eam_info ? JSON.parse(decodeURIComponent(unescape(eam_info))) : {};
    const { currentLanguage, token } = userInfo;
    const { dispatch } = this.context;
    localStorage.setItem('token', token);
    let ccc = localStorage.getItem('ccc') === 'true' ? true : false;
    // 中英文
    dispatch({
      type: 'global/updateLang',
      payload: {
        lang: DB_LANG_TYPE_TO_FRONT[currentLanguage] || 'zh',
      },
    });
    console.log(userInfo, 'basse');
    dispatch({
      type: 'user/updateState',
      payload: {
        userInfo,
        avatarInfo: userInfo.picpath || avatar,
      },
    });
    // 获取个人头像
    // dispatch({
    //   type: 'user/getUserAvatar',
    //   payload: {
    //     userId: userInfo.id,
    //   },
    // });
    // 获取个人资质文件
    dispatch({
      type: 'user/getPersonalPua',
      payload: {
        userId: userInfo.id,
      },
    });
    let that = this;
    document.addEventListener('fullscreenchange', function(e) {
      if (document.fullscreenElement) {
        console.log('进入全屏');
        that.setState({ isFullScreen: true });
      } else {
        console.log('退出全屏');
        that.setState({ isFullScreen: false });
      }
    });
    if (userInfo.remindGoingExpire && ccc) this.dueReminder(userInfo);
    dispatch({ type: 'global/getReportDomain' }); // 报表域名
    dispatch({ type: 'global/getMainPageBasicConfig' }); // 主页配置基本信息
    dispatch({ type: 'global/getMainPageThirdLink' }); // 三方链接
    dispatch({ type: 'global/getMainPageHelpDoc' }); // 帮助文档
    dispatch({ type: 'global/getSystemVersion' }); // 版本信息
    dispatch({ type: 'global/getQBlists' }); // app二维码
  }

  componentWillUnmount() {
    document.removeEventListener('fullscreenchange', function(e) {
    });
  }

  // 判断是否现在到期提示
  dueReminder = (userInfo) => {
    const { langLib } = this.context;
    const { licenseExpireDate } = userInfo;
    let passDate = moment(licenseExpireDate).format('YYYY-MM-DD');
    notification.warning({
      message: langLib['global.tip'],
      description: langLib['global.maturity'](passDate),
      placement: 'topRight',
    });
    localStorage.setItem('ccc', false);
  };

  // 全屏
  handleFullScreen = () => {
    var element = document.documentElement;
    let isFullscreen = document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
    this.setState({ isFullScreen: true });
  };

  // 退出全屏
  handleExitFullscreen = () => {
    let isFullscreen = document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled;
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
    this.setState({ isFullScreen: false });
  };
  // 切换主题
  changeTheme = () => {
    this.context.dispatch({
      type: 'global/updateTheme',
      payload: {
        theme: 'red',
      },
    });
  };
  // 切换语言
  changeLang = () => {
    this.context.dispatch({
      type: 'global/updateLang',
      payload: {
        lang: 'en',
      },
    });
  };
  // 切换sidebar
  onTriggerSidebar = () => {
    this.context.dispatch({
      type: 'global/updateShowSidebar',
      payload: {
        showSidebar: !this.props.showSidebar,
      },
    });
  };
  // 渲染第三方链接
  setThirdLink = () => {
    const { visibleVisionInfo } = this.state;
    const { thirdLink = [], basicData } = this.props.mainPageConfig;
    const links = thirdLink.map(item => {
      const { name, url, id } = item;
      return (
        <span className={styles.entry} key={`thirdLink-${id}`}>
          <a href={url} target="_blank">
            {name}
          </a>
        </span>
      );
    });
    return links;
  };
  updateWrapState = (itemObj) => {
    this.setState(itemObj);
  };

  render() {
    const { showMenuCenter, showSidebar, avatarInfo, mainPageConfig, userInfo, videoVisible } = this.props;
    const { visibleBrief, visibleHelpDoc, isFullScreen, visibleVisionInfo, visibleTell } = this.state;
    let systemUrl = localStorage.getItem('sss') || '';
    let headerStyle = Number(localStorage.getItem('topt') || '');
    let logoHeight = Number(localStorage.getItem('hhh') || '');
    const { basicData } = mainPageConfig;
    const { langLib } = this.context;
    const wrapCls = classNames({
      'custom-header-bg': !(headerStyle === 1),
      [styles.wrap]: true,
      [styles.showMenuCenter]: showMenuCenter,
      'darker-header-bg': headerStyle === 1,
    });
    const triggerCls = classNames({
      'iconfont': true,
      'icon-menu-fold': true,
      'icon-menu-unfold': !!!showSidebar,
      [styles.trigger]: true,
    });
    const fullScreenIcon = isFullScreen ? (
      <Tooltip title={<FormattedMessage id="header.exitFullScreen"/>}>
        <span className="iconfont icon-exitFullScreen-bold" onClick={this.handleExitFullscreen}/>
      </Tooltip>
    ) : (
      <Tooltip title={<FormattedMessage id="header.fullScreen"/>}>
        <span className="iconfont icon-fullScreen-bold" onClick={this.handleFullScreen}/>
      </Tooltip>
    );
    const info = {
      "companyKey":userInfo.companyKey,
			"account":userInfo.account,
    }
    // const feedbackUrl = 'http://www.apiot.cloud/#/?userInfo=' + secret.encrypt(JSON.stringify(info))
    const feedbackUrl = 'http://121.196.97.165/feedbackCenter/#/?userInfo=' + secret.encrypt(JSON.stringify(info))
    return (
      <Header className={wrapCls}>
        <HeaderBg/>
        <div className={styles.contentWrap}>
          {/* <div className={`${styles.triggerWrap} ${styles.item}`}>
            <span
              className={triggerCls}
              onClick={this.onTriggerSidebar}
            />
          </div> */}
          <a onClick={() => window.location.reload()}>
            <img src={systemUrl || basicData.systemLogo || logo} className={styles.logo}
                 style={{ height: `${logoHeight || basicData.systemLogoHeight}px` }}/>
            {/*<img src={sublogo} className={styles.logo}/> fst*/}
          </a>
          <div className={styles.entryWrap}>
            {!!basicData.enabledThirdPartyLinks && (
              <div className={styles.thirdLinkWrap}>
                {this.setThirdLink()}
              </div>
            )}
            {!!(basicData.feedback === 1) && (
              <div className={styles.thirdLinkWrap}>
                <span className={styles.entry}>
                  <a href={feedbackUrl} target="_blank">
                    <FormattedMessage id="header.feedback"/>
                  </a>
                </span>
              </div>
            )}
            {!!basicData.enabledSystemVersion && (
              <Popover
                content={<VersionInfo updateWrapState={this.updateWrapState}/>}
                // trigger="click"
                placement="bottomRight"
                arrowPointAtCenter={true}
                visible={visibleVisionInfo}
                onVisibleChange={visibleVisionInfo => this.setState({ visibleVisionInfo })}
                getPopupContainer={() => document.getElementById('main-container')}
              >
                <div className={styles.versionWrap}>
                  <span className={styles.entry}>
                    <FormattedMessage id="header.versionInfo"/>
                  </span>
                </div>
              </Popover>
            )}
            {/* <span className={styles.entry}>
              <FormattedMessage id="header.helpDoc" />
            </span> */}
            <span className={styles.line}>|</span>
            {/* <Tooltip title={<FormattedMessage id="header.msg" />}> */}
            {/* <Badge count={5} className="custom-header-badge"> */}
            {/* <span className="iconfont icon-notice" /> */}
            {/* </Badge> */}
            {/* </Tooltip> */}
            {!!basicData.enabledAppDownload && (
              <Popover placement="topRight" content={<QBList/>}>
                <div className={styles.iconWrap}>
                  <span className="iconfont icon-download-app-bold"/>
                </div>
              </Popover>
            )}
            {!!basicData.enabledHelpDocument && (
              <Popover
                content={<HelpDocs/>}
                // trigger="click"
                placement="bottomRight"
                arrowPointAtCenter={true}
                visible={visibleHelpDoc}
                onVisibleChange={visibleHelpDoc => this.setState({ visibleHelpDoc })}
                getPopupContainer={() => document.getElementById('main-container')}
              >
                <div className={styles.iconWrap}>
                  <span className="iconfont icon-help-bold"/>
                </div>
              </Popover>
            )}
            {!!basicData.enabledFullScreenButton && (
              <div className={`${styles.fullScreenWrap} ${styles.iconWrap}`}>
                {fullScreenIcon}
              </div>
            )}
            {!!basicData.enabledLanguageSwitchButton && (
              <div className={styles.iconWrap}>
                <span className={styles.lang}>
                  {/*<FormattedMessage id="locale.zh"/>*/}
                  <LanguageSelect/>
                </span>
              </div>
            )}
            <Popover
              content={<UserCenter updateWrapState={this.updateWrapState}/>}
              // trigger="click"
              placement="bottomRight"
              visible={visibleBrief}
              onVisibleChange={visibleBrief => this.setState({ visibleBrief })}
              getPopupContainer={() => document.getElementById('main-container')}
            >
              <span className={`${styles.avatar} userHeaderInfo`}>
                <img src={avatarInfo} alt="avatar"/>
                <span className={styles.userName}>{userInfo.username}</span>
              </span>
            </Popover>
          </div>
        </div>
        {/*<VideoModal/>*/}
      </Header>
    );
  }
};

export default BasicHeader;
