/*
 * @Author: Fus
 * @Date:   2019-09-23 15:13:26
 * @Desc: 修改密码
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { Row, Col, Input } from 'antd';
import FormItems from '@/components/common/FormItems/FormItems';
import { BaseContext, VALID_REQUIRED_MESSAGE, FORM_VALID_RULES } from '@/constants/global';

@connect(state => ({
  userInfo: state.user.userInfo,
}))
class SecuritySetting extends Component {
  static contextType = BaseContext;
  validPwd = (rule, value, callback) => {
    const newPwd = this.props.form.getFieldValue('newPassWord');
    if (newPwd !== value) {
      callback(<FormattedMessage id="validPwd.checkDiff"/>);
      return;
    }
    callback();
  };
  getFormConfigs = () => {
    const { langLib } = this.context;
    return [{
      key: 'oldPassWord',
      label: <FormattedMessage id="userCenter.oldPassWord"/>,
      colSpan: 24,
      config: {
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }, {
          min: 4,
          message: <FormattedMessage id="validPwd.minLength"/>,
        }],
      },
      component: <Input.Password placeholder={langLib['userCenter.placeholder.oldPwd']}/>,
    }, {
      key: 'newPassWord',
      label: <FormattedMessage id="userCenter.newPassWord"/>,
      colSpan: 24,
      config: {
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        },
          // {
          //   pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#%_*])[\da-zA-Z~!@#%_*]{8,}$/,
          //   message: <FormattedMessage id="validPwd.pattern"/>,
          // },
        ],
      },
      component: <Input.Password placeholder={langLib['userCenter.placeholder.newPwd']}/>,
    }, {
      key: 'checkPassWord',
      label: <FormattedMessage id="userCenter.newPassWord"/>,
      colSpan: 24,
      config: {
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        },
        //   {
        //   pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[~!@#%_*])[\da-zA-Z~!@#%_*]{8,}$/,
        //   message: <FormattedMessage id="validPwd.pattern"/>,
        // },
          {
          validator: this.validPwd,
        }],
      },
      component: <Input.Password placeholder={langLib['userCenter.placeholder.checkNewPwd']}/>,
    }];
  };

  render() {
    const { form } = this.props;
    return (
      <div>
        <Row>
          <Col span={12}>
            <FormItems
              formConfigs={this.getFormConfigs()}
              loading={false}
              form={form}
            />
          </Col>
        </Row>
      </div>
    );
  }
}

export default SecuritySetting;
