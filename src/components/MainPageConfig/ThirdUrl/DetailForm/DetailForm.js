/*
 * @Author: Fus
 * @Date:   2020-02-04 13:46:24
 * @Desc: 三方链接详情
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { CAutoComplete, CInput, CTextArea } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { FORM_VALID_RULES } from '@/constants/global';
import { VALID_REQUIRED_MESSAGE } from '@/constants/global';
import LanguageGroupType from '@/components/LanguageGroupType/LanguageGroupType';
import CreateModal from '@/components/common/CreateModal/CreateModal';

class DetailForm extends Component {
  state = {
    visible: false,
  };
  // 数据变化
  handleChange = (value) => {
    let { activeDetail, updateFrameState, form } = this.props;
    activeDetail.name = value;
    activeDetail.namelanguageid = null;
    updateFrameState(activeDetail, () => {
      form && form.setFieldsValue({ 'name': value });
    });
  };
  // 关联语言模板
  relationLanguageTemplate = () => {
    let { activeDetail, updateFrameState } = this.props;
    this.setState({ visible: true, templateId: activeDetail.namelanguageid });
  };
  // 选择语言模板
  handleRelatinLanguageTemplate = (data) => {
    let { activeDetail, updateFrameState, form } = this.props;
    activeDetail.name = data.name;
    activeDetail.namelanguageid = data.id;
    updateFrameState(activeDetail, () => {
      form && form.setFieldsValue({ name: data.name });
    });
    this.setState({ visible: false });
  };
  getFormConfigs = () => {
    const { activeDetail } = this.props;
    return [{
      key: 'name',
      label: <FormattedMessage id="global.name"/>,
      config: {
        initialValue: activeDetail.name,
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],
      },
      colSpan: 12,
      // component: <CInput />,
      component: <CAutoComplete
        onChange={(value) => this.handleChange(value)}
        combobox={true}
        handleClick={() => this.relationLanguageTemplate()}
      />,
    }, {
      key: 'url',
      label: 'URL',
      config: {
        initialValue: activeDetail.url,
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }, FORM_VALID_RULES.url],
      },
      colSpan: 12,
      component: <CInput/>,
    }, {
      key: 'memo',
      label: <FormattedMessage id="global.memoMsg"/>,
      config: {
        initialValue: activeDetail.memo,
      },
      colSpan: 24,
      component: <CTextArea/>,
    }];
  };

  render() {
    const { form, activeDetail } = this.props;
    const { visible } = this.state;
    const LanguageGroupTypeProps = {
      type: 'addChooseBtn',
      isAsyncTree: true,
      chooseCallbackFun: this.handleRelatinLanguageTemplate,
      templateId: activeDetail.namelanguageid || null,
    };
    return (
      <div style={{ marginTop: 20 }}>
        <FormItems
          formConfigs={this.getFormConfigs()}
          form={form}
          loading={false}
        />
        <CreateModal
          visible={visible}
          size={'large'}
          footer={null}
          title={<FormattedMessage id="settingForm.relationLanguageTemplate"/>}
          onCancel={() => this.setState({ visible: false })}
        >
          <LanguageGroupType {...LanguageGroupTypeProps}/>
        </CreateModal>
      </div>
    );
  }
}

export default DetailForm;
