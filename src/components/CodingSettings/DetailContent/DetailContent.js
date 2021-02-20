import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Select, Checkbox, Radio } from 'antd';
import { CTextArea, CSelect, CInput, SearchSelect, SplitLine } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { VALID_REQUIRED_MESSAGE, BaseContext } from '@/constants/global';

const { Option } = Select;

class settingConfig extends Component {
  static contextType = BaseContext;
  state = {};
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
  setTableName = (value, key) => {
    const { activeDetail, updateFrameState } = this.props;
    updateFrameState({
      activeDetail: {
        ...activeDetail,
        [key]: value,
      },
    });
    // this.props.form.setFieldsValue({
    //   tableName: tableName,
    // });
  };
  // 获取表单项配置
  getFormConfigs = () => {
    const {
      activeDetail: data = {},
      activeTreeNodeDetail = {},
      actionType,
      updateFrameState,
      isInitialData,
    } = this.props;
    const { langLib } = this.context;
    const { isGroup } = activeTreeNodeDetail;
    let showGroup = isGroup;
    if (actionType === 'addElement') showGroup = false;
    const { basetype = 'select' } = data;
    const publicProps = { disabled: isInitialData };
    // 分割线 - 基本属性
    const basicLine = {
      key: 'basicLine-base',
      comType: 'static',
      colSpan: 24,
      component: <SplitLine title={<FormattedMessage id="splitLine.title.basic"/>}/>,
    };
    // 分割线 - 编码规则
    const ruleLine = {
      key: 'basicLine-base2',
      comType: 'statics',
      colSpan: 24,
      component: <SplitLine title={<FormattedMessage id="code.form.seting"/>}/>,
    };
    // 基本信息
    const publicBasicConfig = [
      basicLine, {
        key: 'keycode',
        colSpan: 12,
        label: <FormattedMessage id="code.form.codekey"/>,
        config: {
          initialValue: data.keycode || '',
        },
        component: <CInput disabled={true}/>,
      }, {
        key: 'name',
        colSpan: 12,
        label: <FormattedMessage id="code.form.name"/>,
        config: {
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }, {
            pattern: /^[^\s]*$/,
            message: langLib['No.spaces'],
          }],
          initialValue: data.name || '',
        },
        component: (
          <CInput/>
        ),
      },
    ];
    // 实体表
    const javaBean = {
      key: 'tableName',
      label: <FormattedMessage id="settingForm.mainTableName"/>,
      colSpan: 12,
      config: {
        initialValue: data.tableName || '',
        rules: [
          {
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          },
        ],
      },
      component: (
        <SearchSelect
          showType="list"
          modalContentType="relateTable"
          setSelected={(selected) => this.setTableName(selected.length ? selected[0].tableName : '', 'tableName')}
        />
      ),
    };
    // 编码类型
    const keycodeType = {
      key: 'codeType',
      label: <FormattedMessage id="code.form.codetype"/>,
      colSpan: 12,
      config: {
        initialValue: data.codeType || 1,
      },
      component: (
        <CSelect>
          <Option key={1} value={1}><FormattedMessage id="code.form.select"/></Option>
        </CSelect>
      ),
    };
    // 字段名称
    const columnsName = {
      key: 'columnsName',
      label: <FormattedMessage id="code.form.condition"/>,
      colSpan: 6,
      config: {
        initialValue: data.columnsName || 'typeid',
        rules: [
          {
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          },
          {
            pattern: /^[A-Za-z0-9]{1,50}$/,
            message: '由50位以内的英文字母数字组成',
          },
        ],
      },
      component: (
        <SearchSelect
          modalContentType="tableColumn"
          showType="list"
          otherQueryParams={{ tableName: data.tableName }}
          selectConfig={{
            isMulti: false,
            keyName: 'columnName',
          }}
          setSelected={(selected) => this.setTableName(selected.length ? selected[0].columnName : 'typeid', 'columnsName')}
        />
      ),
    };
    // 比较符
    const diff = {
      key: 'compare',
      colSpan: 3,
      config: {
        initialValue: data.compare || 1,
      },
      component: (
        <CSelect>
          <Option key={1} value={1}>=</Option>
        </CSelect>
      ),
    };
    // 条件值
    const columnsValue = {
      key: 'columnsValue',
      colSpan: 3,
      config: {
        initialValue: data.columnsValue || '',
        rules: [
          {
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }, {
            pattern: /^[^\s]*$/,
            message: langLib['No.spaces'],
          },
        ],
      },
      component: (
        <CInput/>
      ),
    };
    // 当前流水
    const current = {
      label: <FormattedMessage id="code.form.current"/>,
      key: 'currentCodeNumber',
      colSpan: 12,
      config: {
        initialValue: data.currentCodeNumber || '',
      },
      component: (
        <CInput disabled={true}/>
      ),
    };
    // 编码
    const codeType = {
      key: 'code1Key',
      colSpan: 12,
      label: <FormattedMessage id="code.form.fruit"/>,
      config: {
        initialValue: data.code1Key || '',
        rules: [
          {
            pattern: /^[^\s]*$/,
            message: langLib['No.spaces'],
          },
        ],
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
        rules: [
          {
            pattern: /^[^\s]*$/,
            message: langLib['No.spaces'],
          },
        ],
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
        rules: [
          {
            pattern: /^[^\s]*$/,
            message: langLib['No.spaces'],
          },
        ],
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
        rules: [
          {
            pattern: /^[^\s]*$/,
            message: langLib['No.spaces'],
          },
        ],
      },
      component: (
        <CInput/>
      ),
    };
    // 编码
    const code4Key = {
      key: 'code4Key',
      colSpan: 12,
      label: <FormattedMessage id="code.form.fruit"/>,
      config: {
        initialValue: data.code4Key || '',
        rules: [
          {
            pattern: /^[^\s]*$/,
            message: langLib['No.spaces'],
          },
        ],
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
        rules: [
          {
            pattern: /^[^\s]*$/,
            message: langLib['No.spaces'],
          },
        ],
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
        initialValue: data.serialNumberLength || '',
        rules: [
          {
            pattern: /^[^\s]*$/,
            message: langLib['No.spaces'],
          },
        ],
      },
      component: (
        <CInput/>
      ),
    };
    // 流水默认值
    const inintLength1 = {
      key: 'initialNumber',
      label: <FormattedMessage id="code.form.init"/>,
      colSpan: 6,
      config: {
        initialValue: data.initialNumber || '',
        rules: [
          {
            pattern: /^[^\s]*$/,
            message: langLib['No.spaces'],
          },
        ],
      },
      component: (
        <CInput/>
      ),
    };

    if (!showGroup) {
      publicBasicConfig.push(javaBean, keycodeType, columnsName, diff, columnsValue, current);
    }
    // 其他信息
    let propConfig = showGroup ? [] : [
      ruleLine,
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
    ];
    return [
      ...publicBasicConfig,
      ...propConfig,
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

export default settingConfig;
