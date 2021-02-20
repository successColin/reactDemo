/*
 * @Author: Fus
 * @Date:   2019-09-07 09:30:49
 * @Last Modified by: Fus
 * @Last Modified time: 2019-09-07 09:57:49
 * @Desc: bundle组的详情表单
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { CInput, SplitLine } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';

class GroupForm extends Component {
  // 生成表单项
  getFormItems = () => {
    const { activeDetail = {} } = this.props;
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
        component: <CInput disabled={true} />,
      }, {
        key: 'name',
        label: <FormattedMessage id="global.name" />,
        config: {
          initialValue: activeDetail.name,
        },
        component: <CInput />,
      },
    ];
  }
  render() {
    const { form } = this.props;
    return (
      <div>
        <FormItems
          formConfigs={this.getFormItems()}
          form={form}
          loading={false}
        />
      </div>
    );
  }
}

export default GroupForm;