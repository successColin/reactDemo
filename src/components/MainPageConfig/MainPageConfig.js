/*
 * @Author: Fus
 * @Date:   2020-02-03 16:20:23
 * @Desc: 主页配置
 */
import { Component } from 'react';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';
import { Tabs } from 'antd';
import BasicForm from './BasicForm/BasicForm';
import ThirdUrl from './ThirdUrl/ThirdUrl';
import HelpDoc from './HelpDoc/HelpDoc';
import styles from './MainPageConfig.less';

const { TabPane } = Tabs;

class MainPageConfig extends Component {
  state = {
    activeTabKey: 'basic',
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
          <TabPane tab={<FormattedMessage id="mainPageConfig.tab.basic" />} key="basic">
            <div className={styles.contentWrap}>
              <BasicForm />
            </div>
          </TabPane>
          <TabPane tab={<FormattedMessage id="mainPageConfig.tab.url" />} key="link">
            <div className={styles.contentWrap}>
              <ThirdUrl />
            </div>
          </TabPane>
          <TabPane tab={<FormattedMessage id="mainPageConfig.tab.help" />} key="help">
            <div className={styles.contentWrap}>
              <HelpDoc />
            </div>
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
export default MainPageConfig;
