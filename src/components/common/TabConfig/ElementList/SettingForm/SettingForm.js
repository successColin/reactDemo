/*
 * @Author: Fus
 * @Date:   2019-08-08 11:45:17
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-10-29 14:44:17
 * @Desc: 高级设置的表单
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { Radio, Select, Form, AutoComplete, Input, Tooltip, Icon } from 'antd';
import copy from 'copy-to-clipboard';
import {
  CInput,
  SearchSelect,
  CSelect,
  CMessage,
  CButton,
  CTextArea,
  ColorPicker,
} from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import FormItems from '@/components/common/FormItems/FormItems';
import TriggerConfig from '../TriggerConfig/TriggerConfig';
import FilterConfig from '../FilterConfig/FilterConfig';
import MultiRelateTable from '../MultiRelateTable/MultiRelateTable';
import FieldRelateTable from '../FieldRelateTable/FieldRelateTable';
import CompositeControl from '../CompositeControl/CompositeControl';
import LanguageGroupType from '@/components/LanguageGroupType/LanguageGroupType';
import MultiMenuJumpConfig from '@/components/common/TabConfig/ElementList/MultiMenuJumpConfig/MultiMenuJumpConfig';
import { BOOL_TYPE, BOOL_VALUE_MAP, BaseContext, JUMP_TYPE } from '@/constants/global';
import { BTN_ELEMENT_TYPE, ELEMENT_NEED_QR_TYPE } from '@/constants/element';
import {
  RELATION_COLUMN_TYPE,
  ELEMENT_DETAIL_CONFIG,
  SELECT_ELEMETN_TYPE,
  SEARCH_SELECT_TYPE,
  SELECT_FORMAT_TYPE,
  SEARCH_SELECT_FORMAT_TYPE,
  NORMAL_BTN_FORMAT_TYPE,
  EXPORT_BTN_FORMAT_TYPE,
  INPUT_FORMAT_TYPE,
  UPLOAD_ELEMENT_FORMAT,
  FILTER_ELEMENT_TYPE,
  HASE_JUMP_TO_FILE_TYPE,
  TAB_IN_SUBPANEL,
  UPLOAD_ELEMENT_TYPE,
  QR_FORMAT_TYPE,
  NOT_NEED_SEARCH_BTN,
  NEED_DATAFORMAT_TYPE,
} from '@/constants/element';
import {
  SQLEDITOR_APPLY_TO_TABLE_TYPE,
  SEARCH_SELECT_SHOW_TYPE,
  LABEL_VALUE_FIELD_TYPE,
  DATA_FORMAT_TYPE,
  SELECT_OF_NORMALBTN_TYPE,
  EXPORT_DATA_FORMAT_TYPE,
} from '@/constants/pageConfig';
import {
  insertOrUpdateElementFiledRelation,
  insertOrUpdateElementMultiRelation,
  insertOrUpdateMenuConfig,
  insertOrUpdateConfig,
} from '@/services/pageConfig';
import styles from './SettingForm.less';
import { JSON_TEMPLATE_FILE, JSON_EXECUTECONDITION_TEMPLATE_FILE } from '@/constants/triggerState';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const { Search } = Input;
const { Option } = Select;
const { Option: AutoCompleteOption } = AutoComplete;
// 是否的选择项
const boolOptions = BOOL_TYPE.map(item => <Radio value={BOOL_VALUE_MAP[item]}
                                                 key={`bool_${BOOL_VALUE_MAP[item]}`}
><FormattedMessage
  id={item}
/></Radio>);

// 字段值类型
const relationColumnTypeOptions = Object.keys(RELATION_COLUMN_TYPE).map(item => <Option value={+item}
                                                                                        key={`columnType_${RELATION_COLUMN_TYPE[item]}`}
>{RELATION_COLUMN_TYPE[item]}</Option>);

// 应用于表类型（小水滴）
const applyToTableOptions = Object.keys(SQLEDITOR_APPLY_TO_TABLE_TYPE).map(item => <Option value={+item}
                                                                                           key={`applyTo_${SQLEDITOR_APPLY_TO_TABLE_TYPE[item]}`}
><FormattedMessage
  id={SQLEDITOR_APPLY_TO_TABLE_TYPE[item]}
/></Option>);

// 选择框展示类型
const selectShowTypes = Object.keys(SEARCH_SELECT_SHOW_TYPE).map(item => <Option value={+item}
                                                                                 key={`selectShowTypes_${SEARCH_SELECT_SHOW_TYPE[item]}`}
><FormattedMessage
  id={SEARCH_SELECT_SHOW_TYPE[item]}
/></Option>);

// 跳转类型
const jumpTypes = Object.keys(JUMP_TYPE).map(item => <Option value={+item}
                                                             key={`jump_${JUMP_TYPE[item]}`}><FormattedMessage
  id={JUMP_TYPE[item]}/></Option>);

// label取值字段类型
const labelValueFieldType = Object.keys(LABEL_VALUE_FIELD_TYPE).map(item => <Option value={+item}
                                                                                    key={`selectShowTypes_${LABEL_VALUE_FIELD_TYPE[item]}`}
><FormattedMessage
  id={LABEL_VALUE_FIELD_TYPE[item]}
/></Option>);

// 普通按钮上选择数据配置
const normalBtnTypes = Object.keys(SELECT_OF_NORMALBTN_TYPE).map(item => <Option value={+item}
                                                                                 key={`normal_${SELECT_OF_NORMALBTN_TYPE[item]}`}
><FormattedMessage
  id={SELECT_OF_NORMALBTN_TYPE[item]}
/></Option>);

class SettingForm extends FormItems {
  static contextType = BaseContext;
  static defaultProps = {
    isPC: true, // PC还是APP
  };
  state = {
    visibleMultiRelate: false, // 多级关联条件弹框
    multiRelateList: [], // 多级关联条件数据
    FiledRelateList: [], // 多级关联条件数据
    multiMenuList: [], // 多菜单跳转
    visibleMenuConfig: false, // 多菜单调整弹框
    loadingSaveMultiRelate: false,
    visibleConfig: false, // 控件配置属性
    visibleList: [], // 控件属性列表数据
    visibleFiledRelate: false, // 字段关联关系弹框
    templateSet: { visible: false, index: '', fieldKey: '', record: {}, action: 'change', value: '' },
  };

  setWrapState = itemObj => {
    this.setState(itemObj);
  };
  // 失去焦点是做具体的判断
  blurCheck = (value, record, key) => {
    const { setRowData, activeRow, activeRowIndex } = this.props;
    setRowData({
      key,
      value: value,
      record,
      index: activeRowIndex,
    });
  };
  // 保存控件配置
  handleSaveConfig = () => {
    const { visibleList } = this.state;
    const { langLib } = this.context;
    const { activeRow = {} } = this.props;
    const params = {
      elementId: activeRow.id,
      combinationInfoList: visibleList,
    };
    this.setState({ loadingSaveMultiRelate: true });
    insertOrUpdateConfig(params).then(res => {
      CMessage(langLib['message.save.success']);
      this.setState({ loadingSaveMultiRelate: false, visibleConfig: false });
    }, err => this.setState({ loadingSaveMultiRelate: false }));
  };
  // 保存多级关联条件
  handleSaveMultiRelate = () => {
    const { multiRelateList } = this.state;
    const { langLib } = this.context;
    const { activeRow = {} } = this.props;
    const params = {
      elementId: activeRow.id,
      elementMultiRelationPramList: multiRelateList,
    };
    this.setState({ loadingSaveMultiRelate: true });
    insertOrUpdateElementMultiRelation(params).then(res => {
      CMessage(langLib['message.save.success']);
      this.setState({ loadingSaveMultiRelate: false, visibleMultiRelate: false });
    }, err => this.setState({ loadingSaveMultiRelate: false }));
  };
  // 保存字段关联条件
  handleSaveFiledRelate = () => {
    const { FiledRelateList } = this.state;
    const { langLib } = this.context;
    const { activeRow = {} } = this.props;
    let index = FiledRelateList.findIndex(item => !item.mainColumn || !item.relationColumn);
    if (index !== -1) {
      CMessage(langLib['messge.error.require'](index + 1), 'error');
      return;
    }
    const params = {
      elementId: activeRow.id,
      multiChoiceColumnRelationPramList: FiledRelateList,
    };
    this.setState({ loadingSaveMultiRelate: true });
    insertOrUpdateElementFiledRelation(params).then(res => {
      CMessage(langLib['message.save.success']);
      this.setState({ loadingSaveMultiRelate: false, visibleFiledRelate: false });
    }, err => this.setState({ visibleFiledRelate: false }));
  };
  // 保存菜单跳转配置
  handleSaveMenuRelation = () => {
    const { multiMenuList } = this.state;
    const { activeRow } = this.props;
    const { id: elementId } = activeRow;
    const { langLib } = this.context;
    const params = {
      jumpMenuPramDtoList: multiMenuList,
      elementId,
    };
    this.setState({ loadingSaveMultiRelate: true });
    insertOrUpdateMenuConfig(params).then(res => {
      CMessage(langLib['message.save.success']);
      this.setState({ loadingSaveMultiRelate: false, visibleMenuConfig: false });
    }, err => this.setState({ loadingSaveMultiRelate: false }));
  };
  // 业务表字段修改
  handleChangeRelationColumnName = (selectedRows) => {
    const { setRowData, activeRowIndex, activeRow = {}, tabInfo } = this.props;
    const { dataSourceType } = tabInfo;
    const selected = selectedRows[0] && selectedRows[0] || {};
    let value = dataSourceType === 2 ? selected.paramKey : selected.columnName;
    setRowData({
      key: 'relationColumnName',
      value: value || '',
      record: activeRow,
      index: activeRowIndex,
    });
    // 设置业务表字段类型
    setRowData({
      key: 'relationColumnType',
      value: selected.columnType || '',
      record: {
        ...activeRow,
        relationColumnName: value || '',
      },
      index: activeRowIndex,
    });
  };
  // 复制模板
  handleCopyTemplate = (template) => {
    const { langLib } = this.context;
    if (copy(template)) {
      CMessage(langLib['message.copy.success']);
    } else {
      CMessage(langLib['message.copy.error']);
    }
  };
  // 格式类型下拉数据
  getFormatOptions = (basetype) => {
    let typeLib = null;
    let elementFormatLabel = 'settingForm.elementFormat';
    // 下拉框
    if (SELECT_ELEMETN_TYPE.includes(basetype)) {
      typeLib = SELECT_FORMAT_TYPE;
    } else if (SEARCH_SELECT_TYPE.includes(basetype)) {
      // 选择框
      typeLib = SEARCH_SELECT_FORMAT_TYPE;
    } else if (BTN_ELEMENT_TYPE.includes(basetype) && basetype !== 30) { // 普通按钮
      typeLib = NORMAL_BTN_FORMAT_TYPE;
      elementFormatLabel = 'settingForm.refreshType';
    } else if (basetype === 30) { // 导出按钮
      typeLib = EXPORT_BTN_FORMAT_TYPE;
      elementFormatLabel = 'settingForm.exportType';
    } else if (basetype === 1) { // 输入框
      typeLib = INPUT_FORMAT_TYPE;
    } else if (basetype === 8 || basetype === 13) { // 图片上传
      typeLib = UPLOAD_ELEMENT_FORMAT;
    } else if (basetype === 50) { // 二维码
      typeLib = QR_FORMAT_TYPE;
    }
    if (!typeLib) {
      return {
        elementFormatOptions: [],
        elementFormatLabel,
      };
    }
    const elementFormatOptions = Object.keys(typeLib).map(item => <Option value={+item} key={`format_${typeLib[item]}`}><FormattedMessage
      id={typeLib[item]}
    /></Option>);
    return {
      elementFormatOptions,
      elementFormatLabel,
    };
  };

  // 数据格式下拉数据
  getDataOptions = (basetype) => {
    let typeLib = null;
    let dataFormatLabel = 'settingForm.dataFormat';
    if (basetype === 9) {
      typeLib = DATA_FORMAT_TYPE;
    } else if (basetype === 30) {
      typeLib = EXPORT_DATA_FORMAT_TYPE;
      dataFormatLabel = 'settingForm.exportDataFormat';
    }
    if (!typeLib) {
      return {
        dataFormatOptions: [],
        dataFormatLabel,
      };
    }
    const dataFormatOptions = Object.keys(typeLib).map(item => <Option value={+item}
                                                                       key={`format_${typeLib[item]}`}><FormattedMessage
      id={typeLib[item]}
    /></Option>);
    return {
      dataFormatLabel,
      dataFormatOptions,
    };
  };

  // 设置多选框是否能生成多条数据，而且一个面板只允许一个多选组件生成设置能生成多条数据
  checkCheckBoxIsTrue = (baseType, checkMultiChoiceIsExist, activeRow) => {
    if (baseType !== 45) return true; // 如果控件不是多选控件，不显示该字段
    if (baseType === 45 && !checkMultiChoiceIsExist) return false; // 如果是多选控件,而且没有多选控件设置多选，则显示该字段
    // 如果是多选控件,多选控件设置多选并且是当前控件，则显示该字段
    if (baseType === 45 && checkMultiChoiceIsExist && activeRow.id === checkMultiChoiceIsExist.id) return false;
    // 如果是多选控件,多选控件设置多选并且不是当前控件，则不显示该字段
    if (baseType === 45 && checkMultiChoiceIsExist && activeRow.id !== checkMultiChoiceIsExist.id) return true;

  };
  // 生成表单项
  getFormConfigs = () => {
    const { tabElementList, setRowData, activeRowIndex, activeRow = {}, tabInfo, tabList = [], form, doSaveFrameTab, isPC, framePage } = this.props;
    const { basetype: frameType } = framePage.frameTypeDto;
    const { getFieldDecorator } = this.props.form;
    const { basetype } = activeRow;
    const checkMultiChoiceIsExist = tabElementList.find(item => item.basetype === 45 && item.elementFormat === 1);
    // 格式类型
    const { elementFormatLabel, elementFormatOptions } = this.getFormatOptions(basetype);
    // 数据类型
    const { dataFormatLabel, dataFormatOptions } = this.getDataOptions(basetype);
    // 关联弹出面板
    const tabOptions = tabList.filter(item => item.id !== tabInfo.id).map(item => <Option key={item.id}
                                                                                          value={item.id}
    >{item.name}</Option>);
    // 主页关联弹出面板
    const homeFrameTabOptions = tabList.filter(item => item.id !== tabInfo.id && item.showType === 1)
      .map(item => <Option key={item.id} value={item.id}>{item.name}</Option>);


    // 选择框弹出列表
    const selectPopupListOptions = tabList.filter(item => item.basetype === 7).map(item => <Option key={item.id}
                                                                                                   value={item.id}
    >{item.name}</Option>);
    // 首页报表框架 + 主面板
    const isHomeFrame = frameType === 8 && tabInfo.mainTab;
    const { dataSourceType, commonApiHeaderId = '' } = tabInfo;
    // 表单中的数据选择框才有选择类型，列表中大部分控件都有，类型37一定有
    let isJumpType = [1, 4, 5].includes(tabInfo.showType) ? ELEMENT_DETAIL_CONFIG.hasJumpTypes.indexOf(basetype) === -1 : (tabInfo.showType === 2 ? ELEMENT_DETAIL_CONFIG.hasMultiRelation.indexOf(basetype) === -1 : true);
    if (basetype === 37) isJumpType = false;
    const jumpType = {
      key: 'ignore-jumpType',
      label: <FormattedMessage id="settingForm.jumpType"/>,
      colSpan: 8,
      config: {
        initialValue: activeRow.jumpType,
      },
      ignore: isJumpType,
      component: (
        <CSelect   // 下拉选择，值为1，关联面板，值为2，关联菜单，值为3，面板，菜单都不显示，值为null，都显示
          onChange={value => setRowData({
            key: 'jumpType',
            value,
            record: activeRow,
            index: activeRowIndex,
          })}
        >
          <Option value={3}><FormattedMessage id="global.null"/></Option>
          {jumpTypes}
        </CSelect>
      ),
    };
    const returnPassParams = {
      key: 'ignore-passParam',
      label: <Fragment>
        <Tooltip
          title={(
            <Fragment>
              <FormattedMessage id="global.template"/>
              <span className={styles.copyEntry} onClick={() => this.handleCopyTemplate(JSON_TEMPLATE_FILE)}>
                  <FormattedMessage id="global.clickToCopy"/>
                </span>
              {JSON_TEMPLATE_FILE}
            </Fragment>
          )}
        >
          <div className={styles.tipTri}>
            <FormattedMessage id="settingForm.file.relation.data"/>
            <Icon type="question-circle" style={{ marginLeft: 5 }}/>
          </div>
        </Tooltip>
      </Fragment>,
      colSpan: 24,
      config: {
        initialValue: activeRow.passParam || '',
      },
      ignore: basetype === 37 ? (!(activeRow.jumpType === 2 || activeRow.jumpType === null)) : !HASE_JUMP_TO_FILE_TYPE.includes(basetype), // 只有汇总，普通按钮，小水滴展示
      component: (
        <CTextArea
          onBlur={e => setRowData({
            key: 'passParam',
            value: e.target.value,
            record: activeRow,
            index: activeRowIndex,
          })}
          maxLength={2000}
        />
      ),
    };
    const executeCondition = { // 执行条件，只有按钮上才有
      key: 'ignore-executeCondition',
      label: <Fragment>
        <Tooltip
          title={(
            <Fragment>
              <FormattedMessage id="global.template"/>
              <span className={styles.copyEntry}
                    onClick={() => this.handleCopyTemplate(JSON_EXECUTECONDITION_TEMPLATE_FILE)}>
                  <FormattedMessage id="global.clickToCopy"/>
              </span>
              {JSON_EXECUTECONDITION_TEMPLATE_FILE}
            </Fragment>
          )}
        >
          <div className={styles.tipTri}>
            <FormattedMessage id="settingForm.file.executeCondition"/>
            <Icon type="question-circle" style={{ marginLeft: 5 }}/>
          </div>
        </Tooltip>
      </Fragment>,
      colSpan: 24,
      config: {
        initialValue: activeRow.executeCondition || '',
      },
      ignore: !BTN_ELEMENT_TYPE.includes(basetype), // 只有按钮才显示
      component: (
        <CTextArea
          onBlur={e => setRowData({
            key: 'executeCondition',
            value: e.target.value,
            record: activeRow,
            index: activeRowIndex,
          })}
          maxLength={1000}
        />
      ),
    };
    // 汇总控件
    if (basetype === 37) {
      return [
        {
          key: 'ignore-sql',
          label: 'SQL',
          colSpan: 24,
          config: {
            initialValue: activeRow.chartSummarySql || '',
          },
          component: (
            <CTextArea
              onBlur={e => setRowData({
                key: 'chartSummarySql',
                value: e.target.value,
                record: activeRow,
                index: activeRowIndex,
              })}
            />
          ),
        }, {
          key: 'ignore-colorCode',
          label: <FormattedMessage id="settingForm.colorCode"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.colorCode || '',
          },
          component: (
            <ColorPicker
              placement="right"
              color={activeRow.colorCode || ''}
              handleSaveColor={value => setRowData({
                key: 'colorCode',
                value,
                record: activeRow,
                index: activeRowIndex,
              })}
            >
              <CInput
                value={activeRow.colorCode || ''}
                onBlur={e => setRowData({
                  key: 'colorCode',
                  value: e.target.value,
                  record: activeRow,
                  index: activeRowIndex,
                })}
              />
            </ColorPicker>
          ),
        }, {
          key: 'ignore-iconId',
          label: <FormattedMessage id="element.icon"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.iconId || '',
          },
          component: (
            <SearchSelect
              modalContentType="icon"
              showType="icon"
              setSelected={selectedRows => setRowData({
                key: 'iconId',
                value: selectedRows[0] && selectedRows[0].id || '',
                record: activeRow,
                index: activeRowIndex,
              })}
            />
          ),
        },
        jumpType,
        {
          key: 'ignore-bundleId',
          label: <FormattedMessage id="settingForm.bundleId"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.relationBundleId || '',
            subInitialValue: activeRow.bundlePramDto ? activeRow.bundlePramDto.name : '',
          },
          ignore: isPC,
          hasHidden: true,
          component: (
            <SearchSelect
              modalContentType="bundle"
              showType="tree"
              setSelected={selectedRows => setRowData({
                key: 'relationBundleId',
                value: selectedRows.length ? selectedRows[0].id : '',
                record: activeRow,
                index: activeRowIndex,
                subKey: 'bundlePramDto',
                subValue: selectedRows.length ? selectedRows[0] : {},
              })}
            />
          ),
        },
        {
          key: 'ignore-functionId',
          subKey: 'functionDto',
          label: <FormattedMessage id="settingForm.functionId"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.relationFunctionId || '',
            subInitialValue: activeRow.functionDto ? activeRow.functionDto.name : '',
          },
          ignore: !isPC || !(activeRow.jumpType === 2),
          hasHidden: true,
          component: (
            <SearchSelect
              modalContentType="function"
              showType="tree"
              setSelected={selectedRows => setRowData({
                key: 'relationFunctionId',
                value: selectedRows.length ? selectedRows[0].id : '',
                record: activeRow,
                index: activeRowIndex,
                subKey: 'functionDto',
                subValue: selectedRows.length ? selectedRows[0] : {},
              })}
            />
          ),
        },
        {
          key: 'ignore-relationTabId',
          label: <FormattedMessage id="tab.type.relate"/>,
          colSpan: 8,
          ignore: !isPC || !(activeRow.jumpType === 1),
          config: {
            initialValue: activeRow.relationTabId || '',
          },
          component: (
            <CSelect
              // disabled={fromType === 'pageConfig'}
              onChange={value => setRowData({
                key: 'relationTabId',
                value,
                record: activeRow,
                index: activeRowIndex,
              })}
            >
              <Option value={null}><FormattedMessage id="global.null"/></Option>
              {homeFrameTabOptions}
            </CSelect>
          ),
        },
        returnPassParams,
      ];
    } else if (basetype === 42) { // 子面板
      // 关联弹出面板
      const tabOptions = tabList.filter(item => item.id !== tabInfo.id && TAB_IN_SUBPANEL.includes(item.showType)).map(item =>
        <Option
          key={item.id} value={item.id}>{item.name}</Option>);
      return [{
        key: 'ignore-relationTabId',
        label: <FormattedMessage id="tab.type.relate"/>,
        colSpan: 8,
        config: {
          initialValue: activeRow.relationTabId || '',
        },
        component: (
          <CSelect
            // disabled={fromType === 'pageConfig'}
            onChange={value => setRowData({
              key: 'relationTabId',
              value,
              record: activeRow,
              index: activeRowIndex,
            })}
          >
            <Option value={null}><FormattedMessage id="global.null"/></Option>
            {tabOptions}
          </CSelect>
        ),
      }];
    } else if (basetype === 43 || basetype === 44) {
      return [{
        key: 'elementMultiRelation',
        colSpan: 8,
        comType: 'custom',
        component: (
          <CButton className={styles.muneConfig} onClick={() => this.setState({ visibleMenuConfig: true })}>
            {basetype === 43 ? <FormattedMessage id="settingForm.modal.muneConfig"/> :
              <FormattedMessage id="settingForm.modal.tabConfig"/>}
          </CButton>
        ),
      }, executeCondition];
    } else if (basetype === 47) {
      return [{
        key: 'elementMultiRelation',
        colSpan: 8,
        comType: 'custom',
        ignore: isPC,
        component: (
          <CButton className={styles.muneConfig} onClick={() => this.setState({ visibleConfig: true })}>
            <FormattedMessage id="settingForm.modal.compositeControlConfig"/>
          </CButton>
        ),
      }];
    } else {
      // let isRelationTabId = (
      //   tabInfo.showType === 1
      //   || tabInfo.showType === 4
      //   || tabInfo.showType === 5
      // ) ? false
      //   : (
      //     ELEMENT_DETAIL_CONFIG.hasRelationTab.indexOf(basetype) === -1
      //     || isHomeFrame
      //   );
      // 关联弹出面板
      let isRelationTabId = true, isRelationMenu = true;
      const isTrue = ELEMENT_DETAIL_CONFIG.hasRelationTab.indexOf(basetype) === -1;
      const isTrueInList = ELEMENT_DETAIL_CONFIG.hasRelationTabInList.indexOf(basetype) === -1;
      if (activeRow.jumpType === null || activeRow.jumpType === 1) { // 如果没

        isRelationTabId = (
          tabInfo.showType === 1
          || tabInfo.showType === 4
          || tabInfo.showType === 5
          || tabInfo.baseType === 8
        ) ? isTrueInList
          : (
            isTrue
            || isHomeFrame
          );
        isRelationMenu = true;
      } else if (activeRow.jumpType === 2) {
        isRelationTabId = true;
        isRelationMenu = (
          tabInfo.showType === 1
          || tabInfo.showType === 4
          || tabInfo.showType === 5
        ) ? isTrueInList
          : (
            isTrue
            || isHomeFrame
          );
      } else if (activeRow.jumpType === 3) {
        isRelationTabId = true;
        isRelationMenu = true;
      }
      return [
        {
          key: 'ignore-defaultValue',
          label: <FormattedMessage id="settingForm.defaultValue"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.defaultValue || '',
          },
          component: (
            <CInput
              onBlur={e => setRowData({
                key: 'defaultValue',
                value: e.target.value,
                record: activeRow,
                index: activeRowIndex,
              })}
            />
          ),
        },
        {
          key: 'ignore-placeholderText',
          label: <FormattedMessage id="settingForm.placeholderText"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.placeholderText || '',
          },
          component: (
            <Search
              onSearch={() => this.relationLanguageTemplate(activeRowIndex, activeRow, 'placeholderText')}
              onChange={(e) => {
                let value = e.target.value;
                this.setState({
                  templateSet: {
                    fieldKey: 'displayName',
                    index: activeRowIndex,
                    record: activeRow,
                    action: '',
                    value: value,
                  },
                }, () => {
                  activeRow.placeholderTextLanguageId = -1;
                  this.blurCheck(value, activeRow, 'placeholderText');
                });
              }
              }
            />
          ),
        },
        {
          key: 'ignore-tooltipText',
          label: <FormattedMessage id="settingForm.tooltipText"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.tooltipText || '',
          },
          component: (
            <Search
              onSearch={() => this.relationLanguageTemplate(activeRowIndex, activeRow, 'tooltipText')}
              onChange={(e) => {
                let value = e.target.value;
                this.setState({
                  templateSet: {
                    fieldKey: 'tooltipText',
                    index: activeRowIndex,
                    record: activeRow,
                    action: '',
                    value: value,
                  },
                }, () => {
                  activeRow.tooltipTextLanguageId = -1;
                  this.blurCheck(value, activeRow, 'tooltipText');
                });
              }
              }
            />
          ),
        },
        {
          key: 'ignore-mainTableName',
          label: <FormattedMessage id="settingForm.mainTableName"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.mainTableName || '',
          },
          ignore: ELEMENT_DETAIL_CONFIG.hasMainTable.indexOf(basetype) === -1,
          component: (
            <SearchSelect
              modalContentType="relateTable"
              showType="list"
              setSelected={selectedRows => setRowData({
                key: 'mainTableName',
                value: selectedRows[0] && selectedRows[0].tableName || '',
                record: activeRow,
                index: activeRowIndex,
              })}
            />
          ),
        }, {
          key: 'ignore-mainColumnName',
          label: <FormattedMessage id="settingForm.mainColumnName"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.mainColumnName || '',
          },
          ignore: ELEMENT_DETAIL_CONFIG.hasMainTable.indexOf(basetype) === -1,
          component: (
            <SearchSelect
              modalContentType="tableColumn"
              showType="list"
              otherQueryParams={{ tableName: activeRow.mainTableName }}
              selectConfig={{
                isMulti: false,
                keyName: 'columnName',
              }}
              setSelected={selectedRows => setRowData({
                key: 'mainColumnName',
                value: selectedRows[0] && selectedRows[0].columnName || '',
                record: activeRow,
                index: activeRowIndex,
              })}
            />
          ),
        }, {
          key: 'ignore-relationTableName',
          label: <FormattedMessage id="settingForm.relationTableName"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.relationTableName || '',
          },
          ignore: dataSourceType === 2 || tabInfo.basetype === 6 || isHomeFrame,
          component: (
            <SearchSelect
              modalContentType="relateTable"
              showType="list"
              otherQueryParams={{ initialData: 0 }}
              setSelected={selectedRows => setRowData({
                key: 'relationTableName',
                value: selectedRows[0] && selectedRows[0].tableName || '',
                record: activeRow,
                index: activeRowIndex,
              })}
            />
          ),
        }, {
          key: 'ignore-relationColumnName',
          label: <FormattedMessage id="settingForm.relationColumnName"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.relationColumnName || '',
          },
          ignore: !(
            !(ELEMENT_DETAIL_CONFIG.noRelationColumnName.includes(basetype))
            || (UPLOAD_ELEMENT_TYPE.includes(basetype) && activeRow.elementFormat === 2)
          ),
          component: isHomeFrame ? (
            <CInput
              onBlur={e => setRowData({
                key: 'parameter',
                value: e.target.value,
                record: activeRow,
                index: activeRowIndex,
              })}
            />
          ) : (
            <SearchSelect
              modalContentType={dataSourceType === 2 ? 'fromApi' : 'tableColumn'}
              showType="list"
              otherQueryParams={dataSourceType === 2 ? {
                commonApiHeaderId,
                tag: 2,
              } : { tableName: activeRow.relationTableName }}
              selectConfig={dataSourceType === 2 ? {
                isMulti: false,
                keyName: 'keywords',
              } : {
                isMulti: false,
                keyName: 'columnName',
              }}
              setSelected={this.handleChangeRelationColumnName}
            />
          ),
        }, {
          key: 'relationColumnType',
          label: <FormattedMessage id="settingForm.relationColumnType"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.relationColumnType || '',
          },
          ignore: ELEMENT_DETAIL_CONFIG.noRelationColumnName.indexOf(basetype) !== -1 || isHomeFrame,
          component: (
            <CSelect
              disabled
            >
              {relationColumnTypeOptions}
            </CSelect>
          ),
        }, {
          key: 'ignore-qrCode',
          label: <FormattedMessage id="settingForm.scanName"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.qrCode || '',
          },
          ignore: !ELEMENT_NEED_QR_TYPE.includes(basetype),
          component: (
            <SearchSelect
              modalContentType="tableColumn"
              showType="list"
              otherQueryParams={{ tableName: activeRow.mainTableName }}
              selectConfig={{
                isMulti: false,
                keyName: 'columnName',
              }}
              setSelected={selectedRows => {
                setRowData({
                  key: 'qrCode',
                  value: selectedRows[0] && selectedRows[0].columnName || '',
                  record: activeRow,
                  index: activeRowIndex,
                });
              }
              }
            />
          ),
        }, {
          key: 'ignore-relationTabId',
          label: <FormattedMessage id="settingForm.relationTabId"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.relationTabId || '',
          },
          // ignore: (
          //   tabInfo.showType === 1
          //   || tabInfo.showType === 4
          //   || tabInfo.showType === 5
          // ) ? false
          //   : (
          //     ELEMENT_DETAIL_CONFIG.hasRelationTab.indexOf(basetype) === -1
          //     || isHomeFrame
          //   ),
          ignore: isRelationTabId,
          component: (
            <CSelect
              onChange={value => setRowData({
                key: 'relationTabId',
                value,
                record: activeRow,
                index: activeRowIndex,
              })}
            >
              <Option value={null}><FormattedMessage id="global.null"/></Option>
              {tabOptions}
            </CSelect>
          ),
        }, {
          key: 'ignore-quickQuery',
          label: <FormattedMessage id="settingForm.quickQuery"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.quickQuery,
          },
          // ignore:  tabInfo.basetype === 6 || basetype === 8 || isHomeFrame,
          ignore: (!([1, 3, 4, 5].includes(tabInfo.showType) && !NOT_NEED_SEARCH_BTN.includes(basetype))) || isHomeFrame,
          component: (
            <RadioGroup
              onChange={e => setRowData({
                key: 'quickQuery',
                value: e.target.value,
                record: activeRow,
                index: activeRowIndex,
              })}
            >
              {boolOptions}
            </RadioGroup>
          ),
        }, {
          key: 'elementMultiRelation',
          colSpan: 8,
          comType: 'custom',
          ignore: ELEMENT_DETAIL_CONFIG.hasMultiRelation.indexOf(basetype) === -1,
          component: (
            <FormItem
              key="elementMultiRelation"
              label={<FormattedMessage id="settingForm.elementMultiRelation"/>}
              colon={false}
            >
              {getFieldDecorator('elementMultiRelation', {
                initialValue: activeRow.elementMultiRelation || 0,
              })(
                <RadioGroup
                  onChange={e => setRowData({
                    key: 'elementMultiRelation',
                    value: e.target.value,
                    record: activeRow,
                    index: activeRowIndex,
                  })}
                >
                  {boolOptions}
                </RadioGroup>,
              )}
              {activeRow.elementMultiRelation === 1 &&
              <CButton onClick={() => this.setState({ visibleMultiRelate: true })}>
                <FormattedMessage id="settingForm.triggerMultiRelate"/>
              </CButton>}
            </FormItem>
          ),
        }, {
          key: 'elementFormat',
          colSpan: 8,
          comType: 'custom',
          ignore: this.checkCheckBoxIsTrue(basetype, checkMultiChoiceIsExist, activeRow),
          component: (
            <FormItem
              key="elementFormat"
              label={<FormattedMessage id="settingForm.multiple.data"/>}
              colon={false}
            >
              {getFieldDecorator('elementFormat', {
                initialValue: activeRow.elementFormat || 0,
              })(
                <RadioGroup
                  onChange={e => setRowData({
                    key: 'elementFormat',
                    value: e.target.value,
                    record: activeRow,
                    index: activeRowIndex,
                  })}
                >
                  {boolOptions}
                </RadioGroup>,
              )}
              {activeRow.elementFormat === 1 &&
              <CButton onClick={() => this.setState({ visibleFiledRelate: true })}>
                <FormattedMessage id="settingForm.filedMultiRelate"/>
              </CButton>}
            </FormItem>
          ),
        }, {
          key: 'canDisplayName',
          label: <FormattedMessage id="settingForm.canDisplayName"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.canDisplayName,
          },
          ignore: isPC && tabInfo.showType !== 3 && tabInfo.showType !== 9, // 只有PC面板类型为【框架-左侧列表】或者【进度流程面板】时才有该字段
          component: (
            <RadioGroup
              onChange={e => setRowData({
                key: 'canDisplayName',
                value: e.target.value,
                record: activeRow,
                index: activeRowIndex,
              })}
            >
              {boolOptions}
            </RadioGroup>
          ),
        }, {
          key: 'ignore-selectShowType',
          label: <FormattedMessage id="settingForm.selectShowType"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.selectShowType || '',
          },
          ignore: !SEARCH_SELECT_TYPE.includes(basetype),
          component: (
            <CSelect
              onChange={value => setRowData({
                key: 'selectShowType',
                value,
                record: activeRow,
                index: activeRowIndex,
              })}
            >
              {selectShowTypes}
            </CSelect>
          ),
        }, {
          key: 'ignore-parameter',
          label: <FormattedMessage id="settingForm.parameter"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.parameter || '',
          },
          ignore: basetype === 27,
          component: (
            <CInput
              onBlur={e => setRowData({
                key: 'parameter',
                value: e.target.value,
                record: activeRow,
                index: activeRowIndex,
              })}
            />
          ),
        }, {
          key: 'ignore-elementFormat',
          label: <FormattedMessage id={elementFormatLabel}/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.elementFormat || '',
          },
          ignore: !(
            SELECT_ELEMETN_TYPE.includes(basetype)
            || basetype === 8
            || basetype === 13
            || basetype === 24
            || basetype === 50
            || BTN_ELEMENT_TYPE.includes(basetype)
            || (basetype === 1 && !isPC)
          ),
          component: (
            <CSelect
              onChange={value => setRowData({
                key: 'elementFormat',
                value,
                record: activeRow,
                index: activeRowIndex,
              })}
            >
              {elementFormatOptions}
            </CSelect>
          ),
        }, {
          key: 'ignore-valueFieldType',
          label: <FormattedMessage id="settingForm.valueFieldType"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.valueFieldType || '',
          },
          ignore: basetype !== 17,
          component: (
            <CSelect
              onChange={value => setRowData({
                key: 'valueFieldType',
                value,
                record: activeRow,
                index: activeRowIndex,
              })}
            >
              {labelValueFieldType}
            </CSelect>
          ),
        },
        jumpType,
        {
          key: 'ignore-colorCode',
          label: <FormattedMessage id="settingForm.colorCode"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.colorCode || '',
          },
          ignore: !isPC || basetype !== 27,
          component: (
            <ColorPicker
              placement="right"
              color={activeRow.colorCode || ''}
              handleSaveColor={value => setRowData({
                key: 'colorCode',
                value,
                record: activeRow,
                index: activeRowIndex,
              })}
            >
              <CInput
                value={activeRow.colorCode || ''}
                onBlur={e => setRowData({
                  key: 'colorCode',
                  value: e.target.value,
                  record: activeRow,
                  index: activeRowIndex,
                })}
              />
            </ColorPicker>
          ),
        }, {
          key: 'ignore-applyToTable',
          label: <FormattedMessage id="settingForm.applyToTable"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.applyToTable || '',
          },
          ignore: !isPC || basetype !== 27, // 只有PC【小水滴】时才有该字段
          component: (
            <CSelect
              onChange={value => setRowData({
                key: 'applyToTable',
                value,
                record: activeRow,
                index: activeRowIndex,
              })}
            >
              {applyToTableOptions}
            </CSelect>
          ),
        }, {
          key: 'ignore-resourceManagerSql',
          label: <FormattedMessage id="settingForm.resourceManagerSql"/>,
          colSpan: 24,
          config: {
            initialValue: activeRow.resourceManagerSql || '',
          },
          ignore: !isPC || basetype !== 27, // 只有【小水滴】时才有该字段
          component: (
            <CTextArea
              onBlur={e => setRowData({
                key: 'resourceManagerSql',
                value: e.target.value,
                record: activeRow,
                index: activeRowIndex,
              })}
              maxLength={2000}
            />
          ),
        }, {
          key: 'ignore-url',
          label: 'url',
          colSpan: 24,
          config: {
            initialValue: activeRow.url || '',
          },
          ignore: !(basetype === 32 || basetype === 24), // 图片展示、普通按钮有url
          component: (
            <CTextArea
              onBlur={e => setRowData({
                key: 'url',
                value: e.target.value,
                record: activeRow,
                index: activeRowIndex,
              })}
              maxLength={500}
            />
          ),
        }, {
          key: 'ignore-stateid',
          label: <FormattedMessage id="settingForm.relationStateid"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.stateId || '',
          },
          ignore: !UPLOAD_ELEMENT_TYPE.includes(basetype), // 图片上传
          component: (
            <SearchSelect
              modalContentType="state"
              selectConfig={{
                isMulti: false,
                keyName: 'name',
              }}
              setSelected={selectedRows => setRowData({
                key: 'stateId',
                value: selectedRows[0] && selectedRows[0].id || '',
                record: activeRow,
                index: activeRowIndex,
              })}
            />
          ),
        }, {
          key: 'ignore-typeid',
          label: <FormattedMessage id="settingForm.relationTypeid"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.typeId || '',
          },
          ignore: !UPLOAD_ELEMENT_TYPE.includes(basetype), // 图片上传
          component: (
            <SearchSelect
              modalContentType="type"
              selectConfig={{
                isMulti: false,
                keyName: 'name',
              }}
              setSelected={selectedRows => setRowData({
                key: 'typeId',
                value: selectedRows[0] && selectedRows[0].id || '',
                record: activeRow,
                index: activeRowIndex,
              })}
            />
          ),
        }, {
          key: 'ignore-priority',
          label: <FormattedMessage id="settingForm.relationPriorityid"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.priorityId || '',
          },
          ignore: !UPLOAD_ELEMENT_TYPE.includes(basetype), // 图片上传
          component: (
            <SearchSelect
              modalContentType="priority"
              selectConfig={{
                isMulti: false,
                keyName: 'name',
              }}
              setSelected={selectedRows => setRowData({
                key: 'priorityId',
                value: selectedRows[0] && selectedRows[0].id || '',
                record: activeRow,
                index: activeRowIndex,
              })}
            />
          ),
        }, {
          key: 'ignore-watermark', // 水印模板
          label: <FormattedMessage id="settingForm.Watermark.template"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.waterMarkName || '',
            subInitialValue: activeRow.waterMarkId || '',
          },
          ignore: basetype !== 8, // 图片上传
          component: (
            <SearchSelect
              modalContentType="waterMarkId"
              selectConfig={{
                isMulti: false,
                keyName: 'keywords',
              }}
              setSelected={selectedRows => setRowData({
                key: 'waterMarkName',
                value: selectedRows[0] && selectedRows[0].name || '',
                record: activeRow,
                index: activeRowIndex,
                subKey: 'waterMarkId',
                subValue: selectedRows[0] ? selectedRows[0].id : '',
              })}
            />
          ),
        }, {
          key: 'ignore-selectSearchPopupList',
          label: <FormattedMessage id="settingForm.selectSearchPopupList"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.selectListTabId || '',
          },
          ignore: !SEARCH_SELECT_TYPE.includes(basetype), // 数据选择框可见
          component: (
            <CSelect
              onChange={value => setRowData({
                key: 'selectListTabId',
                value,
                record: activeRow,
                index: activeRowIndex,
              })}
            >
              <Option value=""><FormattedMessage id="global.null"/></Option>
              {selectPopupListOptions}
            </CSelect>
          ),
        }, {
          key: 'ignore-dataFormat',
          label: <FormattedMessage id={dataFormatLabel}/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.dataFormat || 0,
          },
          ignore: !NEED_DATAFORMAT_TYPE.includes(basetype), // 数据格式
          component: (
            <CSelect
              onChange={value => setRowData({
                key: 'dataFormat',
                value,
                record: activeRow,
                index: activeRowIndex,
              })}
            >
              {dataFormatOptions}
            </CSelect>
          ),
          // }, {
          //   key: 'ignore-canBatch',
          //   label: <FormattedMessage id="settingForm.canBatch" />,
          //   colSpan: 8,
          //   config: {
          //     initialValue: activeRow.canBatch || '',
          //   },
          //   ignore: basetype !== 7,
          //   component: (
          //     <RadioGroup
          //       onChange={e => setRowData({
          //         key: 'canBatch',
          //         value: e.target.value,
          //         record: activeRow,
          //         index: activeRowIndex,
          //       })}
          //     >
          //       {boolOptions}
          //     </RadioGroup>
          //   ),
        }, {
          key: 'ignore-jumpBundleId',
          label: <FormattedMessage id="settingForm.bundleId"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.jumpBundleId || '',
            subInitialValue: activeRow.jumpBundleId && activeRow.bundlePramDto ? activeRow.bundlePramDto.name : '',
          },
          ignore: !HASE_JUMP_TO_FILE_TYPE.includes(basetype) || isPC,
          hasHidden: true,
          component: (
            <SearchSelect
              modalContentType="bundle"
              showType="tree"
              setSelected={selectedRows => {
                setRowData({
                  key: 'jumpBundleId',
                  value: selectedRows[0] && selectedRows[0].id || '',
                  record: activeRow,
                  index: activeRowIndex,
                  subKey: 'bundlePramDto',
                  subValue: selectedRows[0] || activeRow.bundlePramDto || '',
                });
              }}
            />
          ),
        }, {
          key: 'ignore-functionId',
          subKey: 'jumpFunctionId',
          label: <FormattedMessage id="settingForm.functionId"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.jumpFunctionId || '',
            subInitialValue: activeRow.functionDto && activeRow.functionDto ? activeRow.functionDto.name : '',
          },
          ignore: !isPC || !HASE_JUMP_TO_FILE_TYPE.includes(basetype),
          hasHidden: true,
          component: (
            <SearchSelect
              modalContentType="function"
              showType="tree"
              setSelected={(selectedRows = []) => {
                setRowData({
                  key: 'jumpFunctionId',
                  value: selectedRows[0] && selectedRows[0].id || '',
                  record: activeRow,
                  index: activeRowIndex,
                  subKey: 'functionDto',
                  subValue: selectedRows[0] ? selectedRows[0] : {},
                });
              }}
            />
          ),
        }, returnPassParams,
        {
          key: 'RelationMenu',
          colSpan: 8,
          comType: 'custom',
          ignore: isRelationMenu,
          component: (
            <CButton className={styles.muneConfig} onClick={() => this.setState({ visibleMenuConfig: true })}>
              <FormattedMessage id="settingForm.modal.muneConfig"/>

            </CButton>
          ),
        },
        executeCondition,
        {
          key: 'ignore-defaultConditions',
          label: <FormattedMessage id="settingForm.select.normal"/>,
          colSpan: 8,
          config: {
            initialValue: activeRow.defaultConditions || 0,
          },
          ignore: basetype !== 24, // 数据格式
          component: (
            <CSelect
              onChange={value => setRowData({
                key: 'defaultConditions',
                value,
                record: activeRow,
                index: activeRowIndex,
              })}
            >
              {normalBtnTypes}
            </CSelect>
          ),
        },
      ];
    }
  };
  // 根据字段返回对应的模板id
  returnFieldLanguageId = (key) => {
    let fieldName = null;
    if (key === 'placeholderText') {
      fieldName = 'placeholderTextLanguageId';
    } else if (key === 'tooltipText') {
      fieldName = 'tooltipTextLanguageId';
    } else if (key === 'displayName') {
      fieldName = 'displayLanguageId';
    }
    return fieldName;
  };
  // 点击弹出语言模板方便新增并且记录下对应的数据
  relationLanguageTemplate = (index, record, key) => {
    this.setState({
      templateSet: {
        visible: true,
        fieldKey: key,
        index,
        record,
      },
    });
  };
  // 选择对应的模板语言
  handleRelatinLanguageTemplate = (data) => {
    const { templateSet } = this.state;
    const { fieldKey, index, record } = templateSet;
    let key = this.returnFieldLanguageId(fieldKey);
    record[key] = data.id;
    this.setState({
      templateSet: {
        visible: false,
        fieldKey,
        index,
        record,
        action: 'check',
        value: data.name,
      },
    }, () => {
      this.blurCheck(data.name, record, fieldKey);
      setTimeout(() => {
        const { form } = this.props;
        form && form.setFieldsValue({
          [`ignore-${fieldKey}`]: data.name,
        });
      }, 0);
    });
  };

  render() {
    const { tabList = [], activeRow = {}, tabInfo, form, doSaveFrameTab, tabElementList, isPC } = this.props;
    const { visibleList, visibleConfig, FiledRelateList, visibleFiledRelate, multiMenuList, visibleMenuConfig, visibleMultiRelate, multiRelateList, loadingSaveMultiRelate, templateSet } = this.state;
    const { basetype, mainTableName, triggerSign } = activeRow;
    const templateID = templateSet.record[this.returnFieldLanguageId(templateSet.fieldKey)] === -1 || templateSet.record[this.returnFieldLanguageId(templateSet.fieldKey)] === '-1' ? null : templateSet.record[this.returnFieldLanguageId(templateSet.fieldKey)];
    const LanguageGroupTypeProps = {
      type: 'addChooseBtn',
      isAsyncTree: true,
      chooseCallbackFun: this.handleRelatinLanguageTemplate,
      templateId: templateID,
    };
    const renderFilter = ((FILTER_ELEMENT_TYPE.includes(basetype) || SEARCH_SELECT_TYPE.includes(basetype)) && mainTableName) ? (
      <FilterConfig
        elementData={activeRow}
        tabInfo={tabInfo}
        isPC={isPC}
      >
        <div className={styles.trigger}>
          <span className="iconfont icon-trigger-filter custom-color"/>
          <FormattedMessage id="settingForm.filterId"/>
        </div>
      </FilterConfig>
    ) : (
      <div className={`${styles.trigger} ${styles.disabled}`}>
        <span className="iconfont icon-trigger-filter"/>
        <FormattedMessage id="settingForm.filterId"/>
      </div>
    );
    return (
      <div className={styles.wrap}>
        <FormItems
          formConfigs={this.getFormConfigs()}
          form={form}
          loading={false}
        />
        <div className={styles.triggerWrap}>
          <div className={`${styles.trigger} ${styles.disabled}`}>
            <span className="iconfont icon-trigger-blocker"/>
            <FormattedMessage id="settingForm.interceptorId"/>
          </div>
          <div className={`${styles.trigger} ${styles.disabled}`}>
            <span className="iconfont icon-trigger-watcher"/>
            <FormattedMessage id="settingForm.watcherId"/>
          </div>
          {renderFilter}
          <TriggerConfig
            elementData={activeRow}
            tabInfo={tabInfo}
            doSaveFrameTab={doSaveFrameTab}
            tabElementList={tabElementList}
          >
            <div className={styles.trigger}>
              <span className="iconfont icon-trigger-strike custom-color"/>
              {!!triggerSign && <span className="iconfont icon-new custom-color"/>}
              <FormattedMessage id="settingForm.triggerId"/>
            </div>
          </TriggerConfig>
        </div>
        <CreateModal   // 多级实体关联关系配置
          visible={visibleMultiRelate}
          title={<FormattedMessage id="settingForm.modal.multiRelate"/>}
          onCancel={() => this.setState({ visibleMultiRelate: false })}
          onOk={this.handleSaveMultiRelate}
          confirmLoading={loadingSaveMultiRelate}
        >
          <MultiRelateTable
            elementData={activeRow}
            setWrapState={this.setWrapState}
            multiRelateList={multiRelateList}
          />
        </CreateModal>
        <CreateModal   // 字段关联关系配置
          visible={visibleFiledRelate}
          title={<FormattedMessage id="settingForm.modal.filedRelate"/>}
          onCancel={() => this.setState({ visibleFiledRelate: false })}
          onOk={this.handleSaveFiledRelate}
          confirmLoading={loadingSaveMultiRelate}
        >
          <FieldRelateTable
            elementData={activeRow}
            setWrapState={this.setWrapState}
            multiRelateList={FiledRelateList}
          />
        </CreateModal>


        <CreateModal   // 控件属性配置
          visible={visibleConfig}
          title={<FormattedMessage id="settingForm.modal.compositeControlConfig"/>}
          onCancel={() => this.setState({ visibleConfig: false })}
          onOk={this.handleSaveConfig}
          confirmLoading={loadingSaveMultiRelate}
        >
          <CompositeControl
            elementData={activeRow}
            setWrapState={this.setWrapState}
            tabElementList={tabElementList}
            visibleList={visibleList}
          />
        </CreateModal>


        <CreateModal  // 多菜单配置
          visible={visibleMenuConfig}
          title={basetype === 43 ? <FormattedMessage id="settingForm.modal.muneConfig"/> :
            <FormattedMessage id="settingForm.modal.tabConfig"/>}
          onCancel={() => this.setState({ visibleMenuConfig: false })}
          onOk={this.handleSaveMenuRelation}
          confirmLoading={loadingSaveMultiRelate}
        >
          <MultiMenuJumpConfig
            elementData={activeRow}
            isPC={isPC}
            tabList={tabList}
            setWrapState={this.setWrapState}
            multiMenuList={multiMenuList}
          />
        </CreateModal>

        <CreateModal // 模板设置
          visible={templateSet.visible}
          size={'large'}
          footer={null}
          title={<FormattedMessage id="settingForm.relationLanguageTemplate"/>}
          onCancel={() => this.setState({ templateSet: { visible: false, fieldKey: '', index: '', record: {} } })}
        >
          <LanguageGroupType {...LanguageGroupTypeProps} />
        </CreateModal>
      </div>
    );
  }
}

export default SettingForm;
