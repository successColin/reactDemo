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
import { CTextArea, CSelect, CInput, SearchSelect, SplitLine } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { VALID_REQUIRED_MESSAGE } from '@/constants/global';

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
  state = {};
  // 获取表单项配置
  getFormConfigs = () => {
    const {
      activeDetail,
      activeTreeNodeDetail = {},
      actionType,
      updateFrameState,
    } = this.props.tabDefaultConfig;
    const { isGroup } = activeTreeNodeDetail;
    let showGroup = isGroup;
    if (actionType === 'addElement') showGroup = false;
    // console.log(activeTreeNodeDetail,2323)
    const publicProps = { disabled: activeDetail.isGroup };
    // 描述
    const colMemo = {
      key: 'memo',
      colSpan: 24,
      label: <FormattedMessage id="element.memo"/>,
      config: {
        initialValue: activeDetail.memo,
      },
      component: <CTextArea {...publicProps} />,

    };
    // 分割线 - 基本属性
    const basicLine = {
      key: 'basicLine-base',
      comType: 'static',
      colSpan: 24,
      component: <SplitLine title={<FormattedMessage id="splitLine.title.basic"/>}/>,
    };
    // 元素的基本信息
    const publicBasicConfig = [
      basicLine, {
        key: 'keycode',
        colSpan: 12,
        label: <FormattedMessage id="element.keycode"/>,
        config: {
          initialValue: activeDetail.keycode || '',
        },
        component: <CInput disabled={true}/>,
      }, {
        key: 'name',
        colSpan: 12,
        label: <FormattedMessage id="element.name"/>,
        config: {
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }],
          initialValue: activeDetail.name || '',
        },
        component: <CInput {...publicProps} />,

      }, {
        key: 'basetype',
        colSpan: 12,
        label: <FormattedMessage id="element.basetype"/>,
        config: {
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }],
          initialValue: activeDetail.basetype || activeTreeNodeDetail.baseType,
        },
        component: (
          <CSelect style={{ 'width': '100%' }} disabled={true}>
            {baseTypeOption}
          </CSelect>
        ),
      }, colMemo,
    ];
    let dataConfig = [];
    return [
      ...publicBasicConfig,
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

// const formConfigDetial = Form.create({})(formConfig);
export default formConfig;
;
