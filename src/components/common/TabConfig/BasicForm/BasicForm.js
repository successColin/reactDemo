/*
 * @Author: Fus
 * @Date:   2019-08-21 13:34:09
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-04-02 18:39:43
 * @Desc: 面板的基础属性
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Select, Radio, Form, AutoComplete } from 'antd';
import { connect } from 'dva';
import { BaseContext } from '@/constants/global';
import LanguageGroupType from '@/components/LanguageGroupType/LanguageGroupType';
import {
  CInput,
  CSelect,
  CInputNumber,
  SearchSelect,
  CButton,
  CMessage,
  CAutoComplete,
} from '@/components/common/BasicWidgets';
import {
  PAGE_TAB_TYPE,
  PAGE_TAB_SHOW_TYPE,
  NOT_NEED_DATASOURCE_TYPES,
  NOT_NEED_DATASOURCE_SHOW_TYPES,
} from '@/constants/pageConfig';
import FormItems from '@/components/common/FormItems/FormItems';
import {
  BOOL_TYPE,
  BOOL_VALUE_MAP,
  VALID_REQUIRED_MESSAGE,
  DATASOURCE_TYPE,
  BOOL_VALUE_MAP_IN_LIST,
} from '@/constants/global';
import query from '@/constants/query';
import styles from './BasicForm.less';
import { searchLanguageTempalteByLikeName } from '@/services/pageConfig';
import CreateModal from '@/components/common/CreateModal/CreateModal';

// 是否的选择项
const boolOptions = BOOL_TYPE.map(item => <Radio value={BOOL_VALUE_MAP[item]}
                                                 key={`bool_${BOOL_VALUE_MAP[item]}`}
><FormattedMessage
  id={item}
/></Radio>);

const { Option } = Select;
const { Option: AutoCompleteOption } = AutoComplete;
// 面板类型下拉项
const tabTypeOptions = Object.keys(PAGE_TAB_TYPE).map(item => <Option key={`tabType-${item}`}
                                                                      value={+item}
><FormattedMessage
  id={PAGE_TAB_TYPE[item]}
/></Option>);
// 面板展示类型下拉项
const tabShowTypeOptions = Object.keys(PAGE_TAB_SHOW_TYPE).map(item => <Option key={`tabType-${item}`}
                                                                               value={+item}
><FormattedMessage
  id={PAGE_TAB_SHOW_TYPE[item]}
/></Option>);
// 获取数据源类型下拉项
const dataSourceTypeOptions = Object.keys(DATASOURCE_TYPE).map(item => <Option key={`tabType-${item}`}
                                                                               value={+item}
><FormattedMessage
  id={DATASOURCE_TYPE[item]}
/></Option>);

const editInListType = Object.keys(BOOL_VALUE_MAP_IN_LIST).map(item => <Radio key={`tabType-${item}`}
                                                                              value={+item}
><FormattedMessage
  id={BOOL_VALUE_MAP_IN_LIST[item]}
/></Radio>);

const editListOfBaseType = [1, 2, 3]; // 允许修改列表的面板
const editListOfShowType = [1, 4]; // 允许修改列表的展示类型

@connect(state => ({
  framePage: state.framePage,
  reportDomain: state.global.reportDomain,
  bundleConfig: state.bundleConfig,
}))
class BasicForm extends Component {
  static contextType = BaseContext;
  state = {
    selectObj: [],
    visible: false,
    templateId: null,
  };
  // 表单数据更新
  handleItemChange = (key, val) => {
    // 设置编辑状态
    this.props.setEditStatus();
    const { modelName } = this.props;
    const { tabBasicData } = this.props[modelName];
    let data = {};
    if (key === 'dataSourceType' && val === 1) {
      data = { relationTableName: '' };
    } else if (key === 'dataSourceType' && val === 2) {
      data = { commonApiHeaderId: '' };
    } else if (key === 'showType' && val === 11) {
      data = { commonApiHeaderId: '', relationTableName: '' };
    }
    this.context.dispatch({
      type: `${modelName}/updateState`,
      payload: {
        tabBasicData: {
          ...tabBasicData,
          ...data,
          [key]: val,
        },
      },
    });
  };
  // 跳转至报表编辑器
  handleConfigReport = () => {
    const { reportDomain } = this.props;
    const { tabBasicData = {}, tabList = [], frameTypeDto = {} } = this.props.framePage;
    let reportUrl = `${reportDomain}${query.REPORT_DESIGNER}`;
    // 已有报表文件则跳转至编辑页，否则为新增
    if (tabBasicData.areportFileName) {
      reportUrl = reportUrl + `?_u=file:${tabBasicData.areportFileName}`;
    }
    window.open(reportUrl, '', 'alwaysRaised: 1');
  };

  // 数据变化
  handleChange = (value) => {
    this.props.setEditStatus();
    const { modelName } = this.props;
    const { tabBasicData } = this.props[modelName];
    this.context.dispatch({
      type: `${modelName}/updateState`,
      payload: {
        tabBasicData: {
          ...tabBasicData,
          name: value,
          namelanguageid: -1,
        },
      },
    });
  };
  handleRelatinLanguageTemplate = (data) => {
    this.setState({
      visible: false,
      templateId: null,
    }, () => {
      this.props.setEditStatus();
      const { modelName, form } = this.props;
      const { tabBasicData } = this.props[modelName];
      this.context.dispatch({
        type: `${modelName}/updateState`,
        payload: {
          tabBasicData: {
            ...tabBasicData,
            name: data.name,
            namelanguageid: data.id,
          },
        },
      });
      form && form.setFieldsValue({ 'name': data.name });
    });
  };
  // 关联语言模板
  relationLanguageTemplate = () => {
    const { modelName } = this.props;
    const { tabBasicData } = this.props[modelName];
    this.setState({ visible: true, templateId: tabBasicData.namelanguageid });
  };
  // 表单配置项
  getFormConfigs = () => {
    const { langLib } = this.context;
    const { modelName, isPC } = this.props;
    const { tabBasicData = {}, mobileTabList = [], frameTypeDto = {}, apiList = [] } = this.props[modelName];
    const tabOptions = mobileTabList.filter(item => item.id !== tabBasicData.id).map(item => <Option key={item.id}
                                                                                                     value={item.id}
    >{item.name}</Option>);
    const commonApiOptions = apiList.map(item => <Option key={item.id} value={item.id}>{item.name}</Option>);
    const colSpan = isPC ? 12 : 9;
    const configs = [
      {
        key: 'name',
        label: <FormattedMessage id="pageConfig.tab.name"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.name,
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }, {
            whitespace: true,
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
      },
      {
        key: 'basetype',
        label: <FormattedMessage id="pageConfig.tab.type"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.basetype,
        },
        component: (
          <CSelect onChange={val => this.handleItemChange('basetype', val)}>
            {tabTypeOptions}
          </CSelect>
        ),
      }, {
        key: 'showType',
        label: <FormattedMessage id="pageConfig.tab.showType"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.showType,
        },
        component: (
          <CSelect onChange={val => this.handleItemChange('showType', val)}>
            {tabShowTypeOptions}
          </CSelect>
        ),
      }, {
        key: 'dataSourceType',
        label: <FormattedMessage id="pageConfig.tab.dataSource.type"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.dataSourceType || 1,
        },
        ignore: NOT_NEED_DATASOURCE_TYPES.includes(tabBasicData.basetype) || NOT_NEED_DATASOURCE_SHOW_TYPES.includes(tabBasicData.showType), // 资源管理器面板、关联文件面板不用数据源
        component: (
          <CSelect onChange={val => this.handleItemChange('dataSourceType', val)}>
            {dataSourceTypeOptions}
          </CSelect>
        ),
      }, {
        key: 'relationTableName',
        label: <FormattedMessage id="pageConfig.tab.originData"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.relationTableName,
        },
        ignore: (tabBasicData.basetype === 6 || tabBasicData.showType === 7) || tabBasicData.dataSourceType === 2 || NOT_NEED_DATASOURCE_SHOW_TYPES.includes(tabBasicData.showType), // 资源管理器面板、关联文件面板不用数据源
        component: (
          <SearchSelect
            modalContentType="relateTable"
            showType="list"
            otherQueryParams={{ initialData: 0 }}
            setSelected={selectedRows => this.handleItemChange('relationTableName', selectedRows.length ? selectedRows[0].tableName : '')}
          />
        ),
      }, {
        key: 'commonApiHeaderId',
        label: <FormattedMessage id="pageConfig.tab.API.dataSource"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.commonApiHeaderId,
        },
        ignore: (tabBasicData.basetype === 6 || tabBasicData.showType === 7) || tabBasicData.dataSourceType === 1 || !tabBasicData.dataSourceType, // 资源管理器面板、关联文件面板不用数据源
        component: (
          <CSelect onChange={val => this.handleItemChange('commonApiHeaderId', val)}>
            {commonApiOptions}
          </CSelect>
        ),
      }, {
        key: 'visiabled',
        label: <FormattedMessage id="pageConfig.tab.visible"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.visiabled,
        },
        component: (
          <Radio.Group onChange={e => this.handleItemChange('visiabled', e.target.value)}>
            {boolOptions}
          </Radio.Group>
        ),
      }, {
        key: 'mainTab',
        label: <FormattedMessage id="pageConfig.tab.mainTab"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.mainTab,
        },
        component: (
          <Radio.Group onChange={e => this.handleItemChange('mainTab', e.target.value)}>
            {boolOptions}
          </Radio.Group>
        ),
      }, {
        key: 'relationTabId',
        label: <FormattedMessage id="pageConfig.tab.jumpTo"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.relationTabId,
        },
        ignore: isPC || tabBasicData.showType === 11,
        component: (
          <CSelect onChange={val => this.handleItemChange('relationTabId', val)}>
            <Option value=""><FormattedMessage id="global.null"/></Option>
            {tabOptions}
          </CSelect>
        ),
      }, {
        key: 'sno',
        label: <FormattedMessage id="global.order"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.sno,
        },
        component: <CInputNumber onBlur={e => this.handleItemChange('sno', e.target.value)}/>,
      },
    ];
    // 业务关联框架时需要展示关联字段
    if (tabBasicData.showType === 4) {
      configs.push({
        key: 'relationColumn',
        label: <FormattedMessage id="pageConfig.tab.relateField"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.relationColumn,
        },
        component: (
          <SearchSelect
            modalContentType="tableColumn"
            showType="list"
            otherQueryParams={{ tableName: tabBasicData.relationTableName }}
            selectConfig={{
              isMulti: false,
              keyName: 'columnName',
            }}
            setSelected={selectedRows => this.handleItemChange('relationColumn', selectedRows.length ? selectedRows[0].columnName : '')}
          />
        ),
      });
    }
    // 只有是引入外部页面的展示类型才会显示
    if (tabBasicData.showType === 11) {
      configs.push({
        key: 'jumpUrl',
        label: <FormattedMessage id="pageConfig.tab.jumpUrl"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.jumpUrl,
        },
        component: (
          <CInput onBlur={e => this.handleItemChange('jumpUrl', e.target.value)} maxLength={100}/>
        ),
      });
    }
    // 报表框架需要配置报表入口
    if (frameTypeDto.basetype === 5) {
      configs.push({
        key: 'areportFileName',
        label: <FormattedMessage id="pageConfig.tab.reportFileName"/>,
        config: {
          initialValue: tabBasicData.areportFileName,
        },
        component: <CInput/>,
      }, {
        key: 'report-config',
        comType: 'static',
        component: (
          <CButton style={{ marginLeft: 115 }} onClick={this.handleConfigReport}>
            <FormattedMessage id="pageConfig.tab.reportConfig"/>
          </CButton>
        ),
      });
    }
    // 流程审批面板需要增加流程配置按钮
    if (tabBasicData.basetype === 5) {
      configs.push({
        key: 'report-config',
        comType: 'static',
        component: (
          <CButton style={{ marginLeft: 115 }}
                   onClick={() => CMessage(langLib['message.error.noFlowApprove'], 'error')}
          >
            <FormattedMessage id="pageConfig.tab.flowApprove"/>
          </CButton>
        ),
      });
    }
    // 只有普通面板或者弹出面板是列表类型才显示是否编辑
    if (editListOfShowType.includes(tabBasicData.showType) && editListOfBaseType.includes(tabBasicData.basetype) && isPC) {
      configs.push({
        key: 'canLineEdit',
        label: <FormattedMessage id="pageConfig.tab.list_edit"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.canLineEdit || 2,
        },
        component: (
          <Radio.Group onChange={e => this.handleItemChange('canLineEdit', e.target.value)}>
            {editInListType}
          </Radio.Group>
        ),
      });
    }
    // 关联资料面板需要配置参数
    if (tabBasicData.showType === 7) {
      configs.push({
        key: 'fileRelationTableName',
        label: <FormattedMessage id="pageConfig.tab.fileRelationTableName"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.fileRelationTableName,
          rules: [{
            required: true,
            message: VALID_REQUIRED_MESSAGE,
          }],
        },
        component: (
          <SearchSelect
            modalContentType="relateTable"
            showType="list"
            otherQueryParams={{ initialData: 0 }}
            setSelected={selectedRows => this.handleItemChange('fileRelationTableName', selectedRows.length ? selectedRows[0].tableName : '')}
          />
        ),
      }, {
        key: 'fileRelationParam',
        label: <FormattedMessage id="pageConfig.tab.fileRelationParam"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.fileRelationParam,
        },
        component: <CInput onBlur={e => this.handleItemChange('fileRelationParam', e.target.value)}/>,
      },{
        key: 'tableGroupName',
        label: <FormattedMessage id="pageConfig.tab.fileRelationGroupTableName"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.tableGroupName,
        },
        component: (
          <SearchSelect
            modalContentType="relateTable"
            showType="list"
            otherQueryParams={{ initialData: 0 }}
            setSelected={selectedRows => this.handleItemChange('tableGroupName', selectedRows.length ? selectedRows[0].tableName : '')}
          />
        ),
      },{
        key: 'fileRelationColumnName',
        label: <FormattedMessage id="pageConfig.tab.fileRelationColumnName"/>,
        colSpan,
        config: {
          initialValue: tabBasicData.fileRelationColumnName,
        },
        component: (
          <SearchSelect
            modalContentType="tableColumn"
            showType="list"
            selectConfig={{
              isMulti: false,
              keyName: 'columnName',
            }}
            otherQueryParams={{ tableName: tabBasicData.fileRelationTableName }}
            setSelected={selectedRows => this.handleItemChange('fileRelationColumnName', selectedRows.length ? selectedRows[0].columnName : '')}
          />
        ),
      });
    }
    return configs;
  };

  render() {
    const { modelName, isPC, form } = this.props;
    const { tabBasicData = {}, mobileTabList = [], frameTypeDto = {} } = this.props[modelName];
    const { visible } = this.state;
    const LanguageGroupTypeProps = {
      type: 'addChooseBtn',
      isAsyncTree: true,
      chooseCallbackFun: this.handleRelatinLanguageTemplate,
      templateId: (tabBasicData.namelanguageid === -1 || tabBasicData.namelanguageid === '-1') ? null : tabBasicData.namelanguageid,
    };
    return (
      <div className={styles.wrap}>
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
          onCancel={() => this.setState({ visible: false, templateId: null })}
        >
          <LanguageGroupType {...LanguageGroupTypeProps} />
        </CreateModal>
      </div>
    );
  }
}

export default BasicForm;
