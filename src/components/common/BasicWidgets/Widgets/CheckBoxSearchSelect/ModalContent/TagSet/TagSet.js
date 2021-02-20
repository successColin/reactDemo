import React, { Component } from 'react';
import { Tag, Popover } from 'antd';
import styles from './TagSet.less';

class TagSet extends Component {
  constructor() {
    super();
  }

  // 渲染标签
  renderTags = () => {
    const { selectedRows } = this.props;
    return selectedRows.map((item, index) => <Tag key={item.id} closable
                                                  onClose={() => this.deleteTag(index)}>{item.name}</Tag>);
  };
  // 删除标签
  deleteTag = (index) => {
    const { setWrapState, selectedRows } = this.props;
    let newSelectedRows = [...selectedRows];
    newSelectedRows.splice(index, 1); // 将删掉的标签从数组中去除
    setWrapState({ selectedRows: newSelectedRows, type: 'edit' });
  };

  render() {
    return (
      <div className={styles.tagWrap}>
        <span className={styles.tagList}>
          {this.renderTags()}
        </span>
        <Popover
          overlayClassName={styles.popoverWrap}
          content={this.renderTags()}
          placement="bottomRight"
          title=""
          trigger="hover"
        >
          <span className={styles.ellipsis}>...</span>
        </Popover>
      </div>
    );
  }
}

export default TagSet;
