/*
 * @Author: Fus
 * @Date:   2019-08-26 09:07:37
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-26 09:29:22
 * @Desc: 用户设计组内容容器
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import FormItems from '@/components/common/FormItems/FormItems';
import { CInput, SplitLine, CTextArea } from '@/components/common/BasicWidgets';
import { VALID_REQUIRED_MESSAGE } from '@/constants/global';

class ContentContainer extends Component {
  // 生成表单项
  getFormItems = () => {
    const { activeDetail, isInitialData, activeTreeNodeDetail, actionType } = this.props;
    const formItems = [
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
        component: <CInput disabled={true} allowClear={false} />,
      }, {
        key: 'name',
        label: <FormattedMessage id="global.name" />,
        config: {
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }],
          initialValue: activeDetail.name,
        },
        component: <CInput disabled={isInitialData} />,
      },
    ];
    const isGroupComponent = activeTreeNodeDetail.isGroup && (actionType === 'addGroup' || actionType === 'delGroup' || actionType === 'editGroup');
    // 非组节点需要显示备注
    if (!isGroupComponent) {
      formItems.push({
        key: 'memo',
        label: <FormattedMessage id="global.memo" />,
        colSpan: 24,
        config: {
          initialValue: activeDetail.memo,
        },
        component: <CTextArea disabled={isInitialData} />,
      });
    }
    return formItems;
  }
  render() {
    const { form, loading } = this.props;
    return (
      <FormItems
        form={form}
        formConfigs={this.getFormItems()}
        loading={loading}
      />
    );
  }
}
export default ContentContainer;