/*
 * @Author: Fus
 * @Date:   2020-05-06 10:15:06
 * @Desc: 头部行（包括新增、类型、跳转菜单）
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Select, Form } from 'antd';
import { CButton, SearchSelect, CSelect } from '@/components/common/BasicWidgets';
import FormItems from '@/components/common/FormItems/FormItems';
import { BOARD_SHOW_TYPE } from '@/constants/pageConfig';
import { updateChartLine, updateChartFilter } from '@/services/homeChart';
import styles from './TopLine.less';

const { Option } = Select;
const typeOptions = Object.keys(BOARD_SHOW_TYPE).map(item => <Option key={`board_showType_${item}`} value={+item}><FormattedMessage id={BOARD_SHOW_TYPE[item]} /></Option>);

class TopLine extends Component {
  state = {
    loadingAdd: false,
  }
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
    this.setState({ loadingAdd: true });
    updateChartLine(params).then(res => {
      const { chartList = [] } = eleObj;
      const newList = [...chartList, res.list[0]];
      this.props.setChartList(newList);
      this.setState({ loadingAdd: false });
    }, err => this.setState({ loadingAdd: false }));
  }
  // 更新控件数据
  setEleObjInfo = (key, value, subKey, subValue) => {
    const { eleObj, activeRowIndex } = this.props;
    this.props.setRowData({
      key,
      value,
      record: eleObj,
      index: activeRowIndex,
    });
  }
  getFormConfigs = () => {
    const { eleObj, activeRowIndex } = this.props;
    return [{
      key: 'showType',
      label: <FormattedMessage id="global.showType" />,
      colSpan: 12,
      config: {
        initialValue: eleObj.showType,
      },
      component: (
        <CSelect
          onChange={val => this.setEleObjInfo('showType', val)}
          style={{ width: 150 }}
          value={eleObj.showType}
        >
          {typeOptions}
        </CSelect>
      ),
    }, {

      key: 'jumpFunctionId',
      label: <FormattedMessage id="settingForm.jumpToFunction" />,
      colSpan: 12,
      config: {
        initialValue: eleObj.jumpFunctionId,
        subInitialValue: eleObj.functionDto ? eleObj.functionDto.name : '',
      },
      hasHidden: true,
      component: (
        <SearchSelect
          modalContentType="function"
          showType="tree"
          setSelected={(selectedRows = []) => {
            this.props.setRowData({
              key: 'jumpFunctionId',
              value: selectedRows[0] && selectedRows[0].id || '',
              record: eleObj,
              index: activeRowIndex,
              subKey: 'functionDto',
              subValue: selectedRows[0] ? selectedRows[0] : {},
            });
          }}
          className={styles.functionSelect}
        />
      ),
    }];
  }
  render() {
    const { loadingAdd } = this.state;
    const { eleObj, form } = this.props;
    return (
      <div className={styles.wrap}>
        <CButton
          className={styles.addBtn}
          onClick={this.handleAdd}
          loading={loadingAdd}
        >
          <i className="iconfont icon-add-border custom-color" />
          <FormattedMessage id="global.add" />
        </CButton>
        <div className={styles.rightWrap}>
          <FormItems
            formConfigs={this.getFormConfigs()}
            form={form}
            loading={false}
          />
        </div>
      </div>
    );
  }
}

export default Form.create()(TopLine);