/*
 * @Author: Fus
 * @Date:   2019-08-07 13:50:18
 * @Last Modified by: Fus
 * @Last Modified time: 2019-09-06 15:37:50
 * @Desc: 界面配置右侧主内容
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import HeaderForm from '../HeaderForm/HeaderForm';
import ListTable from '../ListTable/ListTable';
import { CSpin } from '@/components/common/BasicWidgets';
import CreateDrawer from '@/components/common/CreateDrawer/CreateDrawer';
import IconLibBlank from '@/components/common/IconLibBlank/IconLibBlank';
import GroupForm from './GroupForm/GroupForm';
import styles from './ContentContainer.less';

class ContentContainer extends Component {
  state = {
    visibleDrawer: false,
    selectedRows: [], // 选中的组件
  }
  setContentState = (itemObj, callback) => {
    this.setState(itemObj, () => callback && callback());
  }
  // 从组件库中新增组件
  addActiveModule = ({ selectedRows }) => {
    const { activeDetail = {}, updateFrameState } = this.props;
    const { elementList = [] } = activeDetail;
    const newElementList = elementList && [...elementList] || [];
    newElementList.push({
      ...selectedRows[0],
    });
    updateFrameState({
      activeDetail: {
        ...activeDetail,
        elementList: newElementList,
      },
    });
    this.setState({ selectedRows });
  }
  // 更新tab数据
  setActiveDetail = ({ listData }) => {
    this.props.updateFrameState({
      activeDetail: {
        ...this.props.activeDetail,
        elementList: listData,
      },
    });
  }
  render() {
    const { form, activeDetail = {}, activeTreeNodeDetail = {}, actionType, loading, isInitialData, updateFrameState, functionData } = this.props;
    const { elementList = [] } = activeDetail;
    const eleLen = elementList.length;
    const newSno = eleLen ? elementList[eleLen - 1].sno + 1 : 1;
    const { visibleDrawer, selectedRows } = this.state;
    const headerProps = {
      form,
      activeDetail,
      updateFrameState,
      setContentState: this.setContentState,
    };
    const drawerProps = {
      title: <FormattedMessage id="global.moduleLib" />,
      visible: visibleDrawer,
      onClose: () => this.setState({ visibleDrawer: false }),
    };
    // 表格属性
    const listProps = {
      functionData,
      form,
      activeDetail,
      setActiveDetail: this.setActiveDetail,
    };
    const isGroupComponent = activeTreeNodeDetail.isGroup && (actionType === 'addGroup' || actionType === 'delGroup' || actionType === 'editGroup');
    // 组详情
    const renderGroupForm = isGroupComponent && <GroupForm form={form} activeDetail={activeDetail} isInitialData={isInitialData} />;
    // 面板详情
    const renderTabForm = !isGroupComponent && activeTreeNodeDetail.id && (
      <Fragment>
        <HeaderForm {...headerProps} />
        <ListTable {...listProps} />
      </Fragment>
    );
    return (
      <CSpin spinning={loading}>
        <div className={styles.wrap}>
          {renderGroupForm}
          {renderTabForm}
          <CreateDrawer {...drawerProps}>
            <IconLibBlank
              setWrapState={this.addActiveModule}
              selectedRows={selectedRows}
              preData={activeDetail}
              elementType={10}
              newSno={newSno}
              dataType="prevModule"
              iconSize="large"
            />
          </CreateDrawer>
        </div>
      </CSpin>
    );
  }
}

export default ContentContainer;
