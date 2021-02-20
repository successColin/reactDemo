/*
 * @Author: Fus
 * @Date:   2020-02-11 09:24:49
 * @Desc: 版本信息
 */
import { Component, Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import { formatTime } from '@/utils/common';
import styles from './VersionInfo.less';
import HistoryVersion from './HistoryVersion/HistoryVersion';

@connect(state => ({
  systemVersion: state.global.systemVersion,
}))
class VersionInfo extends Component {
  state = {
    visible: false, // 历史版本显示状态
  }
  handleOpenModal = () => {
    this.props.updateWrapState({ visibleVisionInfo: false });
    this.setState({ visible: true });
  }
  render() {
    const { systemVersion = {} } = this.props;
    const { visible } = this.state;
    const { version = '', upgradeTime = '', memo = '' } = systemVersion;
    const renderTime = upgradeTime ? formatTime(upgradeTime) : '';
    const content = memo ? memo.replace(/\n/g, '<br/>') : '';
    return (
      <Fragment>
        <div className={styles.wrap}>
          <div className={styles.title}>
            <h4>
              <FormattedMessage id="versionInfo.activeVersion" />
              {version}
            </h4>
            <span className={styles.upgradeTime}>
              <FormattedMessage id="versionConfig.version.upgradeTime" />：
              {renderTime}
            </span>
          </div>
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: content }} />
          <div className={`${styles.historyEntry} custom-color`} onClick={this.handleOpenModal}>
            <FormattedMessage id="versionInfo.history" />
          </div>
        </div>
        <CreateModal
          visible={visible}
          title={
            <span className={styles.modalTit}>
              <FormattedMessage id="versionInfo.historyTitle" />
            </span>
          }
          onCancel={() => this.setState({ visible: false })}
          footer={null}
        >
          <HistoryVersion />
        </CreateModal>
      </Fragment>
    );
  }
}
export default VersionInfo;