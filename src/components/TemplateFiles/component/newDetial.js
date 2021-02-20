import React, { Component } from 'react';
import { Form, Radio, Select } from 'antd';
import { FormattedMessage } from 'react-intl';
import FormItems from '@/components/common/FormItems/FormItems';
import { CInput, SearchSelect, SplitLine, CSelect, CMessage } from '@/components/common/BasicWidgets';
import { VALID_REQUIRED_MESSAGE,BaseContext } from '@/constants/global';
import Styles from '../TemplateFiles.less';

import FormConfigDetial from '@/components/TemplateFiles/component/formDetial';

const { Option } = Select;

class ModalDetial extends Component {
  static contextType = BaseContext;
  constructor(props) {
    super();
    this.state = {
      relationTableName: '', // 关联表
      isShow: false,
      activeDetail: props.detial || {},
      arr: [], // 实体表字段
    };
  }


  /**
   * 设置关联表
   * @param selected
   */
  setSelectedTablbeName = (selected) => {
    if (selected.length) {
      const { tableName } = selected[0];
      this.props.form.setFieldsValue({ relationTableName: tableName });
      this.setState({
        relationTableName: tableName,
      });
    } else {
      this.props.form.setFieldsValue({ relationTableName: '' });
      this.setState({
        relationTableName: '',
      });
    }

  };
  /**
   * 设置关联字段
   * @param selected
   */
  relationColumnName = (selected) => {
    if (selected.length) {
      const { columnName } = selected[0];
      this.props.form.setFieldsValue({ relationColumnName: columnName });
    } else {
      this.props.form.setFieldsValue({ relationColumnName: '' });
    }
  };
  /**
   * 设置列名
   * @param selected
   */
  relationRowName = (selected) => {
    const { dataSource } = this.props;
    const { langLib } = this.context;
    if (selected.length) {
      const { columnName } = selected[0];
      let obj = dataSource.find(item => item.keycode === columnName);
      if (obj && obj.keycode) {
        CMessage(langLib['messge.error.keycode'](obj.keycode), 'error');
        return;
      }
      this.props.form.setFieldsValue({ keycode: columnName });
    } else {
      this.props.form.setFieldsValue({ keycode: '' });
    }
  };
  /**
   * 时间联动
   * @param val
   */
  changeColumnType = (val) => {
    const { activeDetail } = this.state;
    this.setState({
      activeDetail: { ...activeDetail, columnType: val },
    });
  };

  // 获取表单项配置
  getFormConfigs = () => {
    let activeDetail = this.state.activeDetail || {};
    const { tablename } = this.props.activeDetail || {};
    // 列名
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
            pattern: /^[A-Za-z0-9]{1,50}$/,
            message: '由50位以内的英文字母数字组成',
          },
        ],
      },
      component: (
        <SearchSelect
          modalContentType="relationColumnName"
          showType="list"
          setSelected={(selected = []) => this.relationRowName(selected)}
          otherQueryParams={{ tableName: tablename }}
          selectConfig={{ keyName: 'columnName' }}
        />
      ),
    };
    // 名称
    const name = {
      key: 'name',
      colSpan: 12,
      label: <FormattedMessage id="global.name"/>,
      config: {
        initialValue: activeDetail.name,
        rules: [
          {
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          },
        ],
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
        // rules: [{
        //   required: true,
        //   message: VALID_REQUIRED_MESSAGE,
        // }],
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
        // rules: [{
        //   required: true,
        //   message: VALID_REQUIRED_MESSAGE,
        // }],
        initialValue: activeDetail.relationColumnName || '',
      },
      component:
        <SearchSelect
          modalContentType="relationColumnName"
          showType="list"
          setSelected={(selected = []) => this.relationColumnName(selected)}
          otherQueryParams={{ tableName: this.state.relationTableName || activeDetail.relationTableName }}
          selectConfig={{ keyName: 'columnName' }}
        />,
    };
    const require = {
      label: <FormattedMessage id="global.required"/>,
      colSpan: 12,
      key: 'notNull',
      config: {
        initialValue: activeDetail.notNull || 0,
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
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],
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
        initialValue: activeDetail.columnFormat || 1,
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
    if (activeDetail.columnType === 3) {
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
