/*
 * @Author: Fus
 * @Date:   2020-02-07 09:24:06
 * @Desc: 版本配置
 */
import { Component } from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { Tabs } from 'antd';
import VersionList from './VersionList/VersionList';
import styles from './VersionConfig.less';

const { TabPane } = Tabs;

class VersionConfig extends Component {
  state = {
    activeTabKey: 'pc',
  }
  render() {
    const { activeTabKey } = this.state;
    const wrapCls = classNames({
      [styles.tabWrap]: true,
      'custom-pageConfig-tabs': true,
    });
    return (
      <div className={styles.wrap}>
        <Tabs
          activeKey={activeTabKey}
          animated={false}
          className={wrapCls}
          onChange={activeTabKey => this.setState({ activeTabKey })}
        >
          <TabPane tab={<FormattedMessage id="versionConfig.tab.pc" />} key="pc">
            <div className={styles.contentWrap}>
              <VersionList basetype={1} />
            </div>
          </TabPane>
          <TabPane tab={<FormattedMessage id="versionConfig.tab.app" />} key="app">
            <div className={styles.contentWrap}>
              <VersionList basetype={2} />
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
export default VersionConfig;