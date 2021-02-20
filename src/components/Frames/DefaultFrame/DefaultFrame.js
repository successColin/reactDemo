/*
 * @Author: Fus
 * @Date:   2019-06-18 17:07:51
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2019-12-18 10:56:43
 * @Desc: 默认框架(左侧树，右侧内容)
 */
import { Component } from 'react';
import classNames from 'classnames';
import ResizableContainer from '@/components/common/ResizableContainer/ResizableContainer';
import { CSearch } from '@/components/common/BasicWidgets';
import TreeFooter from '@/components/common/TreeFooter/TreeFooter';
import { BaseContext } from '@/constants/global';
import styles from './DefaultFrame.less';

const initProps = {
  aboveTreeComponent: null, // 在左侧树之上的组件
  contentClass: null, // 内容容器类名
  config: { // 配置文件
    contentPadding: true, // 内容容器是否需要padding
    hasFooter: true, // 是否需要尾部
    hasSiderSearch: true, // 左侧头部是否需要搜索栏
    // handleSearch: () => {}, // 搜索
    initTreeFooter: <TreeFooter />, // 左侧树默认底部（空白的底部组件）,后期扩展可直接传入组件
  },
};
class DefaultFrame extends Component {
  static contextType = BaseContext
  static defaultProps = initProps
  render() {
    const { sider, content, footer, aboveTreeComponent, contentClass } = this.props;
    const config = {
      ...initProps.config,
      ...this.props.config,
    };
    const { hasSiderSearch, handleSearch, initTreeFooter, hasFooter, contentPadding } = config;
    const { langLib } = this.context;
    const wrapCls = classNames({
      [styles.wrap]: true,
      [styles.hasFooter]: !!hasFooter,
      [styles.hideSiderFooter]: !!!initTreeFooter,
    });
    const treeWrapCls = classNames({
      [styles.treeWrap]: true,
      [styles.hasAbove]: !!aboveTreeComponent,
    });
    const contentCls = classNames({
      [styles.content]: true,
      [styles.noPadding]: !contentPadding,
      [styles.noFooter]: !footer,
      [contentClass]: true,
    });
    const sidebarCls = classNames({
      [styles.sidebar]: true,
      [styles.item]: true,
    });
    return (
      <div className={wrapCls}>
        <div className={sidebarCls}>
          <ResizableContainer>
            <div className={styles.leftHeader}>
              {aboveTreeComponent && aboveTreeComponent}
              {hasSiderSearch && (
                <CSearch
                  className={styles.search}
                  onSearch={val => handleSearch && handleSearch(val)}
                  onChange={e => !e.target.value && handleSearch && handleSearch(e.target.value)}
                  placeholder={langLib['form.placeholder.keywords']}
                />
              )}
            </div>
            <div className={treeWrapCls}>
              {sider}
            </div>
            {initTreeFooter && initTreeFooter}
          </ResizableContainer>
        </div>
        <div className={`${styles.contentWrap} ${styles.item}`}>
          <div className={contentCls}>
            {content}
          </div>
          <div className={styles.footer}>
            {footer}
          </div>
        </div>
      </div>
    );
  }
}

export default DefaultFrame;
