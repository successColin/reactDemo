/*
 * @Author: Fus
 * @Date:   2020-02-25 15:04:44
 * @Desc: 筛选关系
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { CButton } from '@/components/common/BasicWidgets';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import FilterTable from './FilterTable/FilterTable';
import AddElement from './AddElement/AddElement';
import { getChartFilterList, updateChartFilter } from '@/services/homeChart';
import styles from './FilterCondition.less';

class FilterCondition extends Component {
  state = {
    visible: false, // 新增控件弹窗是否可见
    listData: [], // 数据源
    selectedEleIds: [], // 已选中的控件id
    loadingStatus: {
      list: false,
      saveAdd: false, // 保存新增控件
    },
  }
  componentDidMount() {
    this.fetchList();
  }
  fetchList = () => {
    const { eleObj } = this.props;
    const { id } = eleObj;
    this.setLoadingStatus('list', true);
    getChartFilterList({ id }).then(listData => {
      this.setState({ listData });
      this.setLoadingStatus('list', false);
    }, err => this.setLoadingStatus('list', false));
  }
  // 更新loading状态
  setLoadingStatus = (type, loading) => {
    const { loadingStatus } = this.state;
    this.setState({
      loadingStatus: {
        ...loadingStatus,
        [type]: loading,
      },
    });
  }
  // 保存新增控件
  handleSaveAdd = () => {
    const { eleObj } = this.props;
    const { selectedEleIds, listData } = this.state;
    const list = selectedEleIds.map(relationElementId => ({
      asqlLeftParenTheses: '',
      asqlColumnName: '',
      asqlDecisionOperator: '',
      asqlRightParenTheses: '',
      asqlRelationalOperator: '',
      relationElementId,
      elementId: eleObj.id,
    }));
    this.setLoadingStatus('saveAdd', true);
    updateChartFilter({ list }).then(res => {
      this.setState({
        visible: false,
        selectedEleIds: [],
        listData: [
          ...listData,
          ...res.list,
        ],
      });
      this.setLoadingStatus('saveAdd', false);
    }, err => this.setLoadingStatus('saveAdd', false));
  }
  setFilterConditionState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
  }
  render() {
    const { filterEleList } = this.props;
    const { visible, listData, loadingStatus, selectedEleIds } = this.state;
    return (
      <div className={styles.wrap}>
        <CButton className={styles.btn} onClick={() => this.setState({ visible: true })}>
          <i className="iconfont icon-add-border custom-color" style={{ marginRight: 4 }} />
          <FormattedMessage id="global.add" />
        </CButton>
        <FilterTable
          filterEleList={filterEleList}
          listData={listData}
          loading={loadingStatus.list}
          setFilterConditionState={this.setFilterConditionState}
        />
        <CreateModal
          visible={visible}
          title={<FormattedMessage id="chart.config.connectFilter" />}
          onCancel={() => this.setState({ visible: false })}
          onOk={this.handleSaveAdd}
          confirmLoading={loadingStatus.saveAdd}
        >
          <AddElement
            addedList={listData}
            filterEleList={filterEleList}
            selectedEleIds={selectedEleIds}
            setFilterConditionState={this.setFilterConditionState}
          />
        </CreateModal>
      </div>
    );
  }
}
export default FilterCondition;