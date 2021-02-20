/*
 * @Author: Fus
 * @Date:   2020-02-06 14:51:16
 * @Desc: 帮助文档弹框
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import query from '@/constants/query';
import { getCookie } from '@/utils/common';
import styles from './HelpDocs.less';

@connect(state => ({
  mainPageConfig: state.global.mainPageConfig,
}))
class HelpDocs extends Component {
  // 获取icon
  getFileTypeClassName = (format) => {
    if (format === 'mp3') {
      return {
        name: 'icon-mp3-style',
        color: '#FF932F',
      };
    } else if (format === 'mp4') {
      return {
        name: 'icon-mp4-style',
        color: '#4E7DD9',
      };
    } else if (format === 'xls' || format === 'xlsx') {
      return {
        name: 'icon-xls-style',
        color: '#FFAC02',
      };
    } else if (format === 'png') {
      return {
        name: 'icon-png-style',
        color: '#4E94D9',
      };
    } else if (format === 'txt') {
      return {
        name: 'icon-txt-style',
        color: '#B9C1CF',
      };
    } else if (format === 'jpg') {
      return {
        name: 'icon-jpg-style',
        color: '#FF8102',
      };
    } else if (format === 'pdf') {
      return {
        name: 'icon-pdf-style',
        color: '#F15643',
      };
    } else if (format === 'doc' || format === 'docx') {
      return {
        name: 'icon-doc-style',
        color: '#FF933D',
      };
    } else if (format === 'ppt' || format === 'pptx') {
      return {
        name: 'icon-ppt-style',
        color: '#47C69A',
      };
    } else if (format === 'zip') {
      return {
        name: 'icon-zip-style',
        color: '#B9C1CF',
      };
    } else {
      return {
        name: 'icon-else-style',
        color: '#B9C1CF',
      };
    }
  };

  // 渲染文件列表
  setDocList = () => {
    const { helpDoc } = this.props.mainPageConfig;
    const token = getCookie('token');
    return helpDoc.map(item => {
      const { displayFileName, id, format } = item;
      return (
        <li key={id}>
          <i className={`iconfont ${styles.iconWrap} ${this.getFileTypeClassName(format).name}`}
             style={{ color: this.getFileTypeClassName(format).color }}/>
          <div className={styles.titWrap}>
            <p className={styles.fileName} title={displayFileName}>{displayFileName}</p>
            {/* <p className={styles.size}>siztexttexttexttexttexttexttexttexttexttexttexttexte</p> */}
          </div>
          <a className={styles.down} href={`${query.DOWNLOAD_FILE}?id=${id}&token=${token}`}>
            <i className="iconfont iconDown"/>
          </a>
        </li>
      );
    });
  };

  render() {
    return (
      <div className={styles.wrap}>
        <div className={styles.title}>
          <FormattedMessage id="header.help"/>
        </div>
        <ul className={styles.list}>
          {this.setDocList()}
        </ul>
      </div>
    );
  }
}

export default HelpDocs;
