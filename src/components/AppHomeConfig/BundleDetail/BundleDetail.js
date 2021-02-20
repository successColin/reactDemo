/*
 * @Author: Fus
 * @Date:   2019-09-10 21:29:48
 * @Desc: 组件设置
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { Popover, Select, AutoComplete, Input } from 'antd';
import { SketchPicker } from 'react-color';
import {
  CButton,
  CInput,
  CInputNumber,
  SearchSelect,
  CMessage,
  CTextArea,
  CAutoComplete,
} from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import LanguageGroupType from '@/components/LanguageGroupType/LanguageGroupType';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import { updateBundle } from '@/services/appLibrary';
import { searchLanguageTempalteByLikeName } from '@/services/pageConfig';
import UploadToUrl from './UploadUrlToInput/UploadUrlToInput';
import { BaseContext, BOOL_TYPE, BOOL_VALUE_MAP } from '@/constants/global';
import PageConfig from '../PageConfig/PageConfig';
import styles from './BundleDetail.less';

const { Option } = Select;
const { Search } = Input;
const { Option: AutoCompleteOption } = AutoComplete;
// 是否的选择项
const boolOptions = BOOL_TYPE.map(item => <Option value={BOOL_VALUE_MAP[item]}
                                                  key={`bool_${BOOL_VALUE_MAP[item]}`}
><FormattedMessage
  id={item}
/></Option>);

const itemLayout = {
  labelCol: {
    sm: { span: 24 },
  },
  wrapperCol: {
    sm: { span: 24 },
  },
};

let pickedColor = '';

@connect(state => ({
  appHomeConfig: state.appHomeConfig,
  functionData: state.tabs.activeTabData.functionData,
}))
class BundleDetail extends Component {
  static contextType = BaseContext;
  state = {
    loading: false, // 保存
    visiblePageConfig: false,
    selectObj: [],
    visible: false,
  };
  // 选择图标
  setIcon = selected => {
    const { id } = selected[0] || {};
    this.props.form.setFieldsValue({
      iconId: id,
    });
  };
  // 选择字段
  setBundleSelectField = selected => {
    const { columnName } = selected[0] || {};
    this.props.form.setFieldsValue({
      applyToCalendarField: columnName,
    });
  };
  // 修改颜色值
  handleSaveColor = (fromType, value) => {
    const color = pickedColor.hex;
    const { activeBundle } = this.props.appHomeConfig;
    // 通过拾色器选色
    let colorCode = activeBundle.colorCode ? `${activeBundle.colorCode},${color}` : color;
    // 输入框直接修改
    if (fromType === 'input') colorCode = value;
    const newActiveBundle = {
      ...activeBundle,
      colorCode,
    };
    this.context.dispatch({
      type: 'appHomeConfig/updateState',
      payload: { activeBundle: newActiveBundle },
    });
    this.setState({ visibleColorPicker: false });
  };
  // 数据变化
  handleChange = (value) => {
    const { activeBundle } = this.props.appHomeConfig;
    const newActiveBundle = {
      ...activeBundle,
      bundleName: value,
      namelanguageid: -1,
    };
    this.context.dispatch({
      type: 'appHomeConfig/updateState',
      payload: { activeBundle: newActiveBundle },
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
    const { activeBundle } = this.props.appHomeConfig;
    const newActiveBundle = {
      ...activeBundle,
      bundleName: children,
      namelanguageid: value,
    };
    this.context.dispatch({
      type: 'appHomeConfig/updateState',
      payload: { activeBundle: newActiveBundle },
    });
  };
  // 关联语言模板
  relationLanguageTemplate = () => {
    const { activeBundle } = this.props.appHomeConfig;
    this.setState({ visible: true, templateId: activeBundle.namelanguageid });
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
    const { activeBundle } = this.props.appHomeConfig;
    const newActiveBundle = {
      ...activeBundle,
      bundleName: data.name,
      namelanguageid: data.id,
    };
    const { form } = this.props;
    form && form.setFieldsValue({ 'name': data.name });
    this.context.dispatch({
      type: 'appHomeConfig/updateState',
      payload: { activeBundle: newActiveBundle },
    });
    this.setState({ visible: false, templateId: data.id });
  };
  // 生成表单项
  getFormConfigs = () => {
    const { visibleColorPicker } = this.state;
    const { activeBundle = {}, groupData = {} } = this.props.appHomeConfig;
    const { colorCode } = activeBundle;
    const groupStyle = groupData.styleType;
    const showUrl = groupStyle === 3;
    return [
      {
        key: 'keycode',
        label: <FormattedMessage id="global.keycode"/>,
        config: {
          initialValue: activeBundle.bundleKeycode,
        },
        colSpan: 24,
        itemLayout,
        component: <CInput/>,
      }, {
        key: 'name',
        label: <FormattedMessage id="global.name"/>,
        config: {
          initialValue: activeBundle.bundleName,
        },
        colSpan: 24,
        itemLayout,
        component:
        //   <CAutoComplete
        //   onChange={(value) => this.handleChange(value)}
        //   onSearch={value => this.handleSeach(value)}
        //   combobox={true}
        //   onSelect={(value, option) => this.handleSelect(value, option)}
        //   dataSource={this.returnSelectOption()}
        //   // onBlur={(value) => this.blurCheck(value, index, record, 'displayName')}
        //   handleClick={() => this.relationLanguageTemplate()}
        // />
          <Search
            onChange={(e) => this.handleChange(e.target.value)}
            onSearch={() => this.relationLanguageTemplate()}
          />
        ,
      }, {
        key: 'iconId',
        label: <FormattedMessage id="appHomeConfig.module.icon"/>,
        config: {
          initialValue: activeBundle.bundleIconId,
        },
        colSpan: 24,
        itemLayout,
        ignore: showUrl,
        component: (
          <SearchSelect
            modalContentType="icon"
            showType="icon"
            setSelected={this.setIcon}
          />
        ),
      }, {
        key: 'colorCode',
        label: <FormattedMessage id="appHomeConfig.module.color"/>,
        config: {
          initialValue: activeBundle.colorCode,
        },
        colSpan: 24,
        itemLayout,
        ignore: showUrl,
        component: (
          <Popover
            content={(
              <div className={styles.colorPickerWrap}>
                <CButton
                  size="small"
                  type="primary"
                  onClick={() => this.handleSaveColor(null, pickedColor.hex)}
                >
                  <FormattedMessage id="global.ok"/>
                </CButton>
                <SketchPicker
                  colors={colorCode ? colorCode.split(',') : []}
                  color="#fff"
                  onChangeComplete={color => pickedColor = color}
                />
              </div>
            )}
            trigger="click"
            placement="leftBottom"
            visible={visibleColorPicker}
            onVisibleChange={visibleColorPicker => this.setState({ visibleColorPicker })}
          >
            <CInput
              value={activeBundle.colorCode}
              onChange={e => this.handleSaveColor('input', e.target.value)}
            />
          </Popover>
        ),
      }, {
        key: 'picpath',
        label: 'URL',
        config: {
          initialValue: activeBundle.picpath,
        },
        colSpan: 24,
        itemLayout,
        ignore: !showUrl,
        // component: <CInput/>,
        component: <UploadToUrl/>,
      }, {
        key: 'ignore-mobileFrameTypeName',
        label: <FormattedMessage id="appHomeConfig.module.frame"/>,
        config: {
          initialValue: activeBundle.mobileFrameTypeName,
        },
        colSpan: 24,
        itemLayout,
        component: <CInput disabled={true}/>,
      }, {
        key: 'applyToCalendar',
        label: <FormattedMessage id="appHomeConfig.module.applyToCalendar"/>,
        config: {
          initialValue: activeBundle.applyToCalendar,
        },
        colSpan: 24,
        itemLayout,
        ignore: activeBundle.mobileFrameTypeId !== 1,
        component: (
          <Select>
            {boolOptions}
          </Select>
        ),
      }, {
        key: 'applyToCalendarField',
        label: <FormattedMessage id="appHomeConfig.module.applyToCalendarField"/>,
        config: {
          initialValue: activeBundle.applyToCalendarField,
        },
        colSpan: 24,
        itemLayout,
        ignore: activeBundle.mobileFrameTypeId !== 1,
        component: (
          <SearchSelect
            modalContentType="bundleSelectField"
            setSelected={this.setBundleSelectField}
            otherQueryParams={{ id: activeBundle.id }}
            selectConfig={{
              isMulti: false,
              keyName: 'columnName',
            }}
          />
        ),
      }, {
        key: 'sno',
        label: <FormattedMessage id="global.index"/>,
        config: {
          initialValue: activeBundle.bundleSno,
        },
        colSpan: 24,
        itemLayout,
        component: <CInputNumber/>,
      }, {
        key: 'url',
        label: <FormattedMessage id="appHomeConfig.module.url"/>,
        config: {
          initialValue: activeBundle.url,
        },
        colSpan: 24,
        itemLayout,
        component: <CInput/>,
      }, {
        key: 'sqlDescription',
        label: 'SQL',
        config: {
          initialValue: activeBundle.sqlDescription,
        },
        colSpan: 24,
        itemLayout,
        ignore: activeBundle.mobileFrameTypeId !== 1,
        component: (
          <CTextArea/>
        ),
      },
    ];
  };

  // 保存
  handleSave = () => {
    const { langLib } = this.context;
    const { fetchAppData, appHomeConfig } = this.props;
    const { actionType, groupData, appData, activeBundle } = appHomeConfig;
    this.props.form.validateFieldsAndScroll((errs, values) => {
      if (errs) return;
      const params = {
        ...values,
        id: activeBundle.id,
        groupId: actionType === 'editGroup' ? groupData.id : '',
        appId: appData.id,
        name: activeBundle.bundleName,
        namelanguageid: activeBundle.namelanguageid,
      };
      this.setState({ loading: true });
      updateBundle(params).then(res => {
        CMessage(langLib['message.save.success']);
        fetchAppData();
        this.setState({ loading: false });
      }, err => this.setState({ loading: false }));
    });
  };
  // 关闭弹窗
  handleCloseModal = () => {
    this.setState({ visiblePageConfig: false });
    this.context.dispatch({
      type: 'bundleConfig/clearState',
    });
  };
  // 打开弹窗
  handleOpenModal = () => {
    // 为进入【组件设计】界面加数据
    const { activeBundle } = this.props.appHomeConfig;
    const { langLib } = this.context;
    if (JSON.stringify(activeBundle) === '{}') {
      CMessage(langLib['appHomeConfig.bundle.details'], 'error');
      return;
    }
    this.context.dispatch({
      type: 'bundleConfig/updateState',
      payload: {
        bundleData: activeBundle,
      },
    });
    this.setState({ visiblePageConfig: true });
  };

  render() {
    const { form, functionData } = this.props;
    const { loading, visiblePageConfig, visible } = this.state;
    const { activeBundle, actionType } = this.props.appHomeConfig;
    const { canmodify, canadd, candelete } = functionData.attributes;
    const LanguageGroupTypeProps = {
      type: 'addChooseBtn',
      isAsyncTree: true,
      chooseCallbackFun: this.handleRelatinLanguageTemplate,
      templateId: activeBundle.namelanguageid === -1 || activeBundle.namelanguageid === '-1' || !activeBundle.namelanguageid ? null : activeBundle.namelanguageid,
    };
    return (
      <div className={styles.wrap}>
        <div className={styles.content}>
          <p className={styles.tit}>
            <div className={styles.titBox}><FormattedMessage id="appHomeConfig.module.setting"/></div>
            <CButton className={styles.configBtn} onClick={this.handleOpenModal}>
              <i className="iconfont icon-setting custom-color"/>
              <FormattedMessage id="bundleConfig.design"/>
            </CButton>
          </p>
          <div className={styles.formWrap}>
            <FormItems
              formConfigs={this.getFormConfigs()}
              form={form}
              loading={false}
            />
          </div>
        </div>
        <div className={styles.footer}>
          {canmodify ? <CButton type="primary" onClick={() => this.handleSave()} loading={loading}>
            <FormattedMessage id="global.save"/>
          </CButton> : null}
        </div>
        <CreateModal
          visible={visiblePageConfig}
          title={<FormattedMessage id="bundleConfig.design"/>}
          className={styles.modal}
          onCancel={this.handleCloseModal}
          footer={null}
          size="large"
        >
          <PageConfig/>
        </CreateModal>
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

export default BundleDetail;
