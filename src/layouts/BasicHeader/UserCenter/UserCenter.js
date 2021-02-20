/*
 * @Author: Fus
 * @Date:   2019-09-23 13:42:13
 * @Desc: 用户个人中心
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import { Card, Form } from 'antd';
import { connect } from 'dva';
import router from 'umi/router';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import { CButton, CMessage } from '@/components/common/BasicWidgets';
import PwdLevel from './PwdLevel/PwdLevel';
import BasicInfo from './BasicInfo/BasicInfo';
import PersonalPua from './PersonalPua/PersonalPua';
import SecuritySetting from './SecuritySetting/SecuritySetting';
import { logout } from '@/services/userCenter';
import { updateUser } from '@/services/userManager';
import { updatePassword } from '@/services/user';
import { fileRelationBusiness } from '@/services/fileManger';
import { getVariableValue } from '@/services/globalcenter';
import { BaseContext, URL_PREFIX } from '@/constants/global';
import { getCookie, RemoveCookie, setCookie, GetCookieDomain } from '@/utils/common';
import secret from '@/constants/secret';
import avatar from '@/assets/avatar.png';
import styles from './UserCenter.less';

@connect(state => ({
  userInfo: state.user.userInfo,
  personalPuaList: state.user.personalPuaList,
  avatarInfo: state.user.avatarInfo,
  mainPageConfig: state.global.mainPageConfig,
}))
class UserCenter extends Component {
  static contextType = BaseContext;
  state = {
    loadingSave: false, // 保存状态
    visible: false, // 编辑弹框是否可见
    avatarInfo: [], // 头像文件关联信息
  };
  // 切换面板
  handleChangeTab = (userCenterActiveTab) => {
    this.context.dispatch({
      type: 'global/updateMainPageConfig',
      payload: {
        item: {
          userCenterActiveTab,
        },
      },
    });
  };
  // 生成面板内容
  getTabContent = () => {
    const { userInfo = {}, personalPuaList } = this.props;
    const { passwordSecurityLevel = 0 } = userInfo;
    // 点击按钮事件
    const handleClickBtn = () => {
      this.props.updateWrapState({ visibleBrief: false });
      this.setState({ visible: true });
    };
    const contentObj = {};
    // 基本信息
    contentObj.basicInfo = (
      <div className={styles.basicInfo}>
        <p>
          <FormattedMessage id="userCenter.telephone"/>
          <span className={styles.mobile}>{userInfo.telephone}</span>
        </p>
        <p>
          <FormattedMessage id="userCenter.email"/>
          <span className={styles.email}>{userInfo.email}</span>
        </p>
        <p>
          <FormattedMessage id="userCenter.personalSignal"/>
          <span className={styles.email}>{userInfo.personalSignal}</span>
        </p>
        <CButton onClick={handleClickBtn}>
          <FormattedMessage id="userCenter.editBasicInfo"/>
        </CButton>
      </div>
    );
    // 个人资质
    contentObj.personalPua = (
      <div className={styles.personalPua}>
        <p>
          <FormattedMessage id="userCenter.personalPua"/>
        </p>
        <ul className={styles.puaList}>
          {personalPuaList.length ? personalPuaList.map(item => (
            <li key={item.id}>
              <div>
                <img src={item.url}/>
              </div>
            </li>
          )) : <FormattedMessage id="global.noData"/>}
        </ul>
        <CButton onClick={handleClickBtn}>
          <FormattedMessage id="userCenter.uploadPua"/>
        </CButton>
      </div>
    );
    // 安全设置
    contentObj.securitySetting = (
      <div className={styles.securitySetting}>
        <p>
          <FormattedMessage id="userCenter.pwdLevelText"/>
          <PwdLevel level={passwordSecurityLevel}/>
          <span className={styles[`level_${passwordSecurityLevel}`]}>
            <FormattedMessage id={`userCenter.pwdLevel.${passwordSecurityLevel}`}/>
          </span>
        </p>
        <p>
          <FormattedMessage id="userCenter.pwdSuggest"/>
        </p>
        <CButton onClick={handleClickBtn}>
          <FormattedMessage id="userCenter.editPwd"/>
        </CButton>
      </div>
    );
    return contentObj;
  };
  // 展示弹框内容
  getModalContent = () => {
    const { form, mainPageConfig } = this.props;
    const { userCenterActiveTab } = mainPageConfig;
    const publicProps = {
      form,
      updateState: this.updateState,
    };
    switch (userCenterActiveTab) {
      case 'basicInfo':
        return <BasicInfo {...publicProps} />;
      case 'personalPua':
        return <PersonalPua {...publicProps} />;
      default:
        return <SecuritySetting {...publicProps} />;
    }
  };
  // 保存
  handleSave = () => {
    const { userCenterActiveTab } = this.props.mainPageConfig;
    switch (userCenterActiveTab) {
      case 'basicInfo':
        this.handleSaveBasicInfo();
        break;
      case 'personalPua':
        this.handleSavePersonalPua();
        break;
      case 'securitySetting':
        this.handleUpdatePwd();
        break;
      default:
        return;
    }
  };
  // 保存基本信息
  handleSaveBasicInfo = () => {
    const { form, userInfo } = this.props;
    const { avatarInfo } = this.state;
    const { langLib } = this.context;
    form.validateFields((errs, values) => {
      if (errs) return;
      const params = {
        ...values,
        id: userInfo.id,
        picpath: avatarInfo.length ? avatarInfo[0].picpath : userInfo.picpath,
      };
      this.setState({ loadingSave: true });
      updateUser(params).then(res => {
        CMessage(langLib['message.save.success']);
        this.setState({ loadingSave: false, visible: false });
        // 更新用户信息
        this.updateUserInfo({
          ...userInfo,
          ...res,
        });
        // avatarInfo.length && fileRelationBusiness({ fileString: JSON.stringify(avatarInfo) }).then(() => {
        //   // 重新获取用户头像
        //   this.context.dispatch({
        //     type: 'user/getUserAvatar',
        //     payload: {
        //       userId: userInfo.id,
        //     },
        //   });
        // }, err => this.setState({ loadingSave: false }));
      }, err => this.setState({ loadingSave: false }));
    });
  };
  // 保存个人资质
  handleSavePersonalPua = () => {
    const { langLib } = this.context;
    const { userInfo, personalPuaList } = this.props;
    const afterSave = () => {
      this.setState({
        loadingSave: false,
        visible: false,
      });
      // 获取个人资质文件
      this.context.dispatch({
        type: 'user/getPersonalPua',
        payload: {
          userId: userInfo.id,
        },
      });
    };
    const unSavedList = personalPuaList.filter(item => item.shouldSave);
    if (!unSavedList.length) {
      afterSave();
      return;
    }
    fileRelationBusiness({ fileString: JSON.stringify(unSavedList) }).then(() => {
      CMessage(langLib['message.save.success']);
      afterSave();
    }, err => this.setState({ loadingSave: false }));
  };
  // 修改密码
  handleUpdatePwd = () => {
    const { form, userInfo } = this.props;
    const { langLib } = this.context;
    form.validateFields((errs, values) => {
      if (errs) return;
      this.setState({ loadingSave: true });
      let params = {};
      Object.keys(values).forEach(items => {
        params[items] = secret.encrypt(values[items]);
      });
      updatePassword(params).then(res => {
        CMessage(langLib['message.save.success']);
        this.setState({ loadingSave: false, visible: false });
        this.updateUserInfo({
          ...userInfo,
          passwordSecurityLevel: res.passwordSecurityLevel,
        });
      }, err => this.setState({ loadingSave: false }));
    });

  };
  // 更新用户信息
  updateUserInfo = (userInfo) => {
    this.context.dispatch({
      type: 'user/updateState',
      payload: { userInfo, avatarInfo: userInfo.picpath || avatar },
    });
    setCookie('eaminfo', encodeURIComponent(escape(JSON.stringify(userInfo))), 2);

  };
  // 登出
  handleLogout = () => {
    getVariableValue({ variableName: 'LoginOUTURL' }).then(res => {
      const token = getCookie('token');
      if (res) {
        logout({ token }).then(data => {
          // window.location.reload();
          setCookie('token', null, 0);
          setCookie('eaminfo', null, 0);
          localStorage.removeItem('ttt'); // 清除主题色
          localStorage.removeItem('sss'); // 清除系统url
          document.cookie = `token=null; max-age=0; domain=${GetCookieDomain()};path=/`;
          document.cookie = `eaminfo=null; max-age=0; domain=${GetCookieDomain()};path=/`;
          window.location.href = res;
        });
      } else {
        logout({ token }).then(res => {
          // window.location.reload();
          setCookie('token', '', 2);
          setCookie('eaminfo', '', 2);
          localStorage.removeItem('ttt'); // 清除主题色
          localStorage.removeItem('sss'); // 清除系统url
          // window.location.href = `${URL_PREFIX}/login`;
          router.push('/login');
        });
      }
    });
  };
  // 根据主页配置获取个人信息面板
  getTabList = () => {
    const { mainPageConfig } = this.props;
    const { basicData = {} } = mainPageConfig;
    const tabList = [];
    if (basicData.enabledAccountInformation) {
      tabList.push({
        key: 'basicInfo',
        tab: <FormattedMessage id="userCenter.basicInfo"/>,
      });
    }
    if (basicData.enabledPersonalQualification) {
      tabList.push({
        key: 'personalPua',
        tab: <FormattedMessage id="userCenter.personalPua"/>,
      });
    }
    if (basicData.enabledAccountSecuritySettings) {
      tabList.push({
        key: 'securitySetting',
        tab: <FormattedMessage id="userCenter.securitySetting"/>,
      });
    }
    return tabList;
  };
  updateState = itemObj => {
    this.setState(itemObj);
  };

  render() {
    const { visible, loadingSave } = this.state;
    const { userInfo, avatarInfo, mainPageConfig } = this.props;
    console.log(avatarInfo, 'avatarInfo');
    const { userCenterActiveTab } = mainPageConfig;
    const tabList = this.getTabList();
    const tabLength = tabList.length;
    const defaultTabKey = tabLength ? tabList[0].key : '';
    const tabCls = classNames({
      'custom-pageConfig-tabs': true,
      [styles.tabWrap]: true,
    });
    const contentObj = this.getTabContent();
    const modalProps = {
      visible,
      confirmLoading: loadingSave,
      title: <FormattedMessage id={`userCenter.modalTitle.${userCenterActiveTab}`}/>,
      onCancel: () => this.setState({ visible: false }),
      className: styles.modal,
      onOk: this.handleSave,
    };
    return (
      <div className={styles.wrap}>
        <div className={styles.nameWrap}>
          <div className={styles.avatar}>
            <img src={avatarInfo} alt="avatar"/>
          </div>
          <div>
            <p>{userInfo.username}</p>
            <span>
              <FormattedMessage id="userCenter.account"/>
              {userInfo.account}
            </span>
          </div>
        </div>
        <div className={styles.contentWrap}>
          <Card
            className={tabCls}
            bordered={false}
            tabList={tabList}
            activeTabKey={userCenterActiveTab}
            onTabChange={userCenterActiveTab => this.handleChangeTab(userCenterActiveTab)}
          >
            <div className={styles.content}>
              {contentObj[userCenterActiveTab]}
            </div>
          </Card>
        </div>
        <div className={styles.exitWrap} onClick={this.handleLogout}>
          <a className="custom-color">
            <FormattedMessage id="userCenter.exit"/>
          </a>
        </div>
        <CreateModal {...modalProps}>
          <Form>
            {this.getModalContent()}
          </Form>
        </CreateModal>
      </div>
    );
  }
}

export default Form.create()(UserCenter);
