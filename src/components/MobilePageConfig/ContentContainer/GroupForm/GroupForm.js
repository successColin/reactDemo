/*
 * @Author: Fus
 * @Date:   2019-08-09 08:39:03
 * @Last Modified by: Fus
 * @Last Modified time: 2019-09-05 09:39:01
 * @Desc: 树节点为组的详情表单
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { CInput, SplitLine } from '@/components/common/BasicWidgets';
import { VALID_REQUIRED_MESSAGE } from '@/constants/global';
import FormItems from '@/components/common/FormItems/FormItems';

class GroupForm extends Component {
  getFormConfigs = () => {
    const { activeDetail = {}, isInitialData } = this.props;
    return [
      {
        key: 'basicLine-base',
        comType: 'static',
        colSpan: 24,
        component: <SplitLine title={<FormattedMessage id="splitLine.title.basic" />} />,
      }, {
        key: 'keycode',
        label: <FormattedMessage id="global.keycode" />,
        config: {
          initialValue: activeDetail.keycode,
        },
        component: <CInput disabled={true} allowClear={false} />,
      }, {
        key: 'name',
        label: <FormattedMessage id="global.name" />,
        config: {
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }],
          initialValue: activeDetail.name,
        },
        component: <CInput disabled={isInitialData} />,
      },
    ];
  }
  render() {
    const { form } = this.props;
    return (
      <FormItems
        formConfigs={this.getFormConfigs()}
        form={form}
        loading={false}
      />
    );
  }
}
export default GroupForm;