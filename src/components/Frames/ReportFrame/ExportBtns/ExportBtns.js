/*
 * @Author: Fus
 * @Date:   2019-10-17 10:51:27
 * @Desc: 导出按钮
 */

import { Component } from 'react';
import { CButton } from '@/components/common/BasicWidgets';
import { FormattedMessage } from 'react-intl';
import { connect } from 'dva';
import query from '@/constants/query';
import styles from './ExportBtns.less';

@connect(state => ({
  reportDomain: state.global.reportDomain,
}))
class ExportBtns extends Component {
  render() {
    const { fileName, paramStr, reportDomain } = this.props;
    const getDownloadUrl = type => `${reportDomain}${query[`DOWNLOAD_REPORT_${type}`]}?_u=file:${fileName}&_t=0${paramStr}`;
    const printUrl = `${reportDomain}${query.REPORT_PRINT}?_u=file:${fileName}${paramStr}`;
    return (
      <div className={styles.wrap}>
        <a href={getDownloadUrl('EXCEL')}>
          <CButton>
            <i className="iconfont icon-export-excel custom-color"/>
            Excel
          </CButton>
        </a>
        <a href={getDownloadUrl('WORD')}>
          <CButton>
            <i className="iconfont icon-export-docx custom-color"/>
            docx
          </CButton>
        </a>
        <a href={getDownloadUrl('PDF')}>
          <CButton>
            <i className="iconfont icon-export-pdf custom-color"/>
            pdf
          </CButton>
        </a>
        <a href={printUrl} target="_blank">
          <CButton>
            <i className="iconfont icon-print custom-color"/>
            <FormattedMessage id="global.print"/>
          </CButton>
        </a>
      </div>
    );
  }
}

export default ExportBtns;
