import { Input } from 'antd';
import React, { Component } from 'react';
import classNames from 'classnames';
import styles from './CMapInput.less';
import CreateModal from '@/components/common/CreateModal/CreateModal';
import { Map, Marker, Circle  } from 'react-amap';

// 地图显示控件
class CMapInput extends Component {
  state = {
    visible: false, // 是否显示弹出框
  };
  // 点击方法是否弹出框
  popupMap = () => {
    const { value } = this.props;
    if (!value) { return; };
    this.setState({
      visible: true,
      amapkey: 'ed5b3008be69138921b64a4a3fc44ab5',
      plugins: ['ToolBar'],
    });
  }
  render() {
    const { visible, amapkey, plugins } = this.state;
    const { title } = this.props; // 从组件传过来的 title
    const inputProps = {
      ...this.props,
    };
    let markerPosition = {
      latitude: 29.079258,
      longitude: 119.627974,
    };
    if (!!inputProps.value) {
      let mapVal = inputProps.value.split(',');
      inputProps.value = mapVal[0];
      markerPosition.latitude = mapVal[1];
      markerPosition.longitude = mapVal[2];
    }
    const styleC = {
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      color: '#3194FA',
      fontSize: '40px',
      width: '40px',
      height: '40px',
    };
    console.log(11);
    return (
      <div>
        <Input
          suffix={
            <i className="iconfont icon-map" onClick={() => { this.popupMap(); }} style={{ fontSize: '16px', cursor: 'pointer' }}/>
          }
          {...inputProps}
        />
        <CreateModal
          visible={visible}
          size={'large'}
          footer={null}
          title={title}
          onCancel={() => this.setState({ visible: false })}
        >
          <div className={styles.CMapInput}>
            <div className={styles.map}>
              <Map
                amapkey={amapkey}
                plugins={plugins}
                center={markerPosition}
                zoom={15}
              >
                {
                  inputProps.value && (
                    <Marker
                      position={markerPosition}
                      offset={[-20, -42]}
                    >
                      <div style={styleC} className="iconfont icon-map-postion"></div>
                    </Marker>
                  )
                }
              </Map>
            </div>
            <div className={styles.footerVal}>
              {inputProps.value}
            </div>
          </div>
        </CreateModal>
      </div>
    );
  }
}

export default CMapInput;