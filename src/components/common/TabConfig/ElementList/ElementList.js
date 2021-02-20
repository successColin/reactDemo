/*
 * @Author: Fus
 * @Date:   2019-08-21 13:57:47
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2020-05-09 09:30:56
 * @Desc: 元素列表
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Checkbox, Select, Form, Icon, Modal, AutoComplete, Input } from 'antd';
import classNames from 'classnames';
import { connect } from 'dva';
import update from 'immutability-helper';
import { COLSPAN_TYPE, MOBILE_COLSPAN_TYPE, HOME_CHART_COLSPAN_TYPE, BOARD_COLSPAN_TYPE } from '@/constants/pageConfig';
import { CSelect, CInput, CMessage, CAutoComplete } from '@/components/common/BasicWidgets';
import AdvanceTable from '@/components/common/AdvanceTable/AdvanceTable';
import SettingForm from './SettingForm/SettingForm';
import ChartConfig from './ChartConfig/ChartConfig';
import BoardChartConfig from './BoardChartConfig/BoardChartConfig';
import { deleteUserDesignerTabElement } from '@/services/framePage';
import { deleteUserDesignerMobileTabElement } from '@/services/bundleConfig';
import { NOT_HOME_CHART_FILTER_ELEMENTS } from '@/constants/element';
import { getDefaultConfirmProps } from '@/utils/common';
import { BaseContext } from '@/constants/global';
import styles from './ElementList.less';
import { searchLanguageTempalteByLikeName } from '@/services/pageConfig';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import LanguageGroupType from '@/components/LanguageGroupType/LanguageGroupType';
import ModalBox from '@/components/common/ReminderBox/ReminderBox';

const { Option } = Select;
const { Option: AutoCompleteOption } = AutoComplete;
const { Search } = Input;

@connect(state => ({
  framePage: state.framePage,
  bundleConfig: state.bundleConfig,
}))
class elementList extends Component {
  static contextType = BaseContext;
  state = {
    activeRowIndex: -1, // 当前行索引（用在高级设置里的控件数据绑定）
    loadingStatus: {
      list: false,
    },
    templateSet: { visible: false, index: '', fieldKey: '', record: {}, action: 'change', value: '' },
    selectObj: {},
  };

  // 更新loading状态
  setLoadingStatus = (type, loading) => {
    const { loadingStatus } = this.state;
    this.setState({
      loadingStatus: {
        ...loadingStatus,
        [type]: loading,
      },
    });
  };
  // 获取子组件
  getChildComponent = record => {
    const { basetype } = record;
    const { doSaveFrameTab, form, modelName, isPC, framePage } = this.props;
    const { activeRowIndex } = this.state;
    const { tabBasicData } = this.props[modelName];
    let tabElementList = [];
    let tabList = [];
    if (isPC) {
      const { tabElementList: pcEleList, tabList: pcTabList } = this.props.framePage;
      tabElementList = pcEleList;
      tabList = pcTabList;
    } else {
      const { elementListMap, mobileTabList } = this.props.bundleConfig;
      tabElementList = elementListMap[tabBasicData.id];
      tabList = mobileTabList;
    }
    const eleObj = tabElementList[activeRowIndex] || {};
    const publicProps = {
      isPC,
      tabInfo: tabBasicData,
      activeRowIndex,
      setRowData: this.setRowData,
      openLanguageModal: this.relationLanguageTemplate,
    };
    // 图表控件
    if (basetype === 38) {
      const filterEleList = tabElementList.filter(item => !NOT_HOME_CHART_FILTER_ELEMENTS.includes(item.basetype)) || [];
      return (
        <ChartConfig
          {...publicProps}
          form={form}
          framePage={framePage}
          tabList={tabList}
          eleObj={eleObj}
          filterEleList={filterEleList}
        />
      );
    } else if (basetype === 41) { // 大屏看板图表控件
      return (
        <BoardChartConfig
          {...publicProps}
          eleObj={eleObj}
        />
      );
    }
    return (
      <SettingForm
        {...publicProps}
        framePage={framePage}
        form={form}
        tabList={tabList}
        tabElementList={tabElementList}
        activeRow={eleObj}
        doSaveFrameTab={doSaveFrameTab}
      />
    );
  };
  // 更新数据行
  setRowData = ({ index, record, key, value, subKey, subValue }) => {
    const { isPC } = this.props;
    let tabElementList = [];
    if (isPC) {
      tabElementList = [...this.props.framePage.tabElementList];
    } else {
      const { elementListMap, tabBasicData } = this.props.bundleConfig;
      tabElementList = elementListMap[tabBasicData.id];
    }
    const data = {
      ...record,
      [key]: value,
    };
    if (subKey) data[subKey] = subValue;
    const newList = update(tabElementList, {
      $splice: [[index, 1], [index, 0, data]],
    });
    this.setActiveDetailData({ dataSource: [...newList] });
  };
  // 更新主数据
  setActiveDetailData = ({ dataSource, isDel }) => {
    isDel && this.setState({ activeRowIndex: -1 });
    const { isPC } = this.props;
    if (isPC) {
      this.context.dispatch({
        type: 'framePage/updateState',
        payload: { tabElementList: [...dataSource] },
      });
    } else {
      const { elementListMap, tabBasicData } = this.props.bundleConfig;
      this.context.dispatch({
        type: 'bundleConfig/updateState',
        payload: {
          elementListMap: {
            ...elementListMap,
            [tabBasicData.id]: dataSource,
          },
        },
      });
    }
    this.props.setEditStatus();
  };
  // 设置当前行为高级设置表格的数据
  setActiveRowData = (index) => {
    const { activeRowIndex } = this.state;
    this.props.form.resetFields();
    this.setState({ activeRowIndex: activeRowIndex === index ? -1 : index });
  };
  // 删除行
  handleDelRow = (record, staticDelFun) => {
    const { langLib } = this.context;
    let { close } = ModalBox.confirm({
      ...getDefaultConfirmProps(langLib),
      onOk: () => {
        // 已经保存的走接口删除
        if (record.id) {
          const { isPC } = this.props;
          let params = {};
          let api = isPC ? deleteUserDesignerTabElement : deleteUserDesignerMobileTabElement;
          if (isPC) {
            const { functionId, userDesignerId, tabBasicData } = this.props.framePage;
            params = {
              functionId, userDesignerId, tabId: tabBasicData.id,
              id: record.id,
            };
          } else {
            const { bundleData, tabBasicData, systemParams } = this.props.bundleConfig;
            const { planned, userDesignerId } = systemParams;
            params = {
              bundleId: bundleData.id,
              userDesignerId,
              mobileTabId: tabBasicData.id,
              id: record.id,
              planned,
            };
          }
          api(params).then(res => {
            CMessage(langLib['message.del.success']);
            staticDelFun();
            closeModal();
          });
        } else { // 未保存的直接前端删数据
          staticDelFun();
          closeModal();
        }
      },
      onCancel: () => closeModal(),
    });
    const closeModal = () => {
      close();
    };
    // Modal.confirm({
    //   className: 'customConfirmColor',
    //   ...getDefaultConfirmProps(langLib),
    //   onOk: () => {
    //     // 已经保存的走接口删除
    //     if (record.id) {
    //       const { isPC } = this.props;
    //       let params = {};
    //       let api = isPC ? deleteUserDesignerTabElement : deleteUserDesignerMobileTabElement;
    //       if (isPC) {
    //         const { functionId, userDesignerId, tabBasicData } = this.props.framePage;
    //         params = {
    //           functionId, userDesignerId, tabId: tabBasicData.id,
    //           id: record.id,
    //         };
    //       } else {
    //         const { bundleData, tabBasicData, systemParams } = this.props.bundleConfig;
    //         const { planned, userDesignerId } = systemParams;
    //         params = {
    //           bundleId: bundleData.id,
    //           userDesignerId,
    //           mobileTabId: tabBasicData.id,
    //           id: record.id,
    //           planned,
    //         };
    //       }
    //       return api(params).then(res => {
    //         CMessage(langLib['message.del.success']);
    //         staticDelFun();
    //       });
    //     } else { // 未保存的直接前端删数据
    //       staticDelFun();
    //     }
    //   },
    // });
  };
  // 修改必填校验
  handleChangeRequired = (checked, record, index) => {
    this.setRowData({
      key: 'requisite',
      value: +checked,
      subKey: 'visiabled',
      subValue: checked ? 1 : record.visiabled,
      record,
      index,
    });
  };
  // 修改可见状态
  handleChangeVisible = (checked, record, index) => {
    this.setRowData({
      key: 'visiabled',
      value: +checked,
      subKey: 'requisite',
      subValue: !checked ? 0 : record.requisite,
      record,
      index,
    });
  };

  // 修改名称时查找出数据出来同时
  handleSeach = (value, type, record, key) => {
    const { selectObj } = this.state;
    searchLanguageTempalteByLikeName({ name: value }).then(res => {
      this.setState({
        selectObj: {
          ...selectObj,
          [type]: res,
        },
        templateSet: { index: '', fieldKey: '', record: {}, action: 'change', value: '' },
      });
    });

  };

  // 查询出来的值渲染在对应的地方
  returnSelectOption = (type) => {
    const { selectObj } = this.state;
    const Obj = selectObj[type] || [];
    return Obj.map(item => <AutoCompleteOption
      value={`${item.id}`}
      key={`${type + '_' + item.id}`}
    >
      {item.name}
    </AutoCompleteOption>);
  };

  // 如果是选中模板中的数据，就把模板id放置到数据里面
  handleSelect = (value, option, type, record, key) => {
    const { props } = option;
    const { children } = props;
    this.setRowData({
      key,
      value: children,
      record,
      index: type,
    });
  };

  // 失去焦点是做具体的判断
  blurCheck = (value, index, record, key) => {
    const { selectObj, templateSet } = this.state;
    let selectOption = selectObj[index] || [];
    const { action, record: newRecord, index: newIndex, fieldKey, value: newValue } = templateSet;
    if (action === 'check') {
      this.setRowData({
        key: fieldKey,
        value: newValue,
        record: newRecord,
        index: newIndex,
      });
      return;
    }
    if (!value) { // 如果没有数据，有语言模板的要清楚
      record.displayLanguageId = -1;
      this.setRowData({
        key,
        value: null,
        record,
        index: index,
      });
      return;
    }
    record.displayLanguageId = -1;
    this.setRowData({
      key,
      value: value,
      record,
      index: index,
    });

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
  // 获取行宽下拉项
  getColSpanOptions = (frameDetail, isPC, mainTab) => {
    // 是否为看板框架
    const isBoardFrame = frameDetail.frameTypeId === 9;
    // 行宽下拉选项
    let colSpanTypes = isPC ? COLSPAN_TYPE : MOBILE_COLSPAN_TYPE;
    // 首页图表框架的行宽选择
    if (mainTab && (
      (isPC && frameDetail.frameTypeId === 8)
      || (!isPC && frameDetail.basetype === 5)
    )) {
      colSpanTypes = HOME_CHART_COLSPAN_TYPE;
    } else if (isBoardFrame) { // 大屏看板框架
      colSpanTypes = BOARD_COLSPAN_TYPE;
    }
    const colSpanOptions = Object.keys(colSpanTypes).map(item => <Option key={`colSpan-${item}`}
                                                                         value={+item}><FormattedMessage
      id={colSpanTypes[item]}/></Option>);
    return {
      colSpanOptions,
      isBoardFrame,
    };
  };
  // 生成列名
  setColumns = () => {
    const { activeRowIndex } = this.state;
    const { form, isPC, modelName } = this.props;
    const { getFieldDecorator } = form;
    let tabElementList = [];
    let frameDetail = {};
    const { tabBasicData } = this.props[modelName];
    const { id: tabId, mainTab } = tabBasicData;
    if (isPC) {
      tabElementList = [...this.props.framePage.tabElementList];
      frameDetail = this.props.framePage.frame;
    } else {
      const { elementListMap } = this.props.bundleConfig;
      tabElementList = elementListMap[tabId];
      frameDetail = this.props.bundleConfig.frameDetail;
    }
    const { colSpanOptions, isBoardFrame } = this.getColSpanOptions(frameDetail, isPC, mainTab);
    const columns = [
      {
        title: <FormattedMessage id="global.index"/>,
        dataIndex: 'sno',
        width: 60,
        render: (text, record, index) => index + 1,
      }, {
        title: <FormattedMessage id="pageConfig.col.widgetName"/>,
        dataIndex: 'name',
        width: 120,
      }, {
        title: <FormattedMessage id="global.required"/>,
        dataIndex: 'requisite',
        width: 80,
        ignore: isBoardFrame,
        render: (text, record, index) => (
          <Checkbox
            checked={!!text}
            onChange={e => this.handleChangeRequired(e.target.checked, record, index)}
          />
        ),
      }, {
        title: <FormattedMessage id="global.readOnly"/>,
        dataIndex: 'readonly',
        width: 80,
        ignore: isBoardFrame,
        render: (text, record, index) => (
          <Checkbox
            checked={!!text}
            onChange={e => this.setRowData({
              key: 'readonly',
              value: +e.target.checked,
              record,
              index,
            })}
          />
        ),
      }, {
        title: <FormattedMessage id="global.visible"/>,
        dataIndex: 'visiabled',
        width: 80,
        render: (text, record, index) => (
          <Checkbox
            checked={!!text}
            onChange={e => this.handleChangeVisible(e.target.checked, record, index)}
          />
        ),
      }, {
        title: <FormattedMessage id="pageConfig.element.layout"/>,
        dataIndex: 'elementPcStyle',
        width: 100,
        ignore: !isBoardFrame,
        render: (text, record, index) => {
          return (
            <CSelect
              value={text}
              style={{ width: 80 }}
              onChange={val => this.setRowData({
                key: 'elementPcStyle',
                value: +val,
                record,
                index,
              })}
            >
              {colSpanOptions}
            </CSelect>
          );
        },
      }, {
        title: <FormattedMessage id="global.colSpan"/>,
        dataIndex: 'columnSpan',
        width: 100,
        ignore: isBoardFrame,
        render: (text, record, index) => {
          return (
            <CSelect
              value={text}
              style={{ width: 80 }}
              onChange={val => this.setRowData({
                key: 'columnSpan',
                value: +val,
                record,
                index,
              })}
            >
              {colSpanOptions}
            </CSelect>
          );
        },
      },
      {
        title: <FormattedMessage id="pageConfig.col.showName"/>,
        dataIndex: 'displayName',
        render: (text, record, index) => {
          return <Search
            key={`displayName${text}`}
            onSearch={() => this.relationLanguageTemplate(index, record, 'displayName')}
            onChange={(e) => {
              let value = e.target.value.trim();
              this.setState({
                templateSet: {
                  fieldKey: 'displayName',
                  index,
                  record,
                  action: '',
                  value: value,
                },
              });
            }
            }
            onBlur={e =>
              this.blurCheck(e.target.value.trim(), index, record, 'displayName')}
            defaultValue={text}
          />;
        },
      },
      // {
      //   title: <FormattedMessage id="pageConfig.col.showName" />,
      //   dataIndex: 'displayName',
      //   key: 'displayName',
      //   render: (text, record, index) => {
      //     // return getFieldDecorator(`displayName${index}`, {
      //     //   initialValue: text,
      //     // })(
      //     return <CInput
      //       defaultValue={text}
      //       key={`displayName${record.id}`}
      //       onBlur={e => this.setRowData({
      //         key: 'displayName',
      //         value: e.target.value.trim(),
      //         record,
      //         index,
      //       })}
      //     />;
      //     // );
      //   },
      // },
      {
        title: <FormattedMessage id="pageConfig.col.setting"/>,
        dataIndex: '',
        width: 100,
        render: (text, record, index) => {
          // const activeRow = (activeRowIndex !== -1) && tabElementList[activeRowIndex] || {};
          const isActiveRow = index === activeRowIndex;
          const arrowCls = classNames({
            'iconfont': true,
            'icon-down': true,
            [styles.arrow]: true,
            [styles.close]: isActiveRow,
          });
          const wrapCls = classNames({
            'custom-color': true,
            [styles.triggerWrap]: true,
          });
          return (
            <span
              onClick={() => this.setActiveRowData(index)}
              className={wrapCls}
            >
              <FormattedMessage id={isActiveRow ? 'to.close' : 'to.open'}/>
              <span className={arrowCls}/>
            </span>
          );
        },
      },
    ];
    return columns.filter(item => !item.ignore);
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
      this.blurCheck(data.name, index, record, fieldKey);
    });
  };

  render() {
    const { form, isPC } = this.props;
    let tabElementList = [];
    if (isPC) {
      tabElementList = [...this.props.framePage.tabElementList];
    } else {
      const { tabBasicData, elementListMap } = this.props.bundleConfig;
      tabElementList = elementListMap[tabBasicData.id] || [];
    }
    const { activeRowIndex, loadingStatus, templateSet } = this.state;
    const wrapCls = classNames({
      [styles.wrap]: true,
      'custom-list-table': true, // 调用处样式覆盖用
    });
    const templateID = templateSet.record[this.returnFieldLanguageId(templateSet.fieldKey)] === -1 || templateSet.record[this.returnFieldLanguageId(templateSet.fieldKey)] === '-1' ? null : templateSet.record[this.returnFieldLanguageId(templateSet.fieldKey)];
    const LanguageGroupTypeProps = {
      type: 'addChooseBtn',
      isAsyncTree: true,
      chooseCallbackFun: this.handleRelatinLanguageTemplate,
      templateId: templateID,
    };
    return (
      <div className={wrapCls}>
        <AdvanceTable
          form={form}
          columns={this.setColumns()}
          dataSource={tabElementList}
          activeRow={activeRowIndex === -1 ? {} : tabElementList[activeRowIndex]}
          getExpandedRowComponent={this.getChildComponent}
          delType="async"
          delFunc={this.handleDelRow}
          setParentState={this.setActiveDetailData}
          rowKey="id"
          loading={loadingStatus.list}
        />
        <CreateModal
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

export default Form.create()(elementList);
