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
import { CTextArea, CSelect, CInput, SearchSelect, SplitLine } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { VALID_REQUIRED_MESSAGE } from '@/constants/global';


class formConfig extends Component {
  state = {};

  // 获取表单项配置
  getFormConfigs = () => {
    const { activeDetail } = this.props;
    // 编码
    const code = {
      key: 'keycode',
      colSpan: 12,
      label: <FormattedMessage id="global.keycode"/>,
      config: {
        initialValue: activeDetail.keycode || '',
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
    const name = {
      key: 'name',
      colSpan: 12,
      label: <FormattedMessage id="global.name"/>,
      config: {
        initialValue: activeDetail.name || '',
      },
      component: (
        <CInput/>
      ),
    };
    // 名称
    const id = {
      key: 'id',
      colSpan: 12,
      label: '',
      config: {
        initialValue: activeDetail.id || '',
      },
      component: (
        <CInput style={{ 'display': 'none' }}/>
      ),
    };
    let dataConfig = [code, name,id];
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
