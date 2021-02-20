/*
 * @Author: Fus
 * @Date:   2019-09-09 14:33:34
 * @Desc: APP分组信息
 */
import { Component } from 'react';
import { Form } from 'antd';
import { FormattedMessage } from 'react-intl';
import { CInput, SplitLine } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import styles from './GroupForm.less';

class GroupForm extends Component {
  // 生成表单项
  getFormItems = () => {
    const { activeDetail = {} } = this.props;
    return [
      {
        key: 'basicLine-base',
        comType: 'static',
        colSpan: 24,
        component: <SplitLine title={<FormattedMessage id="splitLine.title.basic" />} />,
      }, {
        key: 'keycode',
        label: <FormattedMessage id="global.keycode" />,
        config: {
          initialValue: activeDetail.keycode,
        },
        component: <CInput disabled={true} />,
      }, {
        key: 'name',
        label: <FormattedMessage id="global.name" />,
        config: {
          initialValue: activeDetail.name,
        },
        component: <CInput />,
      },
    ];
  }
  render() {
    const { form, loading } = this.props;
    return (
      <div className={styles.wrap}>
        <Form>
          <FormItems
            formConfigs={this.getFormItems()}
            form={form}
            loading={loading}
          />

        </Form>
      </div>
    );
  }
}

export default Form.create()(GroupForm);