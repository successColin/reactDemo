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


class formConfig extends Component {
  state = {};
  setSelectedTablbeName = (selected) => {
    if (selected.length) {
      const { tableName } = selected[0];
      this.props.form.setFieldsValue({ tablename: tableName });
    } else {
      this.props.form.setFieldsValue({ tablename: '' });
    }
  };
  // 获取表单项配置
  getFormConfigs = () => {
    const { activeDetail, activeTreeNodeDetail, actionType } = this.props;
    const publicProps = { disabled: true };
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
        initialValue: activeDetail.keycode || '',
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
        initialValue: activeDetail.name,
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],
      },
      component: (
        <CInput/>
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
        initialValue: activeDetail.tablename || '',
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
    let dataConfig = [ruleLine,
      code, name];
    if (actionType === 'addGroup' || actionType === 'editGroup' || !actionType) {
      dataConfig = dataConfig;
    } else {
      dataConfig.push(table);
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
