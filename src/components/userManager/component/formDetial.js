/*
 * @Author: Fus
 * @Date:   2019-06-19 08:46:41
 * @Last Modified by: Fus
 * @Last Modified time: 2019-08-28 14:14:42
 * @Desc: 元素配置
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Select, DatePicker, Radio } from 'antd';
import moment from 'moment';
import { CTextArea, CSelect, CInput, SearchSelect, SplitLine } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import NormalSearchSelect from './NormalSearchSelect/NormalSearchSelect';
import { VALID_REQUIRED_MESSAGE, FORM_VALID_RULES, BaseContext } from '@/constants/global';
import { getValidateMessage } from '@/utils/common';

const { Option } = Select;
const dateFormat = 'YYYY-MM-DD HH:mm:ss';

class formConfig extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {};
  }

  // 获取表单项配置
  getFormConfigs = () => {
    const {
      activeDetail,
      activeTreeNodeDetail = {},
      actionType,
      updateFrameState,
      form,
    } = this.props.tabDefaultConfig;
    const { isGroup = true } = activeTreeNodeDetail;
    let showGroup = isGroup;
    const { langLib } = this.context;
    if (actionType === 'addElement') showGroup = false;
    const publicProps = { disabled: activeDetail.isGroup };
    // 分割线 - 基本属性
    const basicLine = {
      key: 'basicLine-base',
      comType: 'static',
      colSpan: 24,
      component: <SplitLine title={<FormattedMessage id="splitLine.title.basic"/>}/>,
    };
    const elseLine = {
      key: 'basicLine-else',
      comType: 'static',
      colSpan: 24,
      component: <SplitLine title={<FormattedMessage id="global.else"/>}/>,
    };
    const group = { // 所属分组
      key: 'groupId',
      label: <FormattedMessage id="user.form.group"/>,
      colSpan: 12,
      config: {
        initialValue: !showGroup ? activeTreeNodeDetail.groupId : activeDetail.groupId,
      },
      component: (
        <SearchSelect
          showType="list"
          setSelected={this.setIcon}
        />
      ),
    };
    const email = { // 邮箱
      key: 'email',
      label: <FormattedMessage id="user.form.email"/>,
      colSpan: 12,
      config: {
        rules: [{
          required: false,
          message: VALID_REQUIRED_MESSAGE,
        }, {
          pattern: /^[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*@[a-zA-Z0-9]+([-_.][a-zA-Z0-9]+)*\.[a-z]{2,}$/,
          message: getValidateMessage('email'),
        }],
        initialValue: activeDetail.email || '',
      },
      component: (
        <CInput/>
      ),
    };
    const telephone = { // 手机号码
      key: 'telephone',
      label: <FormattedMessage id="user.form.telephone"/>,
      colSpan: 12,
      config: {
        initialValue: activeDetail.telephone || '',
      },
      component: (
        <CInput/>
      ),
    };
    const userDesignerId = { // 用户设计组
      key: 'userDesignerId',
      // label: <FormattedMessage id="user.form.userDesignerId"/>,
      colSpan: 12,
      config: {
        initialValue: activeDetail.userDesignerId,
      },
      component: (
        <CInput style={{ 'display': 'none' }}/>
      ),
    };
    const userDesignerName = { // 用户设计组
      key: 'userDesignerName',
      label: <FormattedMessage id="user.form.userDesignerId"/>,
      colSpan: 12,
      config: {
        initialValue: activeDetail.userDesignerName || '',
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],
      },
      component: (
        <NormalSearchSelect
          form={form}
          type="userDesign"
          currentKey={activeDetail.userDesignerId + '-USERDESIGNER' || '1-USERDESIGNER'}
          currentId={activeDetail.userDesignerId}
          setSelected={selecteds => this.handleSetSelectSearchValue(selecteds, 'userDesignerName', 'userDesignerId')}
        />
      ),
    };
    const companyId = { // 用户设计组
      key: 'companyId',
      // label: <FormattedMessage id="user.form.userDesignerId"/>,
      colSpan: 12,
      config: {
        initialValue: activeDetail.companyId || '',
      },
      component: (
        <CInput style={{ 'display': 'none' }}/>
      ),
    };
    const companyName = { // 用户设计组
      key: 'companyName',
      label: <FormattedMessage id="user.form.compony"/>,
      colSpan: 12,
      config: {
        initialValue: activeDetail.companyName || '',
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],

      },
      component: (
        <NormalSearchSelect
          form={form}
          type="compony"
          currentKey={activeDetail.companyId + '-COMPANY'}
          currentId={activeDetail.companyId}
          setSelected={selecteds => this.handleSetSelectSearchValue(selecteds, 'companyName', 'companyId')}
        />
      ),
    };
    const account = { // 状态
      key: 'account',
      label: <FormattedMessage id="user.form.account"/>,
      colSpan: 12,
      config: {
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
          max: 50,
        }, {
          pattern: /^[^\s]*$/,
          message: langLib['No.spaces'],
        }],
        initialValue: activeDetail.account || '',
      },
      component: (
        <CInput/>
      ),
    };
    const factorycode = { // 状态
      key: 'factorycode',
      label: <FormattedMessage id="user.form.factorycode"/>,
      colSpan: 12,
      config: {
        rules: [{
          required: false,
          message: VALID_REQUIRED_MESSAGE,
          max: 50,
        }],
        initialValue: activeDetail.factorycode || '',
      },
      component: (
        <CInput/>
      ),
    };
    const status = { // 状态
      key: 'basestate',
      label: <FormattedMessage id="user.form.stuts"/>,
      colSpan: 12,
      config: {
        initialValue: activeDetail.basestate || '',
      },
      component: (
        <CSelect style={{ 'width': '100%' }}>
          <Option value={1} key="1"><FormattedMessage id="user.form.on"/> </Option>
          <Option value={2} key="2"><FormattedMessage id="user.form.out"/> </Option>
        </CSelect>
      ),
    };
    const enabled = { // 状态
      key: 'enabled',
      label: <FormattedMessage id="user.form.isabled"/>,
      colSpan: 12,
      config: {
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],
        initialValue: actionType === 'addElement' ? 1 : activeDetail.enabled,
      },
      component: (
        // <CSelect style={{ 'width': '100%' }}>
        //   <Option value={1} key="1"><FormattedMessage id="user.form.abled"/> </Option>
        //   <Option value={2} key="2"><FormattedMessage id="user.form.disabled"/> </Option>
        // </CSelect>
        <Radio.Group>
          <Radio value={1}><FormattedMessage id="user.form.abled"/></Radio>
          <Radio value={0}><FormattedMessage id="user.form.disabled"/></Radio>
        </Radio.Group>
      ),
    };
    const time = { // 入职时间
      key: 'startDate',
      label: <FormattedMessage id="user.form.starttime"/>,
      colSpan: 12,
      config: {
        initialValue: activeDetail.startDate ? moment(new Date(activeDetail.startDate), dateFormat) : '',
      },
      component: (
        <DatePicker style={{ 'width': '100%' }} format={dateFormat}/>
      ),
    };
    const orgname = { // 所属组织
      key: 'orgName',
      label: <FormattedMessage id="user.form.org"/>,
      colSpan: 12,
      config: {
        initialValue: activeDetail.orgName || '',
        rules: [{
          required: true,
          message: VALID_REQUIRED_MESSAGE,
        }],
      },
      component: (
        <NormalSearchSelect
          form={form}
          type="org"
          treeNodeType={2}
          currentKey={activeDetail.orgId + '-ORGANIZATION'}
          currentId={activeDetail.orgId}
          setSelected={selecteds => this.handleSetSelectSearchValue(selecteds, 'orgName', 'orgId')}
        />
      ),
    };
    const userGroup = { // 所属分组
      key: 'groupName',
      label: <FormattedMessage id="user.form.owngroup"/>,
      colSpan: 12,
      config: {
        initialValue: activeDetail.groupName || '',
      },
      component: (
        <NormalSearchSelect
          form={form}
          type="groupId"
          currentKey={activeDetail.groupId + '-COMPANY'}
          currentId={activeDetail.groupId}
          setSelected={selecteds => this.handleSetSelectSearchValue(selecteds, 'groupName', 'groupId')}
        />
      ),
    };
    const orgId = { // 组织机构
      key: 'orgId',
      // label: <FormattedMessage id="user.form.userDesignerId"/>,
      colSpan: 12,
      config: {
        initialValue: activeDetail.orgId,
      },
      component: (
        <CInput style={{ 'display': 'none' }}/>
      ),
    };
    const groupId = { // 所属分组id
      key: 'groupId',
      // label: <FormattedMessage id="user.form.userDesignerId"/>,
      colSpan: 12,
      config: {
        initialValue: activeDetail.groupId,
      },
      component: (
        <CInput style={{ 'display': 'none' }}/>
      ),
    };
    // 元素的基本信息
    const publicBasicConfig = [
      basicLine, {
        key: 'keycode',
        colSpan: 12,
        label: <FormattedMessage id="element.keycode"/>,
        config: {
          rules: [{
            required: false,
            message: VALID_REQUIRED_MESSAGE,
          }, {
            pattern: /^[^\s]*$/,
            message: langLib['No.spaces'],
          }],
          initialValue: activeDetail.keycode || '',
        },
        component: <CInput disabled={actionType === 'editElement' || actionType === 'addElement' ? false : true}/>,
      }, {
        key: showGroup ? 'name' : 'username',
        colSpan: 12,
        label: <FormattedMessage id="element.name"/>,
        config: {
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }, {
            pattern: /^[^\s]*$/,
            message: langLib['No.spaces'],
          }],
          initialValue: showGroup ? activeDetail.name : activeDetail.username,
        },
        component: <CInput {...publicProps} />,
      },
    ];
    if (!showGroup) {
      publicBasicConfig.push(account, email, userDesignerName, orgname, companyName, userGroup, enabled, telephone, factorycode, companyId, orgId, userDesignerId, groupId);
    }
    return [
      ...publicBasicConfig,
    ];
  };
  handleSetSelectSearchValue = (selected, name, id) => {
    let { activeDetail } = this.props.tabDefaultConfig;
    this.props.tabDefaultConfig.form.setFieldsValue({
      [id]: selected[0].id,
      [name]: selected[0].name,
    });
    this.props.tabDefaultConfig.updateFrameState({
      activeDetail: {
        ...activeDetail,
        [id]: selected[0].id,
        [name]: selected[0].name,
      },
    });
  };

  render() {
    const { loading, form } = this.props.tabDefaultConfig;
    return (
      <FormItems
        formConfigs={this.getFormConfigs()}
        form={form}
        loading={loading}
      />
    );
  }
}

export default formConfig;
