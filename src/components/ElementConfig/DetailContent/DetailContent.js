/*
 * @Author: Fus
 * @Date:   2019-06-19 08:46:41
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-10-09 09:10:25
 * @Desc: 元素配置
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Select, Checkbox } from 'antd';
import { CTextArea, CSelect, CInput, SearchSelect, SplitLine } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { VALID_REQUIRED_MESSAGE } from '@/constants/global';
import { ELEMENT_TYPE, ELEMENT_CONFIG_TYPE, TIME_FORMATE_TYPES } from '@/constants/element';

const { Option } = Select;

// 元素类型下拉选项
const elementTypeOptions = Object.keys(ELEMENT_TYPE).map(item => <Option key={`elementType-${item}`} value={item}><FormattedMessage id={ELEMENT_TYPE[item]} /></Option>);

// 日期选择框下拉项
const timeFormateTypesOption = Object.keys(TIME_FORMATE_TYPES).map(item => <Option key={`timeFormat-${item}`} value={+item}><FormattedMessage id={TIME_FORMATE_TYPES[item]} /></Option>);

class ElementConfig extends Component {
  state = {
  }
  // 根据选择的关联表，带出字段、编码、名称等
  setRelateTables = selected => {
    const { tableName = '' } = selected[0] || {};
    this.props.form.setFieldsValue({
      tableName,
    });
  }
  // 显示图标名
  setIcon = selected => {
    const { id } = selected[0] || {};
    this.props.form.setFieldsValue({
      iconId: id,
    });
  }
  // 获取表单项配置
  getFormConfigs = () => {
    const {
      activeDetail: data = {},
      activeTreeNodeDetail = {},
      actionType,
      updateFrameState,
      isInitialData,
    } = this.props;
    const { isGroup } = activeTreeNodeDetail;
    let showGroup = isGroup;
    if (actionType === 'addElement') showGroup = false;
    const { basetype } = data;
    const publicProps = { disabled: isInitialData };
    // 关联表
    const colTableName = {
      key: 'tableName',
      label: <FormattedMessage id="element.tablename" />,
      config: {
        initialValue: data.tableName,
      },
      component: (
        <SearchSelect
          {...publicProps}
          modalContentType="relateTable"
          showType="list"
          setSelected={this.setRelateTables}
        />
      ),
    };
    // 描述
    const colMemo = {
      key: 'memo',
      colSpan: 24,
      label: <FormattedMessage id="element.memo" />,
      config: {
        initialValue: data.memo,
      },
      component: <CTextArea {...publicProps} />,
    };
    // 分割线 - 基本属性
    const basicLine = {
      key: 'basicLine-base',
      comType: 'static',
      colSpan: 24,
      component: <SplitLine title={<FormattedMessage id="splitLine.title.basic" />} />,
    };
    // 分割线 - 数据属性
    const colDataLine = {
      key: 'basicLine-data',
      comType: 'static',
      colSpan: 24,
      component: <SplitLine title={<FormattedMessage id="splitLine.title.dataProps" />} />,
    };
    // 分割线 - 元素属性
    const belongLine = {
      key: 'basicLine-props',
      comType: 'static',
      colSpan: 24,
      component: <SplitLine title={<FormattedMessage id="splitLine.title.belongProps" />} />,
    };
    // 展示元素组的基本信息（编辑、新增）
    if (showGroup) {
      return [
        basicLine, {
          key: 'keycode',
          label: <FormattedMessage id="global.keycode" />,
          config: {
            initialValue: data.keycode,
          },
          component: <CInput disabled={true} />,
        }, {
          key: 'name',
          label: <FormattedMessage id="global.name" />,
          config: {
            rules: [{
              required: true,
              message: VALID_REQUIRED_MESSAGE,
            }],
            initialValue: data.name,
          },
          component: <CInput {...publicProps} />,
        },
      ];
    }
    // 元素的基本信息
    const publicBasicConfig = [
      basicLine, {
        key: 'keycode',
        label: <FormattedMessage id="element.keycode" />,
        config: {
          initialValue: data.keycode,
        },
        component: <CInput disabled={true} />,
      }, {
        key: 'name',
        label: <FormattedMessage id="element.name" />,
        config: {
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }],
          initialValue: data.name,
        },
        component: <CInput {...publicProps} />,
      }, {
        key: 'basetype',
        label: <FormattedMessage id="element.basetype" />,
        config: {
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }],
          initialValue: `${data.basetype || ''}`,
        },
        component: (
          <CSelect {...publicProps} onChange={basetype => updateFrameState({ activeDetail: { ...data, basetype: +basetype } })}>
            {elementTypeOptions}
          </CSelect>
        ),
      },
    ];
    // 基础信息中有图标的控件
    if (ELEMENT_CONFIG_TYPE.hasIcon.includes(basetype)) {
      publicBasicConfig.push({
        key: 'iconId',
        label: <FormattedMessage id="element.icon" />,
        config: {
          initialValue: data.iconId,
        },
        component: (
          <SearchSelect
            {...publicProps}
            modalContentType="icon"
            showType="icon"
            setSelected={this.setIcon}
          />
        ),
      });
    }
    // 日期选择显示【格式】
    if (basetype === 9) {
      publicBasicConfig.push({
        key: 'elementFormat',
        label: <FormattedMessage id="element.elementFormat" />,
        config: {
          initialValue: data.elementFormat,
        },
        component: (
          <CSelect>
            {timeFormateTypesOption}
          </CSelect>
        ),
      });
    }
    let dataConfig = [];
    // 数据属性中配置全部都有的控件
    if (ELEMENT_CONFIG_TYPE.full.includes(basetype)) {
      dataConfig = [
        colDataLine, colTableName, {
          key: 'columnId',
          label: <FormattedMessage id="element.columnId" />,
          config: {
            initialValue: data.columnId || 'id',
          },
          component: <CInput disabled={true} />,
        }, {
          key: 'columnCode',
          label: <FormattedMessage id="element.columnCode" />,
          config: {
            initialValue: data.columnCode || 'keycode',
          },
          component: <CInput disabled={true} />,
        }, {
          key: 'columnName',
          label: <FormattedMessage id="element.columnName" />,
          config: {
            initialValue: data.columnName || 'name',
          },
          component: <CInput disabled={true} />,
        }, colMemo,
      ];
    } else if (ELEMENT_CONFIG_TYPE.tableAndMemo.includes(basetype)) {
      // 只有关联表和描述
      dataConfig = [
        colDataLine,
        colTableName,
        colMemo,
      ];
    } else if (ELEMENT_CONFIG_TYPE.onlyMemo.includes(basetype)) {
      // 只有描述
      dataConfig = [colDataLine, colMemo];
    }
    // 元素属性
    const propConfig = [
      belongLine, {
        key: 'isPC',
        colon: false,
        label: <FormattedMessage id="global.empty" />,
        config: {
          initialValue: data.elementType === 11 || data.elementType === 1,
          valuePropName: 'checked',
        },
        component: <Checkbox {...publicProps}><FormattedMessage id="element.isPC" /></Checkbox>,
      }, {
        key: 'PCstyle',
        label: <FormattedMessage id="global.style" />,
        config: {
          initialValue: '', // @TODO: 样式待后续开发， pc和app的样式都拼接在一个参数中
        },
        component: (
          <CSelect {...publicProps}>
            <Option value=""><FormattedMessage id="global.style.default" /></Option>
          </CSelect>
        ),
      }, {
        key: 'isAPP',
        colon: false,
        label: <FormattedMessage id="global.empty" />,
        config: {
          initialValue: data.elementType === 11 || data.elementType === 10,
          valuePropName: 'checked',
        },
        component: <Checkbox {...publicProps}><FormattedMessage id="element.isAPP" /></Checkbox>,
      }, {
        key: 'APPstyle',
        label: <FormattedMessage id="global.style" />,
        config: {
          initialValue: '', // @TODO: 样式待后续开发， pc和app的样式都拼接在一个参数中
        },
        component: (
          <CSelect {...publicProps}>
            <Option value=""><FormattedMessage id="global.style.default" /></Option>
          </CSelect>
        ),
      },
    ];
    return [
      ...publicBasicConfig,
      ...dataConfig,
      ...propConfig,
    ];
  }
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

export default ElementConfig;