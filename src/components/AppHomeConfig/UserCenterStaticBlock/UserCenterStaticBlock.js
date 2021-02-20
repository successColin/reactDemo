/*
 * @Author: Fus
 * @Date:   2020-05-14 11:07:57
 * @Desc: 个人中心固定模块
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Form, Radio } from 'antd';
import { connect } from 'dva';
import { CButton, CMessage } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { APP_SHOW_TYPE, APP_SHOW_TYPE_MAP } from '@/constants/pageConfig';
import { getAppUserCenterStaticConfig, saveAppUserCenterStaticConfig } from '@/services/appLibrary';
import { BaseContext } from '@/constants/global';
import styles from './UserCenterStaticBlock.less';

const itemLayout = {
  labelCol: {
    sm: { span: 24 },
  },
  wrapperCol: {
    sm: { span: 24 },
  },
};

// 是否显示的下拉项
const showOptions = APP_SHOW_TYPE.map(item => <Radio key={`show_${item}`} value={APP_SHOW_TYPE_MAP[item]}><FormattedMessage id={item} /></Radio>);

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
}))
class UserCenterStaticBlock extends Component {
  static contextType = BaseContext
  state = {
    loading: false, // 保存加载中状态
    configData: {}, // 配置数据
  }
  componentDidMount () {
    this.fetchData();
  }
  fetchData = () => {
    this.setState({ loading: true });
    getAppUserCenterStaticConfig().then(configData => {
      this.setState({ configData, loading: false });
    }, err => this.setState({ loading: false }));
  }
  handleSave = () => {
    const { langLib } = this.context;
    this.props.form.validateFields((errs, values) => {
      if (errs) return;
      const { configData } = this.state;
      const params = {
        ...configData,
        ...values,
      };
      this.setState({ loadingSave: true });
      saveAppUserCenterStaticConfig(params).then(res => {
        CMessage(langLib['message.save.success']);
        this.setState({ loadingSave: false });
        this.fetchData();
      }, err => this.setState({ loadingSave: false }));
    });
  }
  getFormConfigs = () => {
    const { configData } = this.state;
    return [{
      key: 'enabledAppAccountInfo',
      label: <FormattedMessage id="appHomeConfig.staticBlock.enabledAppAccountInfo" />,
      config: {
        initialValue: configData.enabledAppAccountInfo,
      },
      colSpan: 24,
      itemLayout,
      component: (
        <Radio.Group>
          {showOptions}
        </Radio.Group>
      ),
    }, {
      key: 'enabledAppPersonal',
      label: <FormattedMessage id="appHomeConfig.staticBlock.enabledAppPersonal" />,
      config: {
        initialValue: configData.enabledAppPersonal,
      },
      colSpan: 24,
      itemLayout,
      component: (
        <Radio.Group>
          {showOptions}
        </Radio.Group>
      ),
    }, {
      key: 'enabledAppAccount',
      label: <FormattedMessage id="appHomeConfig.staticBlock.enabledAppAccount" />,
      config: {
        initialValue: configData.enabledAppAccount,
      },
      colSpan: 24,
      itemLayout,
      component: (
        <Radio.Group>
          {showOptions}
        </Radio.Group>
      ),
    }, {
      key: 'enabledAppSystemVersion',
      label: <FormattedMessage id="appHomeConfig.staticBlock.enabledAppSystemVersion" />,
      config: {
        initialValue: configData.enabledAppSystemVersion,
      },
      colSpan: 24,
      itemLayout,
      component: (
        <Radio.Group>
          {showOptions}
        </Radio.Group>
      ),
    }, {
      key: 'enabledMyQRCode',
      label: <FormattedMessage id="appHomeConfig.staticBlock.code" />,
      config: {
        initialValue: configData.enabledMyQRCode,
      },
      colSpan: 24,
      itemLayout,
      component: (
        <Radio.Group>
          {showOptions}
        </Radio.Group>
      ),
    }, {
      key: 'enabledFeedback',
      label: <FormattedMessage id="appHomeConfig.staticBlock.feedback" />,
      config: {
        initialValue: configData.enabledFeedback,
      },
      colSpan: 24,
      itemLayout,
      component: (
        <Radio.Group>
          {showOptions}
        </Radio.Group>
      ),
    }, {
      key: 'enabledClearCache',
      label: <FormattedMessage id="appHomeConfig.staticBlock.clearCache" />,
      config: {
        initialValue: configData.enabledClearCache,
      },
      colSpan: 24,
      itemLayout,
      component: (
        <Radio.Group>
          {showOptions}
        </Radio.Group>
      ),
    }, {
      key: 'enabledLogout',
      label: <FormattedMessage id="appHomeConfig.staticBlock.logout" />,
      config: {
        initialValue: configData.enabledLogout,
      },
      colSpan: 24,
      itemLayout,
      component: (
        <Radio.Group>
          {showOptions}
        </Radio.Group>
      ),
    }, {
      key: 'enabledAppThirdPartyLinks',
      label: <FormattedMessage id="appHomeConfig.staticBlock.enabledAppThirdPartyLinks" />,
      config: {
        initialValue: configData.enabledAppThirdPartyLinks,
      },
      colSpan: 24,
      itemLayout,
      component: (
        <Radio.Group>
          {showOptions}
        </Radio.Group>
      ),
    }, {
      key: 'enabledAppLanguage',
      label: <FormattedMessage id="appHomeConfig.staticBlock.enabledAppLanguage" />,
      config: {
        initialValue: configData.enabledAppLanguage,
      },
      colSpan: 24,
      itemLayout,
      component: (
        <Radio.Group>
          {showOptions}
        </Radio.Group>
      ),
    }];
  }
  render () {
    const { loading, loadingSave } = this.state;
    const { form, functionData } = this.props;
    const { canmodify } = functionData.attributes;
    return (
      <div className={styles.wrap}>
        <div className={styles.content}>
          <p className={styles.tit}>
            <div className={styles.titBox}><FormattedMessage id="appHomeConfig.staticBlock.title" /></div>
          </p>
          <div className={styles.formWrap}>
            <FormItems
              formConfigs={this.getFormConfigs()}
              form={form}
              loading={loading}
            />
          </div>
        </div>
        <div className={styles.footer}>
          {canmodify ? <CButton type="primary" onClick={() => this.handleSave()} loading={loadingSave}>
            <FormattedMessage id="global.save" />
          </CButton> : null}
        </div>
      </div>
    );
  }
}

export default Form.create()(UserCenterStaticBlock);
