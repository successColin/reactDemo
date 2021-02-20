/*
 * @Author: jwk
 * @Date:   2020-03-17 11:46:41
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-10 11:56:29
 * @Desc: 元素配置
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Select, Checkbox } from 'antd';
import { BaseContext } from '@/constants/global';
import { CTextArea, CSelect, CInput, SearchSelect, SplitLine } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { VALID_REQUIRED_MESSAGE } from '@/constants/global';


class formConfig extends Component {
  static contextType = BaseContext;
  state = {};

  // 获取表单项配置
  getFormConfigs = () => {
    const { activeDetail } = this.props;
    // 编码
    const code = {
      key: 'beanName',
      colSpan: 12,
      label: <FormattedMessage id="tasks.form.beanName"/>,
      config: {
        initialValue: activeDetail.beanName || '',
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],
      },
      component: (
        <CInput/>
      ),
    };
    // 名称
    const cronExpression = {
      key: 'cronExpression',
      colSpan: 12,
      label: <FormattedMessage id="tasks.form.cronExpression"/>,
      config: {
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],
        initialValue: activeDetail.cronExpression || '',
      },
      component: (
        <CInput/>
      ),
    };
    const methodName = {
      key: 'methodName',
      colSpan: 12,
      label: <FormattedMessage id="tasks.form.methodName"/>,
      config: {
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }, {
          pattern: /^[a-z]+$/,
          message: '只能是纯小写的英文字母',
        }],
        initialValue: activeDetail.methodName || '',
      },
      component: (
        <CInput/>
      ),
    };
    const name = {
      key: 'name',
      colSpan: 12,
      label: <FormattedMessage id="tasks.form.name"/>,
      config: {
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],
        initialValue: activeDetail.name || '',
      },
      component: (
        <CInput/>
      ),
    };
    const remark = {
      key: 'remark',
      colSpan: 12,
      label: <FormattedMessage id="tasks.form.remark"/>,
      config: {
        rules: [{
          required: false,
          message: VALID_REQUIRED_MESSAGE,
        }],
        initialValue: activeDetail.remark || '',
      },
      component: (
        <CInput/>
      ),
    };

    let dataConfig = [code, cronExpression, methodName, name, remark];
    return dataConfig;
  };

  render() {
    const { form, loading } = this.props;
    return (
      <FormItems
        formConfigs={this.getFormConfigs()}
        form={form}
        loading={loading}
      />
    );
  }
}

export default formConfig;
;
