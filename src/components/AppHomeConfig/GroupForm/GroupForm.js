/*
 * @Author: Fus
 * @Date:   2019-09-10 21:29:48
 * @Desc: 新增组
 */

import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { CButton, CInput, CInputNumber, CAutoComplete } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { AutoComplete, Input, Radio, Select } from 'antd';
import { BaseContext, BOOL_TYPE, BOOL_VALUE_MAP } from '@/constants/global';
import { insertOrUpdateAppHomePageBundleGroup } from '@/services/appLibrary';
import styles from './GroupForm.less';
import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
import { searchLanguageTempalteByLikeName } from '@/services/pageConfig';
import { APP_GROUP_STYLE, APP_USERCENTER_GROUP_STYLE } from '@/constants/pageConfig';
import LanguageGroupType from '@/components/LanguageGroupType/LanguageGroupType';
import CreateModal from '@/components/common/CreateModal/CreateModal';

const itemLayout = {
  labelCol: {
    sm: { span: 24 },
  },
  wrapperCol: {
    sm: { span: 24 },
  },
};
const { Search } = Input;
const { Option } = Select;
const { Option: AutoCompleteOption } = AutoComplete;
// 是否的选择项
const boolOptions = BOOL_TYPE.map(item => <Radio value={BOOL_VALUE_MAP[item]}
                                                 key={`bool_${BOOL_VALUE_MAP[item]}`}><FormattedMessage
  id={item}/></Radio>);

// 风格选项
const styleOptions = Object.keys(APP_GROUP_STYLE).map(item => <Option key={`style_${item}`}
                                                                      value={+item}><FormattedMessage
  id={APP_GROUP_STYLE[item]}/></Option>);
// 个人中心风格选项
const styleUserCenterOptions = Object.keys(APP_USERCENTER_GROUP_STYLE).map(item => <Option key={`style_${item}`}
                                                                                           value={+item}><FormattedMessage
  id={APP_GROUP_STYLE[item]}/></Option>);

@connect(state => ({
  appHomeConfig: state.appHomeConfig,
  functionData: state.tabs.activeTabData.functionData,
}))
class GroupForm extends Component {
  static contextType = BaseContext;
  state = {
    loading: false,
    selectObj: [],
    templateId: -1,
    visible: false,
  };
  // 数据变化
  handleChange = (value) => {
    const { groupData } = this.props.appHomeConfig;
    const newActiveBundle = {
      ...groupData,
      name: value,
      namelanguageid: -1,
    };
    this.context.dispatch({
      type: 'appHomeConfig/updateState',
      payload: { groupData: newActiveBundle },
    });
  };
  // 修改名称时查找出数据出来同时
  handleSeach = (value) => {
    searchLanguageTempalteByLikeName({ name: value }).then(res => {
      this.setState({
        selectObj: res,
      });
    });
  };
  // 如果是选中模板中的数据，就把模板id放置到数据里面
  handleSelect = (value, option) => {
    const { props } = option;
    const { children } = props;
    // 设置编辑状态
    const { groupData } = this.props.appHomeConfig;
    const newActiveBundle = {
      ...groupData,
      name: children,
      namelanguageid: value,
    };
    this.context.dispatch({
      type: 'appHomeConfig/updateState',
      payload: { groupData: newActiveBundle },
    });
  };
  // 关联语言模板
  relationLanguageTemplate = () => {
    const { groupData } = this.props.appHomeConfig;
    this.setState({ visible: true, templateId: groupData.namelanguageid });
  };
  // 查询出来的值渲染在对应的地方
  returnSelectOption = () => {
    const { selectObj } = this.state;
    return selectObj.map(item => <AutoCompleteOption
      value={`${item.id}`}
      key={`${item.id}`}
    >
      {item.name}
    </AutoCompleteOption>);
  };
  // 选择模板语言
  handleRelatinLanguageTemplate = (data) => {
    const { groupData } = this.props.appHomeConfig;
    const newActiveBundle = {
      ...groupData,
      name: data.name,
      namelanguageid: data.id,
    };
    const { form } = this.props;
    form && form.setFieldsValue({ 'name': data.name });
    this.context.dispatch({
      type: 'appHomeConfig/updateState',
      payload: { groupData: newActiveBundle },
    });
    this.setState({ visible: false, templateId: data.id });
  };
  // 更新组数据
  updateGroupDetail = (key, value) => {
    const { groupData } = this.props.appHomeConfig;
    this.context.dispatch({
      type: 'appHomeConfig/updateState',
      payload: {
        groupData: {
          ...groupData,
          [key]: value,
        },
      },
    });
  };
  getFormConfigs = () => {
    const { mainTabKey, groupData = {} } = this.props.appHomeConfig;
    const isUserCenter = mainTabKey === 2;
    return [
      {
        key: 'keycode',
        label: <FormattedMessage id="global.keycode"/>,
        config: {
          initialValue: groupData.keycode,
        },
        colSpan: 24,
        itemLayout,
        component: <CInput/>,
      }, {
        key: 'name',
        label: <FormattedMessage id="global.name"/>,
        config: {
          initialValue: groupData.name,
        },
        colSpan: 24,
        itemLayout,
        component: <Search
          // onChange={(value) => this.handleChange(value)}
          // onSearch={value => this.handleSeach(value)}
          // combobox={true}
          // onSelect={(value, option) => this.handleSelect(value, option)}
          // dataSource={this.returnSelectOption()}
          // // onBlur={(value) => this.blurCheck(value, index, record, 'displayName')}
          // handleClick={() => this.relationLanguageTemplate()}
          onChange={(e) => this.handleChange(e.target.value)}
          onSearch={() => this.relationLanguageTemplate()}
        />,
      }, {
        key: 'showGroupName',
        label: <FormattedMessage id="appHomeConfig.group.showTitle"/>,
        config: {
          initialValue: groupData.showGroupName,
        },
        colSpan: 24,
        itemLayout,
        // ignore: isUserCenter,
        component: (
          <Radio.Group onChange={e => this.updateGroupDetail('showGroupName', e.target.value)}>
            {boolOptions}
          </Radio.Group>
        ),
      }, {
        key: 'styleType',
        label: <FormattedMessage id="appHomeConfig.group.style"/>,
        config: {
          initialValue: groupData.styleType,
        },
        colSpan: 24,
        itemLayout,
        // ignore: isUserCenter,
        component: (
          <Select onChange={val => this.updateGroupDetail('styleType', val)}>
            {isUserCenter ? styleUserCenterOptions : styleOptions}
          </Select>
        ),
      }, {
        key: 'sno',
        label: <FormattedMessage id="global.index"/>,
        config: {
          initialValue: groupData.sno,
        },
        colSpan: 24,
        itemLayout,
        component: <CInputNumber/>,
      },
    ];
  };
  // 保存
  handleSave = () => {
    const { langLib } = this.context;
    const { fetchAppData, appHomeConfig } = this.props;
    const { actionType, groupData = {}, appData, mainTabKey } = appHomeConfig;
    this.props.form.validateFieldsAndScroll((errs, values) => {
      if (errs) return;
      const params = {
        ...values,
        id: actionType === 'editGroup' ? groupData.id : '',
        appId: appData.id,
        name: groupData.name,
        namelanguageid: groupData.namelanguageid,
        basetype: mainTabKey,
      };
      this.setState({ loading: true });
      insertOrUpdateAppHomePageBundleGroup(params).then(res => {
        CMessage(langLib['message.save.success']);
        this.props.form.resetFields();
        fetchAppData();
        this.setState({ loading: false });
      }, err => this.setState({ loading: false }));
    });
  };

  render() {
    const { form, appHomeConfig, functionData } = this.props;
    const { loading, visible, templateId } = this.state;

    const { canmodify, canadd, candelete } = functionData.attributes;
    const { actionType, groupData } = appHomeConfig;
    const LanguageGroupTypeProps = {
      type: 'addChooseBtn',
      isAsyncTree: true,
      chooseCallbackFun: this.handleRelatinLanguageTemplate,
      templateId: groupData.namelanguageid === -1 || groupData.namelanguageid === '-1' || !groupData.namelanguageid ? null : (groupData.namelanguageid || templateId),
    };
    return (
      <div className={styles.wrap}>
        <div className={styles.content}>
          <p className={styles.tit}>
            <FormattedMessage id={`appHomeConfig.${actionType === 'editGroup' ? 'editGroup' : 'addGroup'}`}/>
          </p>
          <FormItems
            formConfigs={this.getFormConfigs()}
            form={form}
            loading={false}
          />
        </div>
        <div className={styles.footer}>
          {(actionType === 'addGroup' && canadd) || canmodify ?
            <CButton type="primary" onClick={() => this.handleSave()} loading={loading}>
              <FormattedMessage id="global.save"/>
            </CButton> : null}
        </div>
        <CreateModal
          visible={visible}
          size={'large'}
          footer={null}
          title={<FormattedMessage id="settingForm.relationLanguageTemplate"/>}
          onCancel={() => this.setState({ visible: false })}
        >
          <LanguageGroupType {...LanguageGroupTypeProps} />
        </CreateModal>
      </div>
    );
  }
}

export default GroupForm;
