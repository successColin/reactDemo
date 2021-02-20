import React, { Component } from 'react';
import CModal from '../common/CreateModal/CreateModal';
import { connect } from 'dva';
import * as Server from '../../services/javaBean';
import { updateJavaBeanFiled, addJavaBeanFiled, insertJavaBean, updateJavaBean } from '../../services/javaBean';
import { Form, Row, Col, Input, Button, Radio, Select, InputNumber } from 'antd';
import { FormattedMessage } from 'react-intl';
import { CTextArea, CInput, SearchSelect, CSelect } from '@/components/common/BasicWidgets';
import { CMessage } from '@/components/common/BasicWidgets';
import { BaseContext, VALID_REQUIRED_MESSAGE, FORM_VALID_RULES } from '@/constants/global';
import { IGNORE_FORM_ITEM } from '@/constants/element';

const { Option } = Select;

const FieldTypeArr = [
  {
    name: 'int',
    value: 2,
  },
  {
    name: 'varchar',
    value: 1,
  },
  {
    name: 'datetime',
    value: 3,
  },
  {
    name: 'decimal',
    value: 4,
  },
  {
    name: 'text',
    value: 5,
  },
  {
    name: 'blob',
    value: 6,
  },
  {
    name: 'tinyint   ',
    value: 7,
  },
];

const FieldType = FieldTypeArr.map((item, index) => <Option key={index} value={item.value}>{item.name}</Option>);

@connect(state => ({
  functionData: state.tabs.activeTabData.functionData,
  userInfo: state.user.userInfo,
}))
class DetialModalm extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      type: '', // 判断是否是新增还是修改
      record: '',
      recordRow: {},
      dataSoucre: [],
      loading: false,
      disabled: false, // 是否能点击
      relus: [],
      length: 0,
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.type !== nextContext.type) {
      this.setState({
        type: nextProps.type,
        record: nextProps.record,
        recordRow: nextProps.recordRow,
        dataSoucre: nextProps.dataSoucre,
      });
    }
  }

  /**
   * 单条插入
   * @param params
   */
  insertJavaBeanList = (params, callback) => {
    const { langLib } = this.context;
    insertJavaBean(params).then(() => {
      CMessage(langLib['message.save.success']);
      if (callback) {
        callback();
      }
    }, err => {
      if (callback) {
        callback();
      }
    });
  };
  /**
   * 修改表
   * @param params
   * @param callback
   */
  updateJavaBeanList = (params, callback) => {
    const { langLib } = this.context;
    let { record } = this.state;
    let oldData = { 'oldTableName': record.tableName };
    let data = Object.assign({}, oldData, params);
    updateJavaBean(data).then((res) => {
      CMessage(langLib['message.save.success']);
      if (callback) {
        callback();
      }
    }, err => {
      if (callback) {
        callback();
      }
    });

  };
  /**
   * 添加表字段
   * @param params
   * @param callback
   */
  addFields = (params, callback) => {
    const { langLib } = this.context;
    addJavaBeanFiled(params).then(res => {
      CMessage(langLib['message.save.success']);
      if (callback) {
        callback();
      }
    }, err => {
      if (callback) {
        callback();
      }
    });
  };
  /**
   * 选择数据类型进行级联
   * @param e
   */
  changeVal = (val, data) => {
    const { updateState } = this.props;
    let columnLength = '';
    if (val === 5 || val === 3 || val === 6) {
      columnLength = 0;
    } else if (val === 2 || val === 7) {
      columnLength = '';
    } else if (val === 1) {
      columnLength = '';
    }
    this.props.form.resetFields(['columnLength']);
    updateState({
      recordRow: {
        ...data,
        columnType: val,
        columnLength,
      },
    });
  };
  getLengthProperty = (val) => {
    let disabled = false, length = 0;
    if (val === 5 || val === 3 || val === 6) {
      disabled = true;
      length = 0;
    } else if (val === 2 || val === 7) {
      disabled = false;
      length = 255;
    } else if (val === 1) {
      disabled = false;
      length = 21845;
    } else if (val === 4) {
      disabled = false;
      length = 88888;
    }
    return {
      disabled,
      length,
    };
  };

  chooseRadio = (e) => {
    if (e.target.value === 1) {
      this.props.form.setFieldsValue({ empty: 2 });
      this.setState({
        relus: [
          {
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          },
        ],
      });
    } else {
      this.props.form.setFieldsValue({ empty: '' });
      this.setState({
        relus: [
          {
            required: false,
            message: VALID_REQUIRED_MESSAGE,
          },
        ],
      });
    }
  };

  /**
   * 编辑表字段
   * @param params
   * @param callback
   */
  updateJavaBeanFiled = (params, callback) => {
    updateJavaBeanFiled(params).then(res => {
      if (callback) {
        callback();
      }
    }, err => {
      if (callback) {
        callback();
      }
    });
  };


  handleSubmit = () => {
    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      let type = this.state.type;
      this.setState({
        loading: true,
      });
      if (type === 'tableName_add') {

        this.insertJavaBeanList(fieldsValue, () => {
          this.props.changeVisible(false);
          this.setState({
            loading: false,
          });
        });
      } else if (type === 'tableName_edit') {
        this.updateJavaBeanList(fieldsValue, () => {
          this.setState({
            loading: false,
          });
          this.props.changeVisible(false);
        });
      } else if (type === 'tableField') {
        const { dataSoucre } = this.state;
        const { recordRow } = this.props;
        let data = Object.assign({}, { sno: dataSoucre.length + 1 }, recordRow, fieldsValue);
        this.addFields(data, () => {
          this.setState({
            loading: false,
            length: 0,
            disabled: false,
          });
          this.props.changeVisible(false, 'tableField');
        });
      } else if (type === 'tableField_edit') {
        let obj = { oldColumnName: this.state.recordRow.columnName };
        let data = Object.assign({}, obj, this.state.recordRow, fieldsValue);
        this.updateJavaBeanFiled(data, () => {
          this.setState({
            loading: false,
            length: 0,
            disabled: false,
          });
          this.props.changeVisible(false, 'tableField');
        });

      }
      this.props.form.resetFields();
    });
  };
  /**
   * 表字段
   * @param data
   * @returns {any[]}
   */
  getTableField = (data = {}) => {
    const { langLib } = this.context;
    const { getFieldDecorator } = this.props.form;
    let FormItemArr = [
      {
        label: <FormattedMessage id="javaBean.modal.common"/>,
        component: <CSelect>
          <Option value={1} key={1}><FormattedMessage id="javaBean.select.common"/></Option>
          <Option value={2} key={2}><FormattedMessage id="javaBean.select.password"/></Option>
          <Option value={3} key={3}><FormattedMessage id="javaBean.select.phone"/></Option>
          <Option value={4} key={4}><FormattedMessage id="javaBean.select.ip"/></Option>
          <Option value={5} key={5}><FormattedMessage id="javaBean.select.code"/></Option>
          <Option value={6} key={6}><FormattedMessage id="javaBean.select.email"/></Option>
        </CSelect>,
        key: 'columnRule',
        config: {
          initialValue: data.columnRule || 1,
        },
      },
      {
        label: <FormattedMessage id="javaBean.modal.desc"/>,
        component: <CInput/>,
        key: 'displayColumn',
        config: {
          initialValue: data.displayColumn || '',
          rules: [
            {
              required: true,
              message: VALID_REQUIRED_MESSAGE,
            },
            {
              pattern: /^.{1,200}$/,
              message: langLib['content.length'],
            },
            {
              pattern: /^[^\s]*$/,
              message: langLib['No.spaces'],
            },
          ],
        },
      },
      {
        label: <FormattedMessage id="javaBean.modal.columnName"/>,
        component: <CInput/>,
        key: 'columnName',
        config: {
          initialValue: data.columnName || '',
          rules: [
            {
              required: true,
              message: VALID_REQUIRED_MESSAGE,
            },
            {
              pattern: /^[A-Za-z0-9]{1,50}$/,
              message: langLib['javaBean.form.require'],
            },
          ],
        },
      },
      {
        label: <FormattedMessage id="global.required"/>,
        component: <Radio.Group onChange={(e) => {
          this.chooseRadio(e);
        }}>
          <Radio value={1}><FormattedMessage id="global.yes"/></Radio>
          <Radio value={2}><FormattedMessage id="global.no"/></Radio>
        </Radio.Group>,
        key: 'requisite',
        config: {
          initialValue: data.requisite || 2,
        },
      },
      {
        label: <FormattedMessage id="javaBean.modal.columnType"/>,
        component: <CSelect onChange={(e) => {
          this.changeVal(e, data);
        }}>
          {FieldType}
        </CSelect>,
        key: 'columnType',
        config: {
          initialValue: data.columnType,
          rules: [
            {
              required: true,
              message: VALID_REQUIRED_MESSAGE,
            },
          ],
        },
      },
    ];
    let columnLength = {
      label: <FormattedMessage id="javaBean.modal.columnLength"/>,
      component: <InputNumber max={this.getLengthProperty(data.columnType).length} style={{ 'width': '100%' }}
                              disabled={this.getLengthProperty(data.columnType).disabled}/>,
      key: 'columnLength',
      config: {
        initialValue: data.columnLength,
        rules: [
          {
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          },
          {
            pattern: /^\d{1,255}$/,
            message: langLib['javaBean.form.isNumber'],
          },
        ],
      },
    };
    if (data.columnType !== 4) {
      FormItemArr.push(columnLength);
    }
    return FormItemArr.map((item, index) => {
      const formItemLayout = item.type ? {
        labelCol: { span: 3 },
        wrapperCol: { span: 19 },
      } : {
        labelCol: { span: 6 },
        wrapperCol: { span: 15 },
      };
      return (<Col style={{ 'height': '40px' }} span={12} key={`1_${index}`}>
        <Form.Item {...formItemLayout} label={item.label} key={index}>
          {getFieldDecorator(item.key, {
            initialValue: item.config.initialValue,
            rules: item.config.rules,
          })(item.component)}
        </Form.Item></Col>);
    });
  };
  /**
   * 实体类
   * @param data
   * @returns {any[]}
   */
  getTableName = (data = {}) => {
    const { getFieldDecorator } = this.props.form;
    const { langLib } = this.context;
    let FormItemArr = [
      {
        label: <FormattedMessage id="javaBean.modal.name"/>,
        component: <CInput/>,
        key: 'tableName',
        colSpan: 12,
        type: 1,
        config: {
          initialValue: data.tableName || '',
          rules: [
            {
              required: true,
              message: VALID_REQUIRED_MESSAGE,
            },
            {
              pattern: /^[a-z]{1,50}$/,
              message: langLib['由50位以内的英文字母数字组成'],
            },
          ],
        },
      },
      , {
        key: 'canInitialData',
        colon: false,
        label: <FormattedMessage id="javaBean.modal.istrue"/>,
        colSpan: 24,
        config: {
          initialValue: data.canInitialData || '',
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
          initialValue: data.memo || '',
          rules: [FORM_VALID_RULES.noSpace],
        },
      },
    ];
    if (JSON.stringify(data) !== '{}') {
      FormItemArr.splice(2, 1);
    }
    return FormItemArr.map((item, index) => {
      const formItemLayout = item.type ? {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
      } : {
        labelCol: { span: 3 },
        wrapperCol: { span: 19 },
      };
      return (<Col style={{ 'height': '40px' }} span={item.colSpan} key={`1_${index}`}>
        <Form.Item {...formItemLayout} label={item.label} key={index}>
          {getFieldDecorator(item.key, {
            initialValue: item.config.initialValue,
            rules: item.config.rules,
          })(item.component)}
        </Form.Item></Col>);
    });
  };
  handleCancel = () => {
    this.props.form.resetFields();
    this.setState({
      length: 21845,
      disabled: false,
    });
    this.props.onCancel();
  };

  render() {
    const { visible, onCancel, title, okText, record, type, recordRow, userInfo } = this.props;
    const { loading } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (<CModal
      title={title}
      size="default"
      visible={visible}
      onCancel={() => this.handleCancel()}
      destroyOnClose={true}
      onOk={() => this.handleSubmit()}
    >
      {visible ? <Form style={{ 'paddingTop': '40px' }}>
        <Row>
          {type === 'tableName_add' ? this.getTableName() : ''}
          {type === 'tableName_edit' ? this.getTableName(record) : ''}
          {type === 'tableField' ? this.getTableField(recordRow) : ''}
          {type === 'tableField_edit' ? this.getTableField(recordRow) : ''}
        </Row>
      </Form> : null}
    </CModal>);
  }
};

const DetialModal = Form.create({})(DetialModalm);
export default DetialModal;
