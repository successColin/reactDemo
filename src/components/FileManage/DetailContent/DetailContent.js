import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Select, Checkbox, Radio, AutoComplete } from 'antd';
import { CTextArea, CSelect, CInput, SearchSelect, SplitLine, CAutoComplete } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import LanguageGroupType from '@/components/LanguageGroupType/LanguageGroupType';

import { VALID_REQUIRED_MESSAGE } from '@/constants/global';
import { searchLanguageTempalteByLikeName } from '@/services/pageConfig';
import { controlAuthority } from '@/utils/common';
import { HASE_JUMP_TO_FILE_TYPE } from '@/constants/element';

const { Option: AutoCompleteOption } = AutoComplete;
const { Option } = Select;

class FileConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      selectObj: [],
    };
  }

  // 根据选择的关联表，带出字段、编码、名称等
  setRelateTables = selected => {
    const detial = selected[0] || {};
    let Obj = {};
    Object.keys(detial).forEach((item) => {
      Obj[item] = detial[item];
    });
    Obj.defaultframeName = detial.name;
    this.props.form.setFieldsValue(Obj);
    this.props.setDefaultframeId(Obj.id);
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

  // 显示图标名
  setIcon = selected => {
    let { activeDetail, updateFrameState } = this.props;
    // selected.length && this.props.form.setFieldsValue({
    //   iconId: selected.length ? selected[0].id : '',
    // });
    activeDetail.iconName = selected.length ? selected[0].name : '';
    activeDetail.iconId = selected.length ? selected[0].id : '';
    updateFrameState(activeDetail);
  };
  // 显示图标名
  setRootId = selected => {
    let { activeDetail, updateFrameState } = this.props;
    if (selected.length && selected[0].id === activeDetail.id) return;
    activeDetail.rootName = selected.length ? selected[0].name : '';
    activeDetail.rootId = selected.length ? selected[0].id : 1;
    updateFrameState(activeDetail);
  };
  handleRelatinLanguageTemplate = (data) => {
    let { activeDetail, updateFrameState, form } = this.props;
    activeDetail.name = data.name;
    activeDetail.namelanguageid = data.id;
    updateFrameState(activeDetail, () => {
      form && form.setFieldsValue({ name: data.name });
    });
    this.setState({ visible: false });
  };
  // 获取表单项配置
  getFormConfigs = () => {
    const {
      activeDetail: data = {},
      activeTreeNodeDetail = {},
      actionType,
      updateFrameState,
      isInitialData,
      optionList,
      user,
    } = this.props;
    const { isGroup } = activeTreeNodeDetail;
    let showGroup = isGroup;
    let selectOtion = optionList.map(item => {
      return <Option value={item.id} key={item.id}>{item.name}</Option>;
    });
    if (actionType === 'addElement') showGroup = false;
    const { basetype = 'select' } = data;
    const publicProps = { disabled: isInitialData };
    // 分割线 - 基本属性
    const basicLine = {
      key: 'basicLine-base',
      comType: 'static',
      colSpan: 24,
      component: <SplitLine title={<FormattedMessage id="splitLine.title.basic"/>}/>,
    };
    let result = controlAuthority(user.functionList, data.rootId);
    let rootName = '';
    if (result.length) {
      rootName = result[0].name;
    }
    // 分割线 - 其他信息
    const belongLine = {
      key: 'basicLine-props',
      comType: 'static',
      colSpan: 24,
      component: <SplitLine title={<FormattedMessage id="global.else"/>}/>,
    };
    // 基本信息
    const publicBasicConfig = [
      basicLine,
      // {
      //   key: 'defaultframeName',
      //   colSpan: 12,
      //   label: <FormattedMessage id="filemanger.table.choose"/>,
      //   config: {
      //     initialValue: data.defaultframeName,
      //   },
      //   component: <SearchSelect
      //     {...publicProps}
      //     modalContentType="relateMenu"
      //     selectConfig={{
      //       isMulti: false,
      //       keyName: 'id',
      //     }}
      //     showType="list"
      //     listName="menu"
      //     setSelected={this.setRelateTables}
      //   />,
      // },
      {
        key: 'frameTypeId',
        colSpan: 12,
        label: <FormattedMessage id="menu.table.frametypeBasetype"/>,
        config: {
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }],
          initialValue: data.frameTypeId || '',
        },
        component: (
          <CSelect>
            {selectOtion}
          </CSelect>
        ),
      }, {
        key: 'rootId',
        label: <FormattedMessage id="filemanger.table.rootid"/>,
        colSpan: 12,
        config: {
          initialValue: data.rootId || '',
          subInitialValue: rootName,
        },
        hasHidden: true,
        component: (
          <SearchSelect
            modalContentType="function"
            showType="tree"
            setSelected={(selectedRows = []) => {
              this.setRootId(selectedRows);
            }}
          />
        ),
      },
    ];
    // 其他信息
    const propConfig = [
      belongLine, {
        key: 'name',
        colon: false,
        colSpan: 12,
        label: <FormattedMessage id="filemanger.table.menuname"/>,
        config: {
          requre: true,
          initialValue: data.name,
        },
        component: <CAutoComplete
          onChange={(value) => this.handleChange(value)}
          combobox={true}
          handleClick={() => this.relationLanguageTemplate()}
        />,
      }, {
        key: 'iconId',
        label: <FormattedMessage id="element.icon"/>,
        colSpan: 12,
        config: {
          initialValue: data.iconId || '',
        },
        component: (
          <SearchSelect
            modalContentType="icon"
            showType="icon"
            name={data.iconName}
            setSelected={this.setIcon}
          />
        ),
      }, {
        key: 'outside',
        colon: false,
        label: <FormattedMessage id="filemanger.table.module"/>,
        colSpan: 12,
        config: {
          initialValue: data.outside || 1,
        },
        component: (<Radio.Group>
          <Radio value={1}><FormattedMessage id="filemanger.table.in"/></Radio>
          <Radio value={2}><FormattedMessage id="filemanger.table.out"/></Radio>
        </Radio.Group>),
      }, {
        key: 'sno',
        label: <FormattedMessage id="global.index"/>,
        colSpan: 12,
        config: {
          initialValue: data.sno || '',
        },
        component: (
          <CInput/>
        ),
      }, {
        key: 'url',
        label: <FormattedMessage id="filemanger.table.url"/>,
        colSpan: 24,
        config: {
          initialValue: data.url || '',
        },
        component: <CTextArea/>,
      },
    ];
    return [
      ...publicBasicConfig,
      ...propConfig,
    ];
  };

  render() {
    const { form, loading, activeDetail } = this.props;
    const { visible } = this.state;
    const LanguageGroupTypeProps = {
      type: 'addChooseBtn',
      isAsyncTree: true,
      chooseCallbackFun: this.handleRelatinLanguageTemplate,
      templateId: activeDetail.namelanguageid || null,
    };
    return (
      <div>
        <FormItems
          formConfigs={this.getFormConfigs()}
          form={form}
          loading={loading}
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

export default FileConfig;
