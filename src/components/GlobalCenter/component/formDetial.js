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
import { FORM_VALID_RULES, VALID_REQUIRED_MESSAGE } from '@/constants/global';


class formConfig extends Component {
  state = {};
  setSelectedTablbeName = (selected) => {
    const { tableName } = selected[0];
    this.props.form.setFieldsValue({ tablename: tableName });
  };
  // 获取表单项配置
  getFormConfigs = () => {
    const { activeDetail = {}, activeTreeNodeDetail, actionType } = this.props;
    const publicProps = { disabled: true };
    const { groupId } = activeDetail;
    // 分割线 - 编码规则
    const ruleLine = {
      key: 'basicLine-base2',
      comType: 'statics',
      colSpan: 24,
      component: <SplitLine title={<FormattedMessage id="splitLine.title.basic"/>}/>,
    };

    // 编码
    const code = {
      key: 'keycode',
      colSpan: 12,
      label: <FormattedMessage id="global.keycode"/>,
      config: {
        initialValue: activeDetail && activeDetail.keycode || '',
      },
      component: (
        <CInput {...publicProps}/>
      ),
    };
    // 名称
    const name = {
      key: 'name',
      colSpan: 12,
      label: <FormattedMessage id="global.name"/>,
      config: {
        initialValue: activeDetail && activeDetail.name,
        rules: [FORM_VALID_RULES.noSpace],
      },
      component: (
        <CInput disabled={groupId === 3 ? true : false}/>
      ),
    };
    const table = {
      label: <FormattedMessage id="import.form.tablename"/>,
      colSpan: 12,
      key: 'tablename',
      config: {
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],
        initialValue: activeDetail && activeDetail.tablename || '',
      },
      component:
        <SearchSelect
          modalContentType="relateTable"
          showType="list"
          setSelected={(selected) => {
            this.setSelectedTablbeName(selected);
          }
          }
        />,
    };
    const VariableNaming = { // 变量名
      key: 'variableName',
      colSpan: 12,
      label: <FormattedMessage id="global.form.VariableNaming"/>,
      config: {
        initialValue: activeDetail && activeDetail.variableName || '',
        rules: [FORM_VALID_RULES.noSpace],
      },
      component: (
        <CInput disabled={groupId === 3 ? true : false}/>
      ),
    };
    const VariableValue = { // 变量值
      key: 'defaultValue',
      colSpan: 12,
      label: <FormattedMessage id="global.form.Value"/>,
      config: {
        initialValue: activeDetail && activeDetail.defaultValue || '',
        rules: [FORM_VALID_RULES.noSpace],
      },
      component: (
        <CInput/>
      ),
    };
    // 变量类型
    const basestate = {
      key: 'basestate',
      colSpan: 12,
      config: {
        initialValue: groupId === 3 ? 2 : 3,
      },
      component: (
        <CInput style={{ 'display': 'none' }}/>
      ),
    };
    let dataConfig = [ruleLine,
      code, name];
    if (actionType === 'addGroup' || actionType === 'editGroup' || !actionType) {
      dataConfig = dataConfig;
    } else {
      dataConfig.push(VariableNaming, VariableValue, basestate);
    }
    return [
      ...dataConfig,
    ];
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
