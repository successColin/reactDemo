import React, { Component } from 'react';
import CModal from '../common/CreateModal/CreateModal';
import * as Server from '../../services/menuManager';
import { Form, Row, Col, Input, Button, Select } from 'antd';
import { FormattedMessage } from 'react-intl';
import { CTextArea, CInput, SearchSelect, CSelect } from '@/components/common/BasicWidgets';

const { Search } = Input;
const { Option } = Select;


class DetialModalm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      type: '', // 判断是否是新增还是修改
      record: props.record,
      loading: false,
      optionArr: [], // 界面类型列表
    };
  }

  componentWillReceiveProps(nextProps, nextContext) {
    if (nextProps.type !== this.state.type) {
      this.setState({
        type: nextProps.type,
        record: nextProps.record,
        loading: nextProps.loading,
      });
    }
  }

  /**
   * 单条插入菜单库
   * @param params
   */
  insertMenuList = (params) => {
    Server.insertMenu(params);
  };
  updateMenuList = (params) => {
    let { record } = this.state;
    let data = Object.assign({}, record, params);
    Server.updateRecord(data);
  };

  /**
   * 设置图标id
   * @param selected
   */
  getIconId = (selected) => {
    const { id } = selected[0] || {};
    this.props.form.setFieldsValue({ 'iconId': id });
  };
  handleSubmit = () => {

    this.props.form.validateFields((err, fieldsValue) => {
      if (err) {
        return;
      }
      this.setState({
        loading: true,
      });
      // Should format date value before submit.
      this.props.changeVisible(false, () => {
        console.log(this.state.type, 'this.state.type');
        if (this.state.type === 'add') {
          this.setState({
            loading: false,
          });
          this.insertMenuList(fieldsValue);
        } else {
          this.setState({
            loading: false,
          });
          this.updateMenuList(fieldsValue);
        }
      });
    });
  };

  getFormItem = (data = {}) => {
    const { getFieldDecorator } = this.props.form;
    const OptionList = this.props.optionArr.map((item) => {
      return <Option value={item.id} key={item.id}>{item.name}</Option>;
    });
    const FormItemArr = [
      {
        label: <FormattedMessage id="menu.table.name"/>,
        component: <CInput/>,
        key: 'name',
        config: {
          initialValue: data.name || '',
          rules: [
            {
              required: true,
              message: '必填',
            },
          ],
        },
      },
      {
        label: <FormattedMessage id="menu.table.url"/>,
        component: <CInput/>,
        key: 'url',
        config: {
          initialValue: data.url || '',
        },
      },
      {
        label: <FormattedMessage id="menu.table.frametypeBasetype"/>,
        component: <CSelect>
          {OptionList}
        </CSelect>,
        key: 'frameTypeId',
        config: {
          initialValue: data.frameTypeId || '',
        },
      },
      {
        label: <FormattedMessage id="element.icon"/>,
        component: <SearchSelect
          showType="icon"
          setSelected={this.getIconId}
                   />,
        key: 'iconId',
        config: {
          initialValue: data.iconId || '',
        },
      },
      {
        label: <FormattedMessage id="menu.table.memo"/>,
        component: <CTextArea/>,
        key: 'memo',
        type: 'all',
        config: {
          initialValue: data.memo || '',
        },
      },
    ];
    return FormItemArr.map((item, index) => {
      const formItemLayout = item.type ? {
        labelCol: { span: 3 },
        wrapperCol: { span: 19 },
      } : {
        labelCol: { span: 6 },
        wrapperCol: { span: 15 },
      };
      return (<Col style={{ 'height': '50px' }} span={item.type ? 24 : 12} key={`1_${index}`}>
        <Form.Item {...formItemLayout} label={item.label} key={index}>
          {getFieldDecorator(item.key, {
            initialValue: item.config.initialValue,
            rules: [{
              required: item.config.rules && item.config.rules[0].required,
              message: item.config.rules && item.config.rules[0].message,
            },
            ],
          })(item.component)}
        </Form.Item></Col>);
    });
  };

  render() {
    const { visible, onCancel, title, okText, record } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { loading } = this.state;
    return (<CModal
              title={title}
              destroyOnClose={true}
              visible={visible}
              onCancel={onCancel}
              okText={okText}
              size="default"
              footer={[
                <Button key="submit" loading={loading} type="primary" onClick={() => this.handleSubmit()}>
                  {okText}
                </Button>]}
                    >
              <Form style={{ 'paddingTop': '40px' }}>
                <Row>
                  {visible ? this.getFormItem(record) : null}
                </Row>
              </Form>
            </CModal>
    );
  }
}

const DetialModal = Form.create({})(DetialModalm);
export default DetialModal;
