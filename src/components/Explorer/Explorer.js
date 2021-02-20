import React, { Component } from 'react';
import DefaultFrame from '../Frames/DefaultFrame/DefaultFrame';
import CreateTree from '../common/CreateTree/CreateTree';
import { getNodeDataFromTreeData, setNewActionType } from '@/utils/common';
import { Drawer } from 'antd';
import TableContent from '@/components/Explorer/component/content';
import { BaseContext } from '../../constants/global';
import styles from './Explorer.less';
import treeData from './treeData';
import { CSearch } from '@/components/common/BasicWidgets';
import { FormattedMessage } from 'react-intl';
import Style from '@/components/Explorer/Explorer.less';


class Explorer extends Component {
  static contextType = BaseContext;

  constructor(props) {
    super(props);
    this.state = {
      treeData: [], // 树数据
      activeTreeNodeDetail: {},
      visible: true,
    };
  }

  componentDidMount() {
    const activeTreeNodeDetail = getNodeDataFromTreeData(treeData.nodeKey, treeData);
    this.setState({
      treeData: treeData,
      activeTreeNodeDetail,
    });
  }

  // 更新状态
  updateFrameState = (itemObj) => {
    this.setState({ ...itemObj });
  };
  onClose = () => {
    this.setState({
      visible: false,
    });
  };
  toggle = () => {
    this.setState({
      visible: !this.state.visible,
    });
  };

  render() {
    const { langLib } = this.context;
    const { activeTreeNodeDetail } = this.state;
    const createTreeConfig = {
      treeData,
      nodeConfig: {
        isMainTree: true,
        notGroupIcon: true,
      },
      activeTreeNodeDetail: activeTreeNodeDetail,
      needGetDetail: false,
      needRightMenu: false,
      loading: false,
      className: styles.bgColor,
    };

    return (<div className={styles.contentBox}>
      <div className={styles.leftSilder}>
        <div className={styles.searchBox}>
          <CSearch
            className={styles.search}
            onSearch={val => console.log(val)}
            placeholder={langLib['form.placeholder.keywords']}
          />
        </div>
        <div className={styles.treeBox}>
          <CreateTree {...createTreeConfig} />
        </div>
      </div>
      <div className={styles.tableBox}>
        <div className={this.state.visible ? styles.tableStyle : styles.tableNomal}>
          <TableContent/>
        </div>
        <div className={this.state.visible ? styles.footer_expend : styles.footer_zoom} onClick={() => this.toggle()}>
          <div className={styles.iconHook}>
            <span className={this.state.visible ? 'iconfont icon-zoom' : 'iconfont icon-expand'}></span>
            <div className={styles.iconHide}></div>
          </div>
          <div className={styles.footerContent}>
            <div><span className={styles.base + ' iconfont iconWater'}></span><FormattedMessage
              id="explor.colums.base"/></div>
            <div><span className={styles.word + ' iconfont iconWater'}></span><FormattedMessage
              id="explor.colums.word"/></div>
            <div><span className={styles.falult + ' iconfont iconWater'}></span><FormattedMessage
              id="explor.colums.falult"/></div>
            <div><span className={styles.plan + ' iconfont iconWater'}></span><FormattedMessage
              id="explor.colums.plan"/></div>
            <div><span className={styles.preject + ' iconfont iconWater'}></span><FormattedMessage
              id="explor.colums.preject"/></div>
            <div><span className={styles.history + ' iconfont iconWater'}></span><FormattedMessage
              id="explor.colums.history"/></div>
            <div><span className={styles.inspection + ' iconfont iconWater'}></span><FormattedMessage
              id="explor.colums.inspection"/></div>
            <div><span className={styles.spare + ' iconfont iconWater'}></span><FormattedMessage
              id="explor.colums.spare"/></div>
          </div>
        </div>
      </div>
    </div>);
  }
}

export default Explorer;
