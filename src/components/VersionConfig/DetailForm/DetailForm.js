/*
 * @Author: Fus
 * @Date:   2020-02-07 10:18:18
 * @Desc: 版本详情
 */
import { Component } from 'react';
import moment from 'moment';
import { FormattedMessage } from 'react-intl';
import { CInput, CTextArea, CDatePicker } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { VALID_REQUIRED_MESSAGE } from '@/constants/global';

class DetailForm extends Component {
  getFormConfigs = () => {
    const { activeDetail = {} } = this.props;
    const { upgradeTime } = activeDetail;
    return [{
      key: 'keycode',
      label: <FormattedMessage id="global.keycode" />,
      config: {
        initialValue: activeDetail.keycode,
      },
      colSpan: 12,
      component: <CInput />,
    }, {
      key: 'name',
      label: <FormattedMessage id="versionConfig.version.name" />,
      config: {
        initialValue: activeDetail.name,
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],
      },
      colSpan: 12,
      component: <CInput />,
      rules: [{
        required: true,
        message: VALID_REQUIRED_MESSAGE,
      }],
    }, {
      key: 'version',
      label: <FormattedMessage id="versionConfig.version.version" />,
      config: {
        initialValue: activeDetail.version,
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],
      },
      colSpan: 12,
      component: <CInput />,
    }, {
      key: 'upgradeTime',
      label: <FormattedMessage id="versionConfig.version.upgradeTime" />,
      config: {
        initialValue: upgradeTime ? moment(upgradeTime) : '',
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],
      },
      colSpan: 12,
      component: <CDatePicker />,
    }, {
      key: 'memo',
      label: <FormattedMessage id="global.memo" />,
      config: {
        initialValue: activeDetail.memo,
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],
      },
      colSpan: 24,
      component: <CTextArea autosize={{ minRows: 6 }} />,
    }];
  }
  render() {
    const { form, loadingGetDetail } = this.props;
    return (
      <div style={{ marginTop: 20 }}>
        <FormItems
          formConfigs={this.getFormConfigs()}
          form={form}
          loading={loadingGetDetail}
        />
      </div>
    );
  }
}
export default DetailForm;