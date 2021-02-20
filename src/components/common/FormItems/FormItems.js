/*
 * @Author: Fus
 * @Date:   2019-06-18 19:17:08
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-03-02 08:52:45
 * @Desc: 根据配置生成form表单项
 */
import { Component, Fragment } from 'react';
import { Form, Col, Spin } from 'antd';
import classNames from 'classnames';
import { CSpin, CInput } from '@/components/common/BasicWidgets';
import { IGNORE_FORM_ITEM } from '@/constants/element';
import styles from './FormItems.less';

const FormItem = Form.Item;

// 默认的表单布局
const initItemLayout = {
  labelCol: {
    sm: { span: 5 },
  },
  wrapperCol: {
    sm: { span: 19 },
  },
};

class FormItems extends Component {
  static defaultProps = {
    comType: 'static', // 组件类型 data数据层获取的配置项（需要根据控件类型显示） static手动配置出的配置项

    formConfigs: [ // 表单配置项
      // {
      //   key: '', // 字段名
      //   label: '', // 显示名称
      //   comType: 'formItem', // 组件类型  formItem表单项  static静态项（无需form嵌套，直接render）
      //   config: {}, // antd FormItem的配置项（initialValue, rules等）
      //   component: null, // 渲染组件
      //   itemLayout: initItemLayout, // 布局
      //   colon: true, // 是否显示冒号
      //   colSpan: 12, // 列宽
      //   offset: 0, // 左右偏移
      // },
    ],
  }
  // 根据配置生成表单项
  getItems = () => {
    const { formConfigs, form } = this.props;
    const { getFieldDecorator } = form;
    return formConfigs.map(item => {
      const {
        colSpan = 12,
        key,
        offset = 0,
        ignore = false,
      } = item;
      if (ignore) return null;
      const SingleItem = this.setItem(item);
      return (
        <Col span={colSpan} key={key} offset={offset}>
          {SingleItem}
        </Col>
      );
    });
  }
  // 生成表单项 or 非表单项
  setItem = (data) => {
    const { getFieldDecorator } = this.props.form;
    const {
      key = '',
      subKey = '',
      label = '',
      comType = 'formItem', // 组件类型 formItem表单项  static静态项（无需form嵌套，直接render） custom自定义
      config = {},
      component = null,
      itemLayout = initItemLayout,
      colon = false,
      className = '',
      hasHidden = false, // 是否需要包含隐藏项
    } = data;
    switch (comType) {
      case 'formItem': {
        if (hasHidden) {
          const subKeyName = subKey || `${IGNORE_FORM_ITEM}${key}`;
          return (
            <Fragment>
              <FormItem
                {...itemLayout}
                key={subKeyName}
                label={label}
                colon={colon}
                className={className}
              >
                {getFieldDecorator(subKeyName, {
                  ...config,
                  initialValue: config.subInitialValue || '',
                })(component)}
              </FormItem>
              <FormItem
                {...itemLayout}
                key={key}
                label={label}
                colon={colon}
                className="hide"
              >
                {getFieldDecorator(key, {
                  initialValue: config.initialValue || '',
                })(<CInput />)}
              </FormItem>
            </Fragment>
          );
        }
        return (
          <FormItem
            {...itemLayout}
            key={key}
            label={label}
            colon={colon}
            className={className}
          >
            {getFieldDecorator(key, config)(component)}
          </FormItem>
        );
      }
      default: return component;
    }
  }
  render() {
    const { loading, className } = this.props;
    const wrapCls = classNames({
      [styles.wrap]: true,
      [className]: className,
    });
    return (
      <div className={wrapCls}>
        <CSpin spinning={loading}>
          <div className={styles.itemWrap}>
            {this.getItems()}
          </div>
        </CSpin>
      </div>
    );
  }
}

export default FormItems;