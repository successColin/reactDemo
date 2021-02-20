/*
 * @Author: Fus
 * @Date:   2020-02-25 09:49:35
 * @Desc: 图表控件配置项
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import { Select, Tooltip, Icon } from 'antd';
import {
  CButton,
  CInput,
  CMessage,
  ColorPicker,
  CSelect,
  CTextArea,
  SearchSelect,
} from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import SerieTable from './SerieTable/SerieTable';
import FilterCondition from './FilterCondition/FilterCondition';
import { BaseContext, JUMP_TYPE } from '@/constants/global';
import { updateChartLine, updateChartFilter } from '@/services/homeChart';
import styles from './ChartConfig.less';
import FormItems from '@/components/common/FormItems/FormItems';
import { JSON_TEMPLATE_FILE } from '@/constants/triggerState';
import copy from 'copy-to-clipboard';

const { Option } = Select;
// 跳转类型
const jumpTypes = Object.keys(JUMP_TYPE).map(item => <Option value={+item}
                                                             key={`jump_${JUMP_TYPE[item]}`}><FormattedMessage
  id={JUMP_TYPE[item]}/></Option>);

class ChartConfig extends Component {
  static contextType = BaseContext;
  state = {
    visible: false, // 筛选关系弹窗
    loadingStatus: {
      add: false,
      saveFilter: false, // 保存筛选关系
    },
  };
  // 保存筛选条件
  handleSaveFilter = () => {
    const { listData = [] } = this.filterConditionRef.state;
    const { langLib } = this.context;
    this.setLoadingStatus('saveFilter', true);
    updateChartFilter({ list: listData }).then(res => {
      this.setLoadingStatus('saveFilter', false);
      CMessage(langLib['message.save.success']);
      this.setState({ visible: false });
    }, err => this.setLoadingStatus('saveFilter', false));
  };
  // 新增sql行
  handleAdd = () => {
    const { eleObj } = this.props;
    const params = {
      list: [{
        asqlWholeCondition: '',
        axisUnitX: '',
        axisUnitY: '',
        elementId: eleObj.id,
        chartType: '',
      }],
    };
    this.setLoadingStatus('add', true);
    updateChartLine(params).then(res => {
      const { chartList = [] } = eleObj;
      const newList = [...chartList, res.list[0]];
      this.setChartList(newList);
      this.setLoadingStatus('add', false);
    }, err => this.setLoadingStatus('add', false));
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
  // 更新sql表格
  setChartList = (newList) => {
    const { eleObj, setRowData, activeRowIndex } = this.props;
    setRowData({
      index: activeRowIndex,
      record: eleObj,
      key: 'chartList',
      value: newList,
    });
  };
  // 表单配置
  getFormConfigs = () => {
    const { tabElementList, setRowData, activeRowIndex, activeRow = {}, tabInfo, tabList = [], form, eleObj, isPC, framePage } = this.props;
    const { basetype: frameType } = framePage.frameTypeDto;
    const { getFieldDecorator } = this.props.form;
    const { basetype } = activeRow;
    // 主页关联弹出面板
    const homeFrameTabOptions = tabList.filter(item => item.id !== tabInfo.id && item.showType === 1)
      .map(item => <Option key={item.id} value={item.id}>{item.name}</Option>);
    console.log(typeof eleObj.jumpType, 'jumpType');
    return [{
      key: 'ignore-jumpType',
      label: <FormattedMessage id="settingForm.jumpType"/>,
      colSpan: 8,
      config: {
        initialValue: eleObj.jumpType,
      },
      ignore: false,
      component: (
        <CSelect   // 下拉选择，值为1，关联面板，值为2，关联菜单，值为3，面板，菜单都不显示，值为null，都显示
          onChange={value => setRowData({
            key: 'jumpType',
            value,
            record: eleObj,
            index: activeRowIndex,
          })}
        >
          <Option value={3}><FormattedMessage id="global.null"/></Option>
          {jumpTypes}
        </CSelect>
      ),
    }, {
      key: 'ignore-bundleId',
      label: <FormattedMessage id="settingForm.bundleId"/>,
      colSpan: 8,
      config: {
        initialValue: eleObj.relationBundleId || '',
        subInitialValue: eleObj.bundlePramDto ? eleObj.bundlePramDto.name : '',
      },
      ignore: isPC || !(eleObj.jumpType === 2),
      hasHidden: true,
      component: (
        <SearchSelect
          modalContentType="bundle"
          showType="tree"
          setSelected={selectedRows => setRowData({
            key: 'relationBundleId',
            value: selectedRows.length ? selectedRows[0].id : '',
            record: eleObj,
            index: activeRowIndex,
            subKey: 'bundlePramDto',
            subValue: selectedRows.length ? selectedRows[0] : {},
          })}
        />
      ),
    }, {
      key: 'ignore-functionId',
      subKey: 'functionDto',
      label: <FormattedMessage id="settingForm.functionId"/>,
      colSpan: 8,
      config: {
        initialValue: eleObj.relationFunctionId || '',
        subInitialValue: eleObj.functionDto ? eleObj.functionDto.name : '',
      },
      ignore: !isPC || !(eleObj.jumpType === 2),
      hasHidden: true,
      component: (
        <SearchSelect
          modalContentType="function"
          showType="tree"
          setSelected={selectedRows => setRowData({
            key: 'relationFunctionId',
            value: selectedRows.length ? selectedRows[0].id : '',
            record: eleObj,
            index: activeRowIndex,
            subKey: 'functionDto',
            subValue: selectedRows.length ? selectedRows[0] : {},
          })}
        />
      ),
    }, {
      key: 'ignore-relationTabId',
      label: <FormattedMessage id="tab.type.relate"/>,
      colSpan: 8,
      config: {
        initialValue: eleObj.relationTabId || '',
      },
      ignore: !(eleObj.jumpType === 1),
      component: (
        <CSelect
          // disabled={fromType === 'pageConfig'}
          onChange={value => setRowData({
            key: 'relationTabId',
            value,
            record: eleObj,
            index: activeRowIndex,
          })}
        >
          <Option value={null}><FormattedMessage id="global.null"/></Option>
          {homeFrameTabOptions}
        </CSelect>
      ),
    }, {
      key: 'ignore-passParam',
      label: <Fragment>
        <Tooltip
          title={(
            <Fragment>
              <FormattedMessage id="global.template"/>
              <span className={styles.copyEntry} onClick={this.handleCopyTemplate}>
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
        initialValue: eleObj.passParam || '',
      },
      ignore: !(eleObj.jumpType === 2),
      component: (
        <CTextArea
          onBlur={e => setRowData({
            key: 'passParam',
            value: e.target.value,
            record: eleObj,
            index: activeRowIndex,
          })}
          maxLength={1000}
        />
      ),
    },
    ];
  };
  // 复制模板
  handleCopyTemplate = () => {
    const { langLib } = this.context;
    if (copy(JSON_TEMPLATE_FILE)) {
      CMessage(langLib['message.copy.success']);
    } else {
      CMessage(langLib['message.copy.error']);
    }
  };

  render() {
    const { visible, loadingStatus } = this.state;
    const { tabList = [], activeRow = {}, tabInfo, form, doSaveFrameTab, tabElementList, isPC } = this.props;
    return (
      <div className={styles.wrap}>
        <FormItems
          formConfigs={this.getFormConfigs()}
          form={form}
          loading={false}
        />
        <div className={styles.btnWrap}>
          <CButton
            className={styles.btn}
            onClick={this.handleAdd}
            loading={loadingStatus.add}
          >
            <i className="iconfont icon-add-border custom-color"/>
            <FormattedMessage id="global.add"/>
          </CButton>
          {/* <CButton className={styles.btn} onClick={() => this.setState({ visible: true })}>
            <i className="iconfont icon-chart-connect custom-color" />
            <FormattedMessage id="chart.config.connectFilter" />
          </CButton> */}
        </div>
        <SerieTable
          {...this.props}
          setChartList={this.setChartList}
        />
        <CreateModal
          visible={visible}
          title={<FormattedMessage id="chart.config.connectFilter"/>}
          onCancel={() => this.setState({ visible: false })}
          onOk={this.handleSaveFilter}
          confirmLoading={loadingStatus.saveFilter}
        >
          <FilterCondition
            {...this.props}
            ref={ref => this.filterConditionRef = ref}
          />
        </CreateModal>
      </div>
    );
  }
}

export default ChartConfig;
