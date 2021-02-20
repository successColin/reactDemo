/*
 * @Author: Fus
 * @Date:   2019-11-21 19:37:01
 * @Desc: 拾色器
 */
import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Popover } from 'antd';
import { SketchPicker  } from 'react-color';
import { CButton } from '@/components/common/BasicWidgets';
import styles from './ColorPicker.less';

class ColorPicker extends Component {
  static defaultProps = {
    handleSaveColor: null, // 选择颜色后保存
    placement: 'leftBottom', // 弹出方向
    color: '#000',
  }
  state = {
    visible: false,
    pickedColor: {},
  }
  // 保存颜色值
  handleSaveColor = () => {
    const { pickedColor = {} } = this.state;
    const { handleSaveColor } = this.props;
    const color = pickedColor.hex || '';
    handleSaveColor && handleSaveColor(color);
    this.setState({ visible: false });
  }
  render() {
    const { visible, pickedColor } = this.state;
    const { placement, color } = this.props;
    return (
      <Popover
        content={(
          <div className={styles.colorPickerWrap}>
            <CButton
              size="small"
              type="primary"
              className={styles.btn}
              onClick={this.handleSaveColor}
            >
              <FormattedMessage id="global.ok" />
            </CButton>
            <SketchPicker
              colors={pickedColor.hex ? [pickedColor.hex] : []}
              color={pickedColor.hex || color}
              onChangeComplete={pickedColor => this.setState({ pickedColor })}
            />
          </div>
        )}
        trigger="click"
        placement={placement}
        visible={visible}
        onVisibleChange={visible => this.setState({ visible })}
      >
        {this.props.children}
      </Popover>
    );
  }
}

export default ColorPicker;