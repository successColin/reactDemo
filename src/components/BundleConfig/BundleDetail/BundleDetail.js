/*
 * @Author: Fus
 * @Date:   2019-09-07 09:38:35
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-11-02 17:36:12
 * @Desc: bundle详情页面
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Select, AutoComplete } from 'antd';
import {
  CInput,
  CButton,
  SplitLine,
  CSelect,
  SearchSelect,
  CTextArea,
  CSpin,
  CMessage,
  CAutoComplete,
} from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import LanguageGroupType from '@/components/LanguageGroupType/LanguageGroupType';
import MobileTabPaneContainer from '@/components/MobileTabPaneContainer/MobileTabPaneConTainer';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import { BaseContext, VALID_REQUIRED_MESSAGE } from '@/constants/global';
import styles from './BundleDetail.less';
import phoneImg from '@/assets/phone.png';
import { searchLanguageTempalteByLikeName } from '@/services/pageConfig';

const { Option } = Select;
const { Option: AutoCompleteOption } = AutoComplete;

class BundleDetail extends Component {
  static contextType = BaseContext;
  state = {
    visibleConfig: false, // 界面配置弹框是否可见
    selectObj: [],
    visible: false,
  };
  // 数据变化
  handleChange = (value) => {
    let { activeDetail, updateFrameState, form } = this.props;
    activeDetail.name = value;
    activeDetail.namelanguageid = -1;
    updateFrameState(activeDetail, () => {
      form && form.setFieldsValue({ 'name': value });
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
    let { activeDetail, updateFrameState } = this.props;
    activeDetail.name = children;
    activeDetail.namelanguageid = value;
    updateFrameState(activeDetail);
  };
  // 关联语言模板
  relationLanguageTemplate = () => {
    let { activeDetail, updateFrameState } = this.props;
    this.setState({ visible: true, templateId: activeDetail.namelanguageid });
  };
  // 查询出来的值渲染在对应的地方
  returnSelectOption = () => {
    const { selectObj } = this.state;
    return selectObj.map(item => <AutoCompleteOption
      value={`${item.id}`}
      key={`${item.id}`}>
      {item.name}
    </AutoCompleteOption>);
  };
  // 选择模板语言
  handleRelatinLanguageTemplate = (data) => {
    let { activeDetail, updateFrameState, form } = this.props;
    activeDetail.name = data.name;
    activeDetail.namelanguageid = data.id;
    updateFrameState(activeDetail, () => {
      form && form.setFieldsValue({ 'name': data.name });
    });
    this.setState({ visible: false });
  };
  // 显示图标名
  setIcon = selected => {
    const { id } = selected[0] || {};
    this.props.form.setFieldsValue({
      iconId: id,
    });
  };
  // 关闭配置弹窗
  handleCloseModal = () => {
    this.setState({ visibleConfig: false });
    this.context.dispatch({
      type: 'bundleConfig/clearState',
    });
  };
  // 打开配置弹窗
  handleOpenModal = () => {
    const { activeDetail } = this.props;
    const { langLib } = this.context;
    this.context.dispatch({
      type: 'bundleConfig/updateState',
      payload: { bundleData: activeDetail },
    });
    if (!activeDetail.id) {
      CMessage(langLib['message.error.noBundle'], 'error');
    } else {
      this.setState({ visibleConfig: true });
    }
  };
  // 生成表单项
  getFormItems = () => {
    const { activeDetail = {}, bundleFrameTypeList = [] } = this.props;
    const frameTypeOption = bundleFrameTypeList && bundleFrameTypeList.map(item => <Option value={+item.id}
                                                                                           key={`bundleFrameType${item.id}`}>{item.name}</Option>);
    return [
      {
        key: 'sno',
        label: <FormattedMessage id="global.index"/>,
        config: {
          initialValue: activeDetail.sno,
        },
        component: <CInput/>,
      }, {
        key: 'name',
        label: <FormattedMessage id="global.name"/>,
        config: {
          initialValue: activeDetail.name,
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }],
        },
        component: <CAutoComplete
          onChange={(value) => this.handleChange(value)}
          // onSearch={value => this.handleSeach(value)}
          // combobox={true}
          // onSelect={(value, option) => this.handleSelect(value, option)}
          // dataSource={this.returnSelectOption()}
          // onBlur={(value) => this.blurCheck(value, index, record, 'displayName')}
          handleClick={() => this.relationLanguageTemplate()}
        />,
      }, {
        key: 'mobileFrameTypeId',
        label: <FormattedMessage id="global.frameType"/>,
        config: {
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }],
          initialValue: activeDetail.mobileFrameTypeId,
        },
        component: (
          <CSelect onChange={mobileFrameTypeId => this.props.updateFrameState({
            activeDetail: {
              ...activeDetail,
              mobileFrameTypeId,
            },
          })}
          >
            {frameTypeOption}
          </CSelect>
        ),
      }, {
        key: 'iconId',
        label: <FormattedMessage id="element.icon"/>,
        config: {
          initialValue: activeDetail.iconId,
        },
        component: (
          <SearchSelect
            modalContentType="icon"
            showType="icon"
            setSelected={this.setIcon}
          />
        ),
      }, {
        key: 'memo',
        label: <FormattedMessage id="global.memo"/>,
        config: {
          initialValue: activeDetail.memo,
        },
        colSpan: 24,
        component: <CTextArea/>,
      },
    ];
  };

  render() {
    const { form, activeDetail, loading } = this.props;
    const { visibleConfig, visible } = this.state;
    const noBundleConfigType = [2, 3]; // 类型为【数据下载框架】和【离线点检框架】不需要进行组件配置
    const LanguageGroupTypeProps = {
      type: 'addChooseBtn',
      isAsyncTree: true,
      chooseCallbackFun: this.handleRelatinLanguageTemplate,
      templateId: activeDetail.namelanguageid === -1 ? null : activeDetail.namelanguageid,
    };
    return (
      <div className={styles.wrap}>
        <CSpin spinning={loading}>
          <SplitLine title={<FormattedMessage id="splitLine.title.basic"/>}/>
          <div className={styles.contentWrap}>
            <div className={styles.form}>
              <FormItems
                formConfigs={this.getFormItems()}
                form={form}
                loading={false}
              />
            </div>
            {/* {!noBundleConfigType.includes(activeDetail.mobileFrameTypeId) && <div className={styles.phoneWrap}>
              <CButton className={styles.btn} onClick={this.handleOpenModal}>
                <i className="iconfont icon-setting custom-color" />
                <FormattedMessage id="bundleConfig.design" />
              </CButton>
              <img src={phoneImg} />
            </div>} */}
          </div>
          <CreateModal
            className={styles.configModal}
            title={<FormattedMessage id="bundleConfig.modal.title"/>}
            visible={visibleConfig}
            onCancel={this.handleCloseModal}
            // maskClosable={false}
            footer={null}
            size="large"
          >
            <MobileTabPaneContainer/>
          </CreateModal>
          <CreateModal
            visible={visible}
            size={'large'}
            footer={null}
            title={<FormattedMessage id="settingForm.relationLanguageTemplate"/>}
            onCancel={() => this.setState({ visible: false })}
          >
            <LanguageGroupType {...LanguageGroupTypeProps}/>
          </CreateModal>
        </CSpin>
      </div>
    );
  }
}

export default BundleDetail;
