/**
 *@author jwk
 *@2019/9/6 0006
 *@Description 预检测和导入表单
 */

import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Checkbox, InputNumber, Radio } from 'antd';
import { CTextArea, CSelect, CInput, SearchSelect, SplitLine } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { VALID_REQUIRED_MESSAGE } from '@/constants/global';


class formConfig extends Component {
  state = {};
  // 获取表单项配置
  getFormConfigs = () => {
    const { activeDetail, type } = this.props;
    const publicProps = { disabled: true };
    const layout = {
      labelCol: {
        sm: { span: 2 },
      },
      wrapperCol: {
        sm: { span: 22 },
      },
    };

    // 数据格式检测
    const code = {
      key: 'code',
      colSpan: 24,
      config: {
        initialValue: '',
      },
      component: (
        <Checkbox style={{ 'marginLeft': '53px' }}><FormattedMessage id="import.modal.checkbox"/></Checkbox>
      ),
    };
    // 数据值及逻辑检测
    const code1 = {
      key: 'code1',
      colSpan: 24,
      config: {
        initialValue: '',
      },
      component: (
        <Checkbox style={{ 'marginLeft': '53px' }}><FormattedMessage id="import.modal.number"/></Checkbox>
      ),
    };
    // 起始行
    const name = {
      key: 'startLen',
      colSpan: 7,
      label: <FormattedMessage id="import.modal.start"/>,
      config: {
        initialValue: 2,
      },
      component: (
        <InputNumber min={2}/>
      ),
    };
    console.log(this.props.endRow,3);
    // 终止行
    const name1 = {
      key: 'endLen',
      colSpan: 7,
      label: <FormattedMessage id="import.modal.end"/>,
      config: {
        initialValue: this.props.endRow || '',
      },
      component: (
        <CInput/>
      ),
    };
    const radio = {
      key: 'updateOrSkip',
      colSpan: 24,
      config: {
        initialValue: 2,
      },
      component: (
        <Radio.Group style={{ 'marginLeft': '53px' }}>
          <Radio value={1}>
            <FormattedMessage id="import.modal.break"/>
          </Radio><br/>
          <Radio value={2}>
            <FormattedMessage id="import.modal.update"/>
          </Radio>
          {/* <Radio value={3}> */}
          {/*  <FormattedMessage id="import.modal.common"/> */}
          {/* </Radio> */}
        </Radio.Group>
      ),
    };

    let dataConfig;
    if (type === 'preview') {
      dataConfig = [code, code1, name, name1];
    } else {
      dataConfig = [radio, name, name1];
    }

    return [
      ...dataConfig,
    ];
  };

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

export default formConfig;
;
