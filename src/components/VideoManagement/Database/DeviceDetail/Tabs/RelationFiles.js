import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Tabs, Card } from 'antd';
import { BaseContext } from '@/constants/global';
import { CTextArea, CInput, CSearch, CTable } from '@/components/common/BasicWidgets';
import Styles from './detail.less';
import { getDevicesData } from '@/services/videoManager';


class RelationFiles extends Component {
  static contextType = BaseContext;

  static getDerivedStateFromProps(props, state) {
    const { record } = props;
    const { record: stateRecord } = state;
    if (record.id !== stateRecord.id) {
      return {
        record,
      };
    }
    return null;
  }

  constructor() {
    super();
    this.state = {
      record: {},
      loading: false,
      selectedRowKeys: [],
      keywords: '',
      pageNum: 1,
      pageSize: 9999,
      list: [],
    };
  }

  componentDidMount() {
    this.fetchList();
  }
  componentDidUpdate(preProps, preState) {
    if (preProps.record.id !== this.props.record.id) {
      this.fetchList();
    }
  }

  fetchList = () => {
    const { keywords, pageNum, pageSize,record } = this.state;
    this.setState({ loading: true });
    getDevicesData({ deviceId: record.id, keywords, pageNum, pageSize }).then(res => {
      this.setState({ list: res.list, loading: false });
    });
  };
  // 搜索
  searchDetails = (keywords) => {
    this.setState({ keywords, pageNum: 1 }, () => {
      this.fetchList();
    });
  };
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

  // 大小单位
  formatSize = (length) => {
    let size = '';
    if (length < 1024) {
      size = length + 'K';
    } else if (length >= 1024) {
      size = parseInt(length / 10.24) / 100 + 'M';
    }
    return size;
  };

  getColumns() {
    const { langLib } = this.context;
    const { deviceDetail = {}, form } = this.props;
    const publicProps = { disabled: false };
    // 描述
    const columns = [
      {
        dataIndex: 'name',
        key: 'name',
        width: '40%',
        render: (text, record) => {
          const { fileName } = record;
          let fileArr = fileName.split('.');
          const Obj = this.getFileTypeClassName(fileArr[fileArr.length - 1]);
          return (<div className={Styles.fileItem}>
            <div><span style={{ color: Obj.color, fontSize: '29px' }} className={`iconfont ${Obj.name}`}/></div>
            <div className={Styles.fileInfo}>
              <p className={Styles.color}><span>{record.fileName}</span></p>
              <p className={Styles.color}>创建时间:{record.createTime || ''}</p>
            </div>
          </div>);
        },
      }, {
        dataIndex: 'fileSize',
        key: 'fileSize',
        width: '40%',
        render: (text, record) => {
          const { fileSize = 0 } = record;
          const size = this.formatSize(fileSize);
          return (<p className={Styles.color}>{size}</p>);
        },
      }, {
        dataIndex: '',
        key: '',
        render: (record) => {
          const url = '/' + record.fileUrl.split('/').slice(3).join('/');
          const fileArr = ['jpg', 'png', 'gif', 'pdf'];
          const { fileName } = record;
          let fileArrs = fileName.split('.');
          let fileType = fileArrs[fileArrs.length - 1];
          return (<div className={Styles.handleItem}>
            <a className={`custom-color ${Styles.a}`} href={url} download={record.fileName}>下载</a>
            {fileArr.includes(fileType) ?
              <a target="_blank" className={`custom-color ${Styles.a}`} href={record.fileUrl}>预览</a> : null}
          </div>);
        },
      },
    ];

    let dataConfig = [];
    return [
      ...columns,
      ...dataConfig,
    ];
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys });
  };

  render() {
    const { loading, selectedRowKeys, list } = this.state;
    const { langLib } = this.context;
    const { form } = this.props;
    const columns = this.getColumns();
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <div className={Styles.relationFiles}>
        <div className={Styles.searchWrap}>
          <CSearch
            placeholder={langLib['form.placeholder.keywords']}
            className={Styles.search}
            onSearch={e => this.searchDetails(e)}
            onChange={e => !e.target.value && this.searchDetails(e.target.value)}
          />
        </div>

        <CTable
          className={Styles.table}
          rowSelection={rowSelection}
          columns={columns}
          showHeader={false}
          pagination={false}
          loading={loading}
          dataSource={list.map((item, index) => {
            return {
              ...item, zindex: index,
            };
          })}
          rowKey={record => record.zindex}
        />
      </div>
    );
  }
}

export default RelationFiles;
