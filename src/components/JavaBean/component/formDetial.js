/*
 * @Author: Fus
 * @Date:   2019-06-19 08:46:41
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-28 14:14:42
 * @Desc: 元素配置
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Select, Checkbox, DatePicker, Radio } from 'antd';
import moment from 'moment';
import { CTextArea, CSelect, CInput, SearchSelect, SplitLine } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { VALID_REQUIRED_MESSAGE, FORM_VALID_RULES } from '@/constants/global';

const { Option } = Select;
const dateFormat = 'YYYY-MM-DD HH:mm:ss';

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
    const { isGroup = true } = activeTreeNodeDetail;
    let showGroup = isGroup;
    if (actionType === 'addElement') showGroup = false;
    const publicProps = { disabled: activeDetail.isGroup };
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
          rules: [{
            required: actionType ? false : true,
            message: VALID_REQUIRED_MESSAGE,
          }, FORM_VALID_RULES.noSpace],
          initialValue: activeDetail.keycode || '',
        },
        component: <CInput disabled={true}/>,
      }, {
        key: showGroup ? 'name' : 'username',
        colSpan: 12,
        label: <FormattedMessage id="element.name"/>,
        config: {
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }, FORM_VALID_RULES.noSpace],
          initialValue: showGroup ? activeDetail.name : activeDetail.username,
        },
        component: <CInput {...publicProps} />,
      },
    ];

    let FormItemArr = [
      basicLine,
      {
        label: <FormattedMessage id="javaBean.modal.name"/>,
        component: <CInput/>,
        key: 'tableName',
        colSpan: 12,
        type: 1,
        config: {
          initialValue: activeDetail.tableName || '',
          rules: [
            {
              required: true,
              message: VALID_REQUIRED_MESSAGE,
            },
            {
              pattern: /^[a-z\d]+$/,
              message: '请输入50位以内的纯小写的英文字母,或者小写的英文字母加数字',
            },
          ],
        },
      }, {
        key: 'canInitialData',
        colon: false,
        label: <FormattedMessage id="javaBean.modal.istrue"/>,
        colSpan: 12,
        config: {
          initialValue: activeDetail.canInitialData || '',
        },
        component: (<Radio.Group>
          <Radio value={1}><FormattedMessage id="javaBean.modal.allow"/></Radio>
          <Radio value={0}><FormattedMessage id="javaBean.modal.unallow"/></Radio>
        </Radio.Group>),
      },
      {
        key: 'checkKeyCodeUnique',
        colon: false,
        label: <FormattedMessage id="javaBean.modal.checkKeyCodeUnique"/>,
        colSpan: 12,
        config: {
          initialValue: activeDetail.checkKeyCodeUnique || 1,
        },
        component: (<Radio.Group>
          <Radio value={1}><FormattedMessage id="javaBean.modal.allow"/></Radio>
          <Radio value={2}><FormattedMessage id="javaBean.modal.unallow"/></Radio>
        </Radio.Group>),
      },
      {
        key: 'logenable',
        colon: false,
        label: <FormattedMessage id="javaBean.modal.log"/>,
        colSpan: 24,
        config: {
          initialValue: activeDetail.logenable || 0,
        },
        component: (<Radio.Group>
          <Radio value={1}><FormattedMessage id="javaBean.modal.allow"/></Radio>
          <Radio value={0}><FormattedMessage id="javaBean.modal.unallow"/></Radio>
        </Radio.Group>),
      },
      {
        label: <FormattedMessage id="javaBean.modal.memo"/>,
        component: <CTextArea/>,
        colSpan: 24,
        key: 'memo',
        config: {
          initialValue: activeDetail.memo || '',
          rules: [FORM_VALID_RULES.noSpace],
        },
      },
    ];

    if (!showGroup) {
      if (actionType === 'editElement') {
        FormItemArr.splice(2, 1);
      }
      return [
        ...FormItemArr,
      ];
    } else {
      return [
        ...publicBasicConfig,
      ];
    }

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
