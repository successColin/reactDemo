/*
 * @Author: jwk
 * @Date:   2020-03-09 14:51:16
 * @Desc: 二维码
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Popover, Icon, Tooltip } from 'antd';
import { connect } from 'dva';
import styles from './Qrcode.less';

const QRCode = require('qrcode.react');


@connect(state => ({
  QBList: state.global.QBList,
}))
class QBList extends Component {
  renderDetial = (data) => {
    return (<div className={styles.qbBox}>
      {data.iosDownloadUrl && <div className={styles.qbcommon}>
        <div className={styles.qbBorder}>
          <QRCode value={data.iosDownloadUrl}/>
        </div>
        <div className={styles.qbName}>IOS</div>
      </div>}
      {data.androidDownloadUrl && <div className={!data.iosDownloadUrl ? styles.android1 : styles.android}>
        <div className={styles.qbBorder}>
          <QRCode value={data.androidDownloadUrl}/>
        </div>
        <div className={styles.qbName}>Android</div>
      </div>}
    </div>);

  };
  renderQB = () => {
    const { QBList = [] } = this.props;
    return QBList.map((item, index) => {
      if (item.iosDownloadUrl || item.androidDownloadUrl) {
        return (<div className={styles.box} key={item.id + '' + index}>
          <div className={styles.iconapp}>
            <i className="iconfont icon-app"></i>
          </div>
          <div className={styles.content}>
            <div className={styles.name}>{item.name}</div>
            {/*<div>{item.version}</div>*/}
          </div>
          <div className={styles.frame}>
            <Popover
              content={
                this.renderDetial(item)
              }>
              <i className="iconfont icon-app-qb"></i>
            </Popover>
          </div>
        </div>);
      }

      // if (item.iosDownloadUrl || item.androidDownloadUrl) {
      //   return (<div>
      //     <div>{item.name}</div>
      //     <div className={styles.box}>
      //       {item.iosDownloadUrl && <div className={styles.boxContent}>
      //         <div>IOS:</div>
      //         <QRCode value={item.iosDownloadUrl}/>
      //       </div>}
      //       {item.androidDownloadUrl && <div>
      //         <div>Android:</div>
      //         <QRCode value={item.androidDownloadUrl}/>
      //       </div>}
      //     </div>
      //   </div>);
      // }
    });
  };

  render() {
    return (
      <div className={styles.wrap}>
        <div className={styles.title}><FormattedMessage id="header.download"/> <Tooltip
          title={<FormattedMessage id="global.download.message"/>}><Icon type="question-circle"
                                                                         style={{ marginLeft: 5 }}/></Tooltip></div>
        <div className={styles.wrapLi}>
          {this.renderQB()}
        </div>
      </div>
    );
  }
}

export default QBList;
