/*
 * @Author: Fus
 * @Date:   2019-08-07 09:00:50
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-11-18 11:45:15
 * @Desc: 图标弹窗，结构为左侧树，右侧图标
 */
import { Component } from 'react';
import { getIconGroupTree } from '@/services/icon';
import { getElementLib } from '@/services/element';
import CreateTree from '@/components/common/CreateTree/CreateTree';
import { CSpin } from '@/components/common/BasicWidgets';
import { getAppBundleTree, getBundleLibraryTree } from '@/services/appLibrary';
import IconList from './IconList/IconList';
import styles from './IconLibBlank.less';

class IconLibBlank extends Component {
  static defaultProps = {
    iconSize: 'default', // 图标尺寸 default默认 small小 large大
    dataType: 'icon', // 数据类型 icon图标库 module组件库(预设界面用) relateTab关联面板
    fromType: 'PC', // 调用处类型  PC  APP-移动端
    treeMap: {}, // 树节点详情map
    preData: {}, // 其他预置数据（如面板信息）
    addEleCallback: () => { }, // 点击添加后回调
  }
  state = {
    groupData: [], // 左侧图标组数据
    activeTreeNodeDetail: {}, // 当前图标组的数据
    activeDetail: [], // 获取的图标列表
    treeResult: {}, // 接口返回的完整树结构
    loadingStatus: {
      tree: false,
      getDetail: false,
    },
  }
  componentDidMount() {
    this.setLoadingStatus('tree', true);
    const { elementType } = this.props;
    const { api, groupDataKey, treeMapKey } = this.getTreeApi();
    api({ elementType }).then(treeResult => {
      this.setState({
        treeResult,
        groupData: groupDataKey ? treeResult[groupDataKey] : treeResult,
        treeMap: treeMapKey ? treeResult[treeMapKey] : {},
      });
      this.setLoadingStatus('tree', false);
    }, err => this.setLoadingStatus('tree', false));
  }
  // 获取树的接口等信息
  getTreeApi = () => {
    const { dataType } = this.props;
    if (dataType === 'icon') {
      return { api: getIconGroupTree, groupDataKey: null };
    } else if (dataType === 'prevModule' || dataType === 'relateTab') {
      return { api: getElementLib, groupDataKey: 'elementModelGroupTree', treeMapKey: 'elementModelMap' };
    } else if (dataType === 'bundle') {
      return {
        api: getBundleLibraryTree,
        groupDataKey: 'bundleLibraryGroupTree',
        treeMapKey: 'bundleLibraryMap',
      };
    } else if (dataType === 'appBundle') {
      return {
        api: getAppBundleTree,
        groupDataKey: 'appTree',
        treeMapKey: 'bundleMap',
      };
    }
  }
  setLoadingStatus = (type, loading) => {
    this.setState({
      loadingStatus: {
        ...this.state.loadingStatus,
        [type]: loading,
      },
    });
  }
  setContentState = (itemObj, callback) => {
    const { preData = {} } = this.props;
    const { activeDetail = [], ...rest } = itemObj;
    let detailData = (JSON.stringify(activeDetail) === '{}' || !activeDetail) ? [] : [...activeDetail];
    const { basetype } = preData;
    // 面板类型为资源管理器面板时，只允许显示小水滴类型的组件
    if (basetype === 6) {
      detailData = detailData.filter(item => item.baseType === 27);
    }
    this.setState({
      activeDetail: JSON.stringify(detailData) === '{}' ? [] : detailData,
      ...rest,
    }, () => callback && callback());
  }
  render() {
    const { groupData, loadingStatus, activeDetail, treeMap, activeTreeNodeDetail } = this.state;
    const { setWrapState, selectedRows, iconSize, dataType, preData, addEleCallback, newSno, fromType } = this.props;
    return (
      <div className={styles.wrap}>
        <div className={styles.treeWrap}>
          <CreateTree
            dataType={dataType}
            treeData={groupData}
            treeMap={treeMap}
            needRightMenu={false}
            defaultExpandAll={true}
            loading={loadingStatus.tree}
            setLoadingStatus={this.setLoadingStatus}
            getDetailParams={treeNode => ({ groupId: treeNode.id })}
            setGetDetailLoading={loading => this.setLoadingStatus('getDetail', loading)}
            updateFrameState={this.setContentState}
            activeTreeNodeDetail={activeTreeNodeDetail}
            nodeConfig={{
              hasRightIcon: true,
              rightIconToward: 'left',
            }}
          />
        </div>
        <div className={styles.iconWrap}>
          <CSpin spinning={loadingStatus.getDetail}>
            <IconList
              iconList={activeDetail}
              iconSize={iconSize}
              setWrapState={setWrapState}
              selectedRows={selectedRows}
              dataType={dataType}
              preData={preData}
              newSno={newSno}
              fromType={fromType}
              addEleCallback={addEleCallback}
            />
          </CSpin>
        </div>
      </div>
    );
  }
}

export default IconLibBlank;