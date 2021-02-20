/*
 * @Author: Fus
 * @Date:   2019-06-19 08:46:41
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-10 11:56:29
 * @Desc: 元素配置
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Select, Checkbox } from 'antd';
import { CTextArea, CSelect, CInput, SearchSelect, SplitLine, CInputNumber } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { VALID_REQUIRED_MESSAGE, BaseContext } from '@/constants/global';

const { Option } = Select;
const selectArr = [{
  name: <FormattedMessage id="role.tab.function"/>,
  value: 1,
},
  {
    name: <FormattedMessage id="role.tab.data"/>,
    value: 2,
  }];
const baseTypeOption = selectArr.map(item => <Option value={item.value} key={item.value}>{item.name}</Option>);

class formConfig extends Component {
  static contextType = BaseContext;
  state = {};
  // 获取表单项配置
  getFormConfigs = () => {
    const { data } = this.props.tabDefaultConfig;
    const publicProps = { disabled: false };
    const { langLib } = this.context;

    // 分割线 - 编码规则
    const ruleLine = {
      key: 'basicLine-base2',
      comType: 'statics',
      colSpan: 24,
      component: <SplitLine title={<FormattedMessage id="code.form.seting"/>}/>,
    };

    // 编码
    const codeType = {
      key: 'code1Key',
      colSpan: 12,
      label: <FormattedMessage id="code.form.fruit"/>,
      config: {
        initialValue: data.code1Key || '',
        rules: [{
          pattern: /^[^\s]*$/,
          message: langLib['No.spaces'],
        }],
      },
      component: (
        <CInput/>
      ),
    };
    // 分隔符1
    const break1Key = {
      key: 'break1Key',
      colSpan: 12,
      label: <FormattedMessage id="code.form.split"/>,
      config: {
        initialValue: data.break1Key || '',
        rules: [{
          pattern: /^[^\s]*$/,
          message: langLib['No.spaces'],
        }],
      },
      component: (
        <CInput/>
      ),
    };
    // 编码2
    const code2Key = {
      key: 'code2Key',
      colSpan: 12,
      label: <FormattedMessage id="code.form.fruit"/>,
      config: {
        initialValue: data.code2Key || '',
      },
      component: (
        <CSelect>
          <Option key={0} value=""><FormattedMessage id="global.null"/></Option>
          <Option key={1} value="1"><FormattedMessage id="code.form.org"/></Option>
          <Option key={2} value="2"><FormattedMessage id="code.form.compony"/></Option>
        </CSelect>
      ),
    };
    // 分隔符2
    const break2Key = {
      key: 'break2Key',
      colSpan: 12,
      label: <FormattedMessage id="code.form.split"/>,
      config: {
        initialValue: data.break2Key || '',
        rules: [{
          pattern: /^[^\s]*$/,
          message: langLib['No.spaces'],
        }],
      },
      component: (
        <CInput/>
      ),
    };
    // 编码3
    const code3Key = {
      key: 'code3Key',
      colSpan: 12,
      label: <FormattedMessage id="code.form.fruit"/>,
      config: {
        initialValue: data.code3Key,
      },
      component: (
        <CSelect>
          <Option key={0} value=""><FormattedMessage id="global.null"/></Option>
          <Option key={1} value={'yyyy-MM-dd HH:mm:ss'}><FormattedMessage id="code.form.date1"/></Option>
          <Option key={2} value={'yyyy-MM-dd'}><FormattedMessage id="code.form.date2"/></Option>
          <Option key={3} value={'HH:mm:ss'}><FormattedMessage id="code.form.date3"/></Option>
        </CSelect>
      ),
    };
    // 分隔符3
    const break3Key = {
      key: 'break3Key',
      label: <FormattedMessage id="code.form.split"/>,
      colSpan: 12,
      config: {
        initialValue: data.break3Key || '',
        rules: [{
          pattern: /^[^\s]*$/,
          message: langLib['No.spaces'],
        }],
      },
      component: (
        <CInput/>
      ),
    };
    // 编码
    const code4Key = {
      key: 'code4Key',
      label: <FormattedMessage id="code.form.fruit"/>,
      colSpan: 12,
      config: {
        initialValue: data.code4Key || '',
        rules: [{
          pattern: /^[^\s]*$/,
          message: langLib['No.spaces'],
        }],
      },
      component: (
        <CInput/>
      ),
    };
    // 分隔符4
    const break4Key = {
      key: 'break4Key',
      label: <FormattedMessage id="code.form.split"/>,
      colSpan: 12,
      config: {
        initialValue: data.break4Key || '',
        rules: [{
          pattern: /^[^\s]*$/,
          message: langLib['No.spaces'],
        }],
      },
      component: (
        <CInput/>
      ),
    };
    // 流水长度
    const inintLength = {
      key: 'serialNumberLength',
      label: <FormattedMessage id="code.form.length"/>,
      colSpan: 6,
      config: {
        initialValue: data.serialNumberLength,
        rules: [{
          pattern: /^[^\s]*$/,
          message: langLib['No.spaces'],
        }],
      },
      component: (
        <CInputNumber/>
      ),
    };
    // 流水默认值
    const inintLength1 = {
      key: 'initialNumber',
      label: <FormattedMessage id="code.form.init"/>,
      colSpan: 6,
      config: {
        initialValue: data.initialNumber,
        rules: [{
          pattern: /^[^\s]*$/,
          message: langLib['No.spaces'],
        }],
      },
      component: (
        <CInputNumber/>
      ),
    };
    // 流水默认值
    const currentLength1 = {
      key: 'currentCodeNumber',
      label: <FormattedMessage id="code.form.current"/>,
      colSpan: 12,
      config: {
        initialValue: data.currentCodeNumber || '',
      },
      component: (
        <CInput disabled={true}/>
      ),
    };
    let dataConfig = [ruleLine,
      codeType,
      break1Key,
      code2Key,
      break2Key,
      code3Key,
      break3Key,
      code4Key,
      break4Key,
      inintLength,
      inintLength1,
      currentLength1];
    return [
      ...dataConfig,
    ];
  };

  render() {
    const { loading, form } = this.props.tabDefaultConfig;
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
