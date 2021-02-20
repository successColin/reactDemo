import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Select } from 'antd';
import { CInput, SearchSelect, SplitLine } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { BaseContext, VALID_REQUIRED_MESSAGE } from '@/constants/global';

const { Option } = Select;

let pickedColor = '';
const itemLayout = {
  labelCol: {
    sm: { span: 24 },
  },
  wrapperCol: {
    sm: { span: 24 },
  },
};

class settingConfig extends Component {
  static contextType = BaseContext;
  state = {
    visiblePageConfig: false,
    colorCode: '',
    activeDetail: {},
  };
  // 根据选择的关联表，带出字段、编码、名称等
  setRelateTables = selected => {
    const detial = selected[0] || {};
    let Obj = {};
    Object.keys(detial).forEach((item) => {
      Obj[item] = detial[item];
    });
    Obj.defaultframeName = detial.name;
    this.props.form.setFieldsValue(Obj);
    this.props.setDefaultframeId(Obj.id);
  };
  // 管理表
  setTableName = selected => {
    const { tableName } = selected[0] || {};
    this.props.form.setFieldsValue({
      tableName: tableName,
    });
  };
  // 修改颜色值
  handleSaveColor = (fromType, value) => {
    const color = pickedColor.hex;
    const { activeDetail, updateColor } = this.props;
    // 通过拾色器选色
    // let colorCode = activeDetail.colorCode ? `${activeDetail.colorCode},${color}` : color;
    let colorCode = color || '';
    // 输入框直接修改
    if (fromType === 'input') colorCode = value;
    this.setState({ visibleColorPicker: false });
    if (!color) return;
    let detail = activeDetail;
    detail.colorCode = colorCode;
    updateColor(detail);
  };

  getIconId = (selected) => {
    const { id, name } = selected[0] || {};
    this.props.form.setFieldsValue({ 'iconId': id, 'iconName': name });
  };
  getRelationTableName = (selected) => {
    const { tableName } = selected[0] || {};
    this.props.form.setFieldsValue({ 'relationTableName': tableName });
  };
  // 获取表单项配置
  getFormConfigs = () => {
    const {
      activeDetail = {},
      activeTreeNodeDetail = {},
      actionType,
      updateFrameState,
      isInitialData,
    } = this.props;
    const { isGroup } = activeTreeNodeDetail;
    let showGroup = isGroup;
    if (actionType === 'addElement') showGroup = false;
    const { basetype = 'select' } = activeDetail;
    // const publicProps = { disabled: isInitialData };
    const publicProps = {};
    const { colorCode } = activeDetail;
    const { visibleColorPicker } = this.state;
    // 分割线 - 基本属性
    const basicLine = {
      key: 'basicLine-base',
      comType: 'static',
      colSpan: 24,
      component: <SplitLine title={<FormattedMessage id="splitLine.title.basic"/>}/>,
    };
    // 基本信息

    let publicBasicConfig = [
      basicLine,
      // {
      //   key: 'keycode',
      //   colSpan: 12,
      //   label: <FormattedMessage id="element.keycode"/>,
      //   config: {
      //     initialValue: activeDetail.keycode || '',
      //   },
      //   component: <CInput/>,
      // },
      {
        key: 'name',
        colSpan: 12,
        label: <FormattedMessage id="element.name"/>,
        config: {
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }],
          initialValue: activeDetail.name || '',
          getValueFromEvent: event => event.target.value.replace(/\s+/g, ''),
        },
        component: <CInput {...publicProps} />,

      },{
        key: 'sno',
        colSpan: 12,
        label: <FormattedMessage id="menu.table.sno"/>,
        config: {
          initialValue: activeDetail.sno || '',
        },
        component: <CInput {...publicProps} />,

      },
    ];
    // 其他信息
    return publicBasicConfig;
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

export default settingConfig;
