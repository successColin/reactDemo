/*
 * @Author: Fus
 * @Date:   2019-12-24 17:03:44
 * @Desc: 高级筛选
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Checkbox, Select, Form, Icon, Modal } from 'antd';
import classNames from 'classnames';
// import { connect } from 'dva';
import { BaseContext } from '@/constants/global';
import { CSelect, CInput, CButton } from '@/components/common/BasicWidgets';
import AdvanceTable from '@/components/common/AdvanceTable/AdvanceTable';
import { COLSPAN_TYPE } from '@/constants/pageConfig';
import { getTabSeniorFilter } from '@/services/framePage';
import TabElementTable from './TabElementTable/TabElementTable';
import styles from './SeniorFilterList.less';

const { Option } = Select;

// 行宽下拉选项
const colSpanOptions = Object.keys(COLSPAN_TYPE).map(item => <Option key={`colSpan-${item}`}
                                                                     value={+item}><FormattedMessage
  id={COLSPAN_TYPE[item]}/></Option>);

// @connect(state => ({
//   framePage: state.framePage,
//   bundleConfig: state.bundleConfig,
// }))
class SeniorFilterList extends Component {
  static contextType = BaseContext;
  state = {
    loading: false,
    visibleModal: false,
    seniorFilterList: [], // 高级筛选数据
  };

  componentDidMount() {
    this.fetchSeniorFilterList();
  }

  // 获取高级筛选选中数据
  fetchSeniorFilterList = () => {
    const { modelName, isPC } = this.props;
    const { tabBasicData } = this.props[modelName];
    const paramName = isPC ? 'tabId' : 'mobileTabId';
    const param = {
      [paramName]: tabBasicData.id,
    };
    this.setState({ loading: true });
    getTabSeniorFilter(param).then(seniorFilterList => {
      this.setState({ loading: false, seniorFilterList });
      // this.context.dispatch({
      //   type: `${modelName}/updateState`,
      //   payload: { seniorFilterList },
      // });
    }, err => this.setState({ loading: false }));
  };
  // 更新行数据
  setRowData = ({ key, value, index, record }) => {
    const { seniorFilterList } = this.state;
    const newList = [...seniorFilterList];
    newList.splice(index, 1, {
      ...record,
      [key]: value,
    });
    this.setState({ seniorFilterList: newList });
  };
  // 列名
  setColumns = () => {
    const { functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    return [
      {
        title: <FormattedMessage id="global.index"/>,
        dataIndex: 'sno',
        key: 'sno',
        render: (text, record, index) => index + 1,
      }, {
        title: <FormattedMessage id="settingForm.relationColumnName"/>,
        dataIndex: 'relationColumnName',
        key: 'relationColumnName',
      }, {
        title: <FormattedMessage id="global.colSpan"/>,
        dataIndex: 'columnSpan',
        key: 'columnSpan',
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
      }, {
        title: <FormattedMessage id="pageConfig.col.showName"/>,
        dataIndex: 'displayName',
        key: 'displayName',
        render: (text, record, index) => (
          <CInput
            defaultValue={text}
            key={`displayName${record.id}`}
            onBlur={e => this.setRowData({
              key: 'displayName',
              value: e.target.value.trim(),
              record,
              index,
            })}
          />
        ),
      },
    ];
  };
  // // 更新选中数据
  // updateSeniorFilterList = (seniorFilterList) => {
  //   const { modelName } = this.props;
  //   this.context.dispatch({
  //     type: `${modelName}/updateState`,
  //     payload: { seniorFilterList },
  //   });
  // }
  // 关闭控件列表
  handleCloseModal = () => {
    this.setState({ visibleModal: false });
    this.tabEleModalRef && this.tabEleModalRef.setState({
      selectedRowKeys: [],
      pageNum: 1,
      pageSize: 10,
    });
  };
  handleOpenModal = () => {
    this.setState({ visibleModal: true });
  };
  updateListState = itemObj => {
    this.setState(itemObj);
  };

  render() {
    const { visibleModal, loading, seniorFilterList } = this.state;
    const { form, isPC, modelName, framePage, bundleConfig, functionData } = this.props;
    const { canmodify, canadd, candelete } = functionData.attributes;
    // const { seniorFilterList } = this.props[modelName];
    const wrapCls = classNames({
      [styles.wrap]: true,
      'custom-list-table': true,
    });
    return (
      <div className={wrapCls}>
        {canadd ? <CButton onClick={this.handleOpenModal} className={styles.addBtn}>
          <span className="iconfont icon-add-border custom-color"/>
          <FormattedMessage id="global.add"/>
        </CButton> : null}
        <AdvanceTable
          form={form}
          className={styles.table}
          columns={this.setColumns()}
          dataSource={seniorFilterList}
          rowSelection={false}
          dragColumnWidth={100}
          showOperator={candelete ? true : false}
          setParentState={({ dataSource }) => this.setState({ seniorFilterList: dataSource })}
          rowKey="elementId"
          loading={loading}
        />
        <TabElementTable
          seniorFilterList={seniorFilterList}
          updateListState={this.updateListState}
          modelName={modelName}
          isPC={isPC}
          framePage={framePage}
          bundleConfig={bundleConfig}
          handleCloseModal={this.handleCloseModal}
          visibleModal={visibleModal}
          ref={ref => this.tabEleModalRef = ref}
        />
      </div>
    );
  }
}

export default Form.create()(SeniorFilterList);
