/*
 * @Author: Fus
 * @Date:   2020-03-16 13:55:44
 * @Desc: 富文本编辑器
 */
import { Component } from 'react';
import BraftEditor from 'braft-editor';
import classNames from 'classnames';
import { Upload, Icon, Button } from 'antd';
import { CMessage } from '@/components/common/BasicWidgets';
import { ContentUtils } from 'braft-utils';
import query from '@/constants/query';
import { BaseContext } from '@/constants/global';
import { getCookie, getFileAcceptType, ImageCompression } from '@/utils/common';
import styles from '../../index.less';

// 去掉的功能
const excludeControls = ['clear', 'media', 'headings', 'emoji'];

class CBraftEditor extends Component {
  static contextType = BaseContext;

  static getDerivedStateFromProps(props, state) {
    if (props.textValue !== state.textValue) {
      return {
        editorState: BraftEditor.createEditorState(props.textValue),
        textValue: props.textValue,
      };
    }
    return null;
  }

  state = {
    editorState: null,
    textValue: '',
  };
  // 清空内容(于外部调用)
  clearContent = () => {
    const { editorState } = this.state;
    if (!editorState) return;
    this.setState({
      editorState: ContentUtils.clear(editorState),
    });
  };
  handleEditorChange = (editorState) => {
    this.setState({ editorState });
    this.triggerChange({ editorState });
  };
  triggerChange = editorState => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(Object.assign({}, this.state, editorState));
    }
  };
  // 上传前校验
  beforeUpload = file => {
    const { size, type } = file;
    const { fileType = 'image' } = this.props;
    const { max } = this.state;
    const { langLib } = this.context;
    const isLtMax = size / 1024 / 1024 < 2;
    // 文件过大
    if (!isLtMax) {
      CMessage(langLib['file.overSize'](max), 'error');
      return false;
    } else if (fileType === 'image' && type.indexOf(fileType) === -1) { // 上传文件类型不支持（图片）
      CMessage(langLib['file.unAcceptType'], 'error');
      return false;
    }
    return new Promise((resolve, reject) => {
      if (!isLtMax) {
        reject(file);
      } else {
        // 图片压缩
        ImageCompression({ file, quality: 0.6 }, (imgFile) => {
          resolve(imgFile);
        });
      }
    });
  };
  // 图片上传
  handleFileChange = (obj, id) => {
    const { file } = obj;
    const { status } = file;
    const { langLib } = this.context;
    if (status === 'error') {
      // 上传异常
      CMessage(langLib['file.error'], 'error');
      return;
    } else if (status === 'done' && file.response) {
      if (!file.response) {
        CMessage(langLib['file.error'], 'error');
        return;
      }
      const url = file.response.data[0].url;
      const editorState = ContentUtils.insertMedias(this.state.editorState, [
        {
          type: 'IMAGE',
          url,
        },
      ]);
      this.setState({ editorState });
    }
  };
  // 获取额外的功能入口
  getExtendControls = () => {
    const { id: eleId } = this.props.eleObj;
    const { langLib } = this.context;
    const acceptType = getFileAcceptType();
    return [
      {
        key: 'antd-uploader',
        type: 'component',
        component: (
          <Upload
            accept={acceptType}
            showUploadList={false}
            beforeUpload={this.beforeUpload}
            action={query.EDITOR_UPLOAD}
            headers={{ token: getCookie('token') }}
            onChange={(file) => this.handleFileChange(file, eleId)}
          >
            <Button className="control-item button upload-button" data-title={langLib['textEditor.img']}>
              <Icon type="picture" theme="filled"/>
            </Button>
          </Upload>
        ),
      },
    ];
  };

  render() {
    const { editorState, textValue } = this.state;
    const { disabled, eleObj } = this.props;
    const { placeholderText } = eleObj;
    const extendControls = this.getExtendControls();
    const className = classNames({
      [styles.cBraftEditor]: true,
      'custom-braft-editor': true,
    });
    const editorProps = {
      readOnly: disabled,
      placeholder: placeholderText,
      extendControls,
      excludeControls,
      value: editorState,
      className,
      style: { border: '1px solid #EBEBEB' },
      onChange: this.handleEditorChange,
    };
    return disabled ? (
      <div
        className={styles.cBraftEditorSection}
        dangerouslySetInnerHTML={{ __html: textValue }}
      />
    ) : (
      <BraftEditor {...editorProps} />
    );
  }
}

export default CBraftEditor;
