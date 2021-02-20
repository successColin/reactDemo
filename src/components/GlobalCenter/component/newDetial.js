import React, { Component } from 'react';
import { Form, Radio, Select } from 'antd';
import { FormattedMessage } from 'react-intl';
import FormItems from '@/components/common/FormItems/FormItems';
import { CInput, SearchSelect, SplitLine } from '@/components/common/BasicWidgets';
import { VALID_REQUIRED_MESSAGE, FORM_VALID_RULES } from '@/constants/global';
import Styles from '../GlobalCenter.less';

const { Option } = Select;

class ModalDetial extends Component {
  constructor(porps) {
    super();
    this.state = {
      relationTableName: '', // 关联表
      isShow: false,
    };
  }

  /**
   * 设置关联表
   * @param selected
   */
  setSelectedTablbeName = (selected) => {
    const { tableName } = selected[0];
    this.props.form.setFieldsValue({ relationTableName: tableName });
    this.setState({
      relationTableName: tableName,
    });
  };
  /**
   * 设置关联字段
   * @param selected
   */
  relationColumnName = (selected) => {
    const { columnName } = selected[0];
    this.props.form.setFieldsValue({ relationColumnName: columnName });
  };
  /**
   * 时间联动
   * @param val
   */
  changeColumnType = (val) => {
    this.setState({
      isShow: val === 3 ? true : false,
    });
  };

  // 获取表单项配置
  getFormConfigs = () => {
    let activeDetail = this.props.detial || {};
    // 编码
    const code = {
      key: 'keycode',
      colSpan: 12,
      label: <FormattedMessage id="import.form.row"/>,
      config: {
        initialValue: activeDetail.keycode || '',
        rules: [
          {
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          },
          {
            pattern: /^[a-z]+$/,
            message: '只能是纯小写的英文字母',
          },
        ],
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
        initialValue: activeDetail.name,
        rules: [FORM_VALID_RULES.noSpace],
      },
      component: (
        <CInput/>
      ),
    };
    const table = {
      label: <FormattedMessage id="import.form.tabname"/>,
      colSpan: 12,
      key: 'relationTableName',
      config: {
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }, FORM_VALID_RULES.noSpace],
        initialValue: activeDetail.relationTableName || '',
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
    const relationColumnName = {
      label: <FormattedMessage id="import.form.tabnamefield"/>,
      colSpan: 12,
      key: 'relationColumnName',
      config: {
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        },],
        initialValue: activeDetail.relationColumnName || '',
      },
      component:
        <SearchSelect
          modalContentType="relationColumnName"
          showType="list"
          setSelected={(selected = []) => this.relationColumnName(selected)}
          otherQueryParams={{ tableName: this.state.relationTableName }}
        />,
    };
    const require = {
      label: <FormattedMessage id="global.required"/>,
      colSpan: 12,
      key: 'notNull',
      config: {
        initialValue: activeDetail.notNull,
      },
      component:
        <Radio.Group>
          <Radio value={1}><FormattedMessage id="global.yes"/></Radio>
          <Radio value={0}><FormattedMessage id="global.no"/></Radio>
        </Radio.Group>,
    };
    const columnType = {
      label: <FormattedMessage id="javaBean.right.dataType"/>,
      colSpan: 12,
      key: 'columnType',
      config: {
        initialValue: activeDetail.columnType || 1,
      },
      component:
        <Select onChange={e => {
          this.changeColumnType(e);
        }}>
          <Option value={1} key={1}><FormattedMessage id="global.varchar"/></Option>
          <Option value={2} key={2}><FormattedMessage id="global.numerical"/></Option>
          <Option value={3} key={3}><FormattedMessage id="global.date"/></Option>
        </Select>,
    };
    const columnLength = {
      key: 'columnLength',
      colSpan: 12,
      label: <FormattedMessage id="javaBean.modal.columnLength"/>,
      config: {
        initialValue: activeDetail.columnLength,
      },
      component: (
        <CInput/>
      ),
    };
    const columnFormat = {
      key: 'columnFormat',
      colSpan: 12,
      label: <FormattedMessage id="global.format"/>,
      config: {
        initialValue: activeDetail.columnFormat,
      },
      component: (
        <Select>
          <Option value={1} key={1}>YYYY-MM-DD hh:mm:ss</Option>
          <Option value={2} key={2}>YYYY-MM-DD </Option>
          <Option value={3} key={3}>hh:mm:ss</Option>
        </Select>
      ),
    };
    let dataConfig = [name, code, table, relationColumnName, require, columnType, columnLength];
    if (this.state.isShow || activeDetail.columnType === 3) {
      dataConfig.push(columnFormat);
    }
    return [
      ...dataConfig,
    ];
  };

  render() {
    const { form } = this.props;
    return (<div className={Styles.modalForm}>
      <FormItems
        formConfigs={this.getFormConfigs()}
        form={form}
        loading={false}
      />
    </div>);
  }
}

export default Form.create()(ModalDetial);
