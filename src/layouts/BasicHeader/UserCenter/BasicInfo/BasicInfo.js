/*
 * @Author: Fus
 * @Date:   2019-09-23 15:13:26
 * @Desc: 修改个人信息
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { Row, Col } from 'antd';
import FormItems from '@/components/common/FormItems/FormItems';
import { CInput, CUpload, CTextArea } from '@/components/common/BasicWidgets';
import { FORM_VALID_RULES } from '@/constants/global';
import styles from './BasicInfo.less';
import avatar from '@/assets/avatar.png';

@connect(state => ({
  userInfo: state.user.userInfo,
  avatarInfo: state.user.avatarInfo,
}))
class BasicInfo extends Component {
  // 更新头像信息
  updateAvatar = (mainId) => {
    const { userInfo } = this.props;
    const avatarInfo = [{
      relationId: userInfo.id,
      relationTableName: 'user',
      relationTypeId: 1,
      picpath: mainId,
      basetype: 2,
    }];
    this.props.updateState({ avatarInfo });
  };
  getFormConfigs = () => {
    const { userInfo, avatarInfo } = this.props;
    return [{
      key: 'avatar',
      label: <FormattedMessage id="userCenter.editAvatar"/>,
      config: {
        initialValue: userInfo.avatar,
      },
      colSpan: 24,
      component: (
        <div>
          <CUpload
            className={styles.avatarUpload}
            fromType="avatar"
            accept=".jpg, .jpeg, .png"
            multiple={false}
            showUploadList={false}
            needFetchDetail={false}
            relationParams={{
              relationId: userInfo.id,
              relationTableName: 'user',
              relationTypeId: 1,
            }}
            setFileInfo={this.updateAvatar}
          >
            <img src={userInfo.picpath || avatar} alt="avatar"/>
          </CUpload>
          <span className={styles.tip}>
            <FormattedMessage id="avatar.upload.tip"/>
          </span>
        </div>
      ),
    }, {
      key: 'telephone',
      label: <FormattedMessage id="userCenter.telephone"/>,
      config: {
        initialValue: userInfo.telephone,
        // rules: [FORM_VALID_RULES.telephone],
      },
      colSpan: 13,
      component: <CInput/>,
    }, {
      key: 'email',
      label: <FormattedMessage id="userCenter.email"/>,
      config: {
        initialValue: userInfo.email,
        // rules: [FORM_VALID_RULES.email],
      },
      colSpan: 13,
      component: <CInput/>,
    }, {
      key: 'personalSignal',
      label: <FormattedMessage id="userCenter.personalSignal"/>,
      config: {
        initialValue: userInfo.personalSignal,
      },
      colSpan: 20,
      component: <CTextArea autosize={{ minRows: 4 }} maxLength={200}/>,
    }];
  };

  render() {
    const { form } = this.props;
    return (
      <div>
        <FormItems
          formConfigs={this.getFormConfigs()}
          loading={false}
          form={form}
        />
      </div>
    );
  }
}

export default BasicInfo;
