// import React, { Component } from 'react';
// import { Row, Drawer, Spin, Popover, Icon } from 'antd';
// import { FormattedMessage } from 'react-intl';
// import TRTC from 'trtc-js-sdk';
// import TIM from 'tim-js-sdk';
// import classNames from 'classnames';
// import { BaseContext } from '@/constants/global';
// import { connect } from 'dva';
// import CMessage from '@/components/common/BasicWidgets/Widgets/CMessage/CMessage';
// import CTooltip from '@/components/common/BasicWidgets/Widgets/CTooltip/CTooltip';
// import Proficient from '../Proficient/ProficientList';
// import DeviceContent from '../Database/Database';
// import { getSeconds } from '@/utils/common';
// import { Base64 } from 'js-base64';
// import { getUserSig, leaveMeetting } from '@/services/videoManager';
// import Draw from './draw';
// import Styles from './VideoContent.less';
// import avatar from '@/assets/avatar.png';
//
// @connect(state => ({
//   userInfo: state.user.userInfo,
//   vedioVisible: state.global.vedioVisible, // 视频弹框
// }))
// class VideoContent extends Component {
//   static contextType = BaseContext;
//
//   static getDerivedStateFromProps(props, state) {
//     if (JSON.stringify(props.userList) !== JSON.stringify(state.userList)) {
//       return {
//         userList: props.userList,
//       };
//     }
//     return null;
//   }
//
//   state = {
//     userList: [], // 用户列表
//     hasVideo: true, // 是否有摄像头
//     hasAudio: true, // 是否有音频
//     whiteboardIsShow: true, // 白板栏是否显示
//     isReady: false,
//     isShow: false, // 是否在分享中
//     drawColor: 'rgba(224, 50, 50, 1)', // 画笔颜色
//     step: 0,
//     visible: false, // 邀请成员弹框
//     toggleTeam: false, // 控制成员收缩
//     dataBtnVisible: true, // 资料查询
//     dataConfig: {
//       dataVisible: false,
//       dataIsShow: false,
//     }, // 资料类型
//     deviceConfig: {
//       deviceVisible: false,
//       deviceIsShow: false,
//     }, // 设备配置
//   };
//   timer = null;
//   shareClient = null; // 客户端
//   config = null;
//   globalLocalStream = null; // 本地数据流
//   showUserId = null; // 分享数据id
//   doCount = 0; // 分享实例化的次数
//   tim = null; // 发送文件
//
//
//   sendImageMessage = () => {
//     function dataURLtoFile(dataurl, filename, type) {// 将base64转换为文件
//       var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
//         bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
//       while (n--) {
//         u8arr[n] = bstr.charCodeAt(n);
//       }
//       return new File([u8arr], filename, { type });
//     }
//
//     const canvas = document.querySelector('#contentWrap canvas');
//     if (!canvas) return;
//     const base64Url = canvas.toDataURL('image/jpg');
//     const { userList } = this.state;
//
//     const { userInfo, trtcCalling, tim } = this.props;
//
//     let others = userList.find(item => item.userID !== userInfo.account);
//     let message = tim.createImageMessage({
//       to: others.userID,
//       conversationType: TIM.TYPES.CONV_C2C,
//       // 消息优先级，用于群聊（v2.4.2起支持）。如果某个群的消息超过了频率限制，后台会优先下发高优先级的消息，详细请参考：https://cloud.tencent.com/document/product/269/3663#.E6.B6.88.E6.81.AF.E4.BC.98.E5.85.88.E7.BA.A7.E4.B8.8E.E9.A2.91.E7.8E.87.E6.8E.A7.E5.88.B6)
//       // 支持的枚举值：TIM.TYPES.MSG_PRIORITY_HIGH, TIM.TYPES.MSG_PRIORITY_NORMAL（默认）, TIM.TYPES.MSG_PRIORITY_LOW, TIM.TYPES.MSG_PRIORITY_LOWEST
//       // priority: TIM.TYPES.MSG_PRIORITY_NORMAL,
//       payload: {
//         file: dataURLtoFile(base64Url, 'text.jpg', 'image/jpg'),
//       },
//       onProgress: function(event) {
//         console.log('file uploading:', event);
//       },
//     });
//     this.setState({ step: 3 });
//     // 2. 发送消息
//     let promise = tim.sendMessage(message);
//     promise.then((imResponse) => {
//       // 发送成功
//       CMessage('发送成功', 'success');
//       this.clearCapture();
//       this.setState({ step: 0 });
//     }).catch((imError) => {
//       // 发送失败
//       CMessage('发送失败', 'error');
//       this.setState({ step: 0 });
//       this.clearCapture();
//       console.warn('sendMessage error:', imError);
//     });
//     // }, 0);
//
//   };
//
//   componentWillUnmount() {
//     this.timer = null;
//     this.tim = null;
//     this.shareClient = null; // 客户端
//     this.config = null;
//     this.globalLocalStream = null; // 本地数据流
//     this.showUserId = null; // 分享数据id
//     this.doCount = 0; // 分享实例化的次数
//     console.log('componentWillUnmount');
//   }
//
//   async shareClientJoin() {
//     const { trtcCalling } = this.props;
//     const _roomID = trtcCalling._trtcClient._roomID;
//     await this.shareClient.join({
//       roomId: Number(_roomID) + 1,
//     });
//   };
//
//   //  监听到数据进来把原先的数据停止
//   stop = () => {
//     const { userList } = this.state;
//     let currentUser = userList.find(item => item.inviteType === 1);
//     const { userInfo, inviteData, trtcCalling } = this.props;
//     if (userInfo.account === currentUser.userID) { // 如果当前用户是邀请者，那就停止本地视频
//       trtcCalling.stopLocalView({ userID: userInfo.account, videoViewDomID: 'local_stream' });
//     } else {
//       trtcCalling.stopRemoteView({ userID: currentUser.userID, videoViewDomID: 'local_stream' }); // 将远端用户的摄像头数据渲染到指定的 DOM ID 节点里
//     }
//   };
//
//
//   // 开关本地摄像头
//   toggleCamera = (flag = true) => {
//     if (this.hasUserMore()) return;
//     const options = { hasCamera: !flag };
//     const { trtcCalling } = this.props;
//     if (!flag) {
//       trtcCalling.openCamera();
//     } else {
//       trtcCalling.closeCamera();
//     }
//     this.updateUserList(options);
//   };
//   // 更新列表
//   updateUserList = (obj = {}) => {
//     const { userList } = this.state;
//     const { userInfo, updateState } = this.props;
//     let User = userList.find(item => item.userID === userInfo.account);
//     let newLocalUser = { ...User, ...obj };
//     const index = userList.findIndex(item => item.userID === userInfo.account);
//     let newUserList = [...userList];
//     newUserList.splice(index, 1, newLocalUser);
//     const { dispatch } = this.context;
//     const params = { vedioUserList: newUserList };
//     dispatch({
//       type: 'global/updateState',
//       payload: { ...params },
//     });
//   };
//
//   // 开关麦克风
//   toggeleMic = (flag) => {
//     if (this.hasUserMore()) return;
//     const options = { hasMicrophone: !flag };
//     const { trtcCalling } = this.props;
//     trtcCalling.setMicMute(flag);
//     this.updateUserList(options);
//   };
//
//   // 渲染视频列表
//   renderUserList = () => {
//     const { userList = [] } = this.state;
//     const { userInfo } = this.props;
//     return userList.map((item, index) => {
//       return (
//         <div key={item.userID} className={Styles.userWrap}>
//           <div className={Styles.avatar}>
//             <img src={item.useravatar || avatar} alt=""/>
//           </div>
//           <div className={Styles.info}>
//             <div className={`${Styles.userName}`}>{item.userName}{userInfo.account === item.userID ? '(我)' : null}</div>
//             <div className={Styles.team}>成员</div>
//           </div>
//           {item.hasCamera ? null :
//             <span className={`iconfont ${Styles.camera} ${Styles.iconCommon} icon-camera_close`}></span>}
//           {item.hasMicrophone ? null : <span
//             className={`iconfont ${Styles.Microphone} ${Styles.iconCommon} icon-Microphone_close`}></span>}
//         </div>
//       );
//     });
//   };
//
//
//   // 用户离开
//   handleLeave = () => {
//     const { trtcCalling, inviteData } = this.props;
//     const { userList } = this.state;
//     trtcCalling && trtcCalling.hangup();
//     const { dispatch } = this.context;
//     const params = {
//       vedioVisible: false,
//       vedioUserList: [],
//     };
//     if (userList.length > 1) {
//       let _roomId = trtcCalling._roomID ? trtcCalling._roomID : inviteData.roomID;
//       leaveMeetting({ id: _roomId });
//     }
//     this.setState({
//       longTime: 0,
//       dateNow: 0,
//       dataConfig: {
//         dataVisible: false,
//         dataIsShow: false,
//       }, // 资料类型
//       deviceConfig: {
//         deviceVisible: false,
//         deviceIsShow: false,
//       },
//       toggleTeam: false, // 控制成员收缩
//       dataBtnVisible: false, // 资料查询
//     });
//     dispatch({
//       type: 'global/updateState',
//       payload: { ...params },
//     });
//   };
//
//   updateState = (obj = {}, callback) => {
//     this.setState({ ...obj }, () => {
//       callback && callback();
//     });
//   };
//
//
//   async publish() {
//     const { userInfo } = this.props;
//     const { account } = userInfo;
//     // 从麦克风和摄像头采集本地音视频流
//     this.globalLocalStream = TRTC.createStream({ userId: account, audio: false, video: false });
//     try {
//       this.globalLocalStream.initialize();
//       console.log('initialize localStream success', '推送视频');
//     } catch (e) {
//       console.error('failed initialize localStream ' + e);
//     }
//     try {
//       await this.shareClientJoin();
//       console.log('加入房间成功', '推送视频');
//     } catch (e) {
//       console.log('加入房间失败', '推送视频' + e);
//     }
//     try {
//       await this.shareClient.publish(this.globalLocalStream);
//       console.log('推送视频成功', '推送视频');
//     } catch (e) {
//       console.log('推送视频失败', '推送视频' + e);
//     }
//
//   };
//
//   // 分享结束
//   async showClose(showUserId) {
//     // 屏幕分享客户端停止推流
//     try {
//       await this.client.unpublish(this.localStream_);
//       console.log('unpublish成功');
//
//     } catch (e) {
//
//     }
//     try {
//       await this.client.leave();
//       console.log('leave');
//     } catch (e) {
//
//     }
//     try {
//       await this.localStream_ && this.localStream_.close();
//       this.localStream_ = null;
//       console.log('close');
//     } catch (e) {
//
//     }
//     this.setState({ isShow: false });
//   }
//
//   // 当人数少于2人时，按钮不能操作
//   hasUserMore = () => {
//     const { userList } = this.state;
//     return userList.length < 2 ? true : false;
//   };
//
//   // 屏幕分享
//   async handleShow() {
//     let isFlag = TRTC.isScreenShareSupported();
//
//     if (!isFlag) { // 判断当前浏览器是否能支持分享
//       CMessage('当前浏览器不支持屏幕分享', 'warn');
//       return;
//     }
//     const { userList } = this.state;
//     if (this.hasUserMore()) return;
//     let currentUser = userList.find(item => item.inviteType === 1);
//     const { userInfo, trtcCalling, inviteData } = this.props;
//     const { account } = userInfo;
//     let _roomID = currentUser.userID === account && trtcCalling._roomID ? trtcCalling._roomID : inviteData.roomID;
//     this.showUserId = account + '_show';
//     getUserSig({ userId: Base64.encode(this.showUserId) }).then(res => {
//       this.client = TRTC.createClient({
//         mode: 'rtc',
//         sdkAppId: res.sdkAppId,
//         userId: this.showUserId,
//         userSig: res.userSig,
//         /**
//          * disable receivers to avoid receiving remote streams as we only want to
//          * publish the screen stream
//          */
//         disableReceiver: true,
//       });
//     });
//     // create a local stream for screen share
//     this.localStream_ = TRTC.createStream({
//       // disable audio as RtcClient already enable audio
//       audio: false,
//       // enable screen share
//       screen: true,
//       userId: this.showUserId,
//     });
//     this.localStream_.setScreenProfile('1080p');
//     try {
//       // initialize the local stream to populate the screen stream
//       await this.localStream_.initialize();
//       console.log('ShareClient initialize local stream for screen share success');
//
//       this.localStream_.on('player-state-changed', event => {
//         console.log(`local stream ${event.type} player is ${event.state}`);
//       });
//
//       // 屏幕分享流监听屏幕分享停止事件
//       this.localStream_.on('screen-sharing-stopped', event => {
//         this.showClose(account);
//         console.log('屏幕分享客户端停止推流');
//
//       });
//     } catch (e) {
//       // 用户拒绝授予屏幕分享的权限, 导致屏幕分享失败
//       if (e.name === 'NotAllowedError') {
//         console.log('User refused to share the screen');
//       } else {
//         console.error('ShareClient failed to initialize local stream - ' + e);
//       }
//       // 屏幕分享流初始化失败，停止后续进房发布流程
//       return;
//     }
//
//     try {
//       await this.client.join({
//         roomId: Number(_roomID),
//       });
//       console.log('ShareClient join room success');
//     } catch (e) {
//       console.error('ShareClient join room failed! ' + e);
//     }
//
//     try {
//       // publish the screen share stream
//       await this.client.publish(this.localStream_);
//       this.setState({ isShow: true });
//       console.log('publish the screen share stream ');
//     } catch (e) {
//       console.error('ShareClient failed to publish local stream ' + e);
//     }
//   };
//
//
//   // 邀请用户
//   invitation = (List = []) => {
//     const { userInfo, trtcCalling } = this.props;
//     console.log(List, 'invitationinvitation');
//     if (!List.length) return;
//     trtcCalling.call({ userID: List[0].account, type: 2, timeout: 30 });
//   };
//
//   // 点击资料库
//   handleClickDatabase = () => {
//     const { dataConfig, deviceConfig, dataBtnVisible } = this.state;
//     const { dataIsShow, dataVisible } = dataConfig;
//     const { deviceVisible, deviceIsShow } = deviceConfig;
//     const dataTrue = {
//       dataConfig: {
//         dataIsShow: true,
//         dataVisible: true,
//       },
//     };
//     const deviceTrue = {
//       deviceConfig: {
//         deviceIsShow: true,
//         deviceVisible: true,
//       },
//     };
//     const dataFalseTrue = {
//       dataConfig: {
//         dataIsShow: false,
//         dataVisible: true,
//       },
//     };
//     if (!dataVisible && !dataIsShow) { // 如果资料面板隐藏，值改成true
//       this.setState(dataTrue);
//     }
//     if (dataVisible && dataIsShow && !deviceVisible && !deviceIsShow) { // 如果资料面板展示，需要改成隐藏
//       this.setState(dataFalseTrue);
//     }
//     if (dataVisible && dataIsShow && deviceVisible && deviceIsShow) {
//       this.setState({
//         ...dataFalseTrue,
//         deviceConfig: {
//           deviceIsShow: false,
//           deviceVisible: true,
//         },
//       });
//       return;
//     }
//     if (dataVisible && dataIsShow && deviceVisible && !deviceIsShow) {
//       this.setState({
//         ...dataFalseTrue,
//         deviceConfig: {
//           deviceIsShow: false,
//           deviceVisible: false,
//         },
//       });
//       return;
//     }
//     if (dataVisible && !dataIsShow && deviceVisible && !deviceIsShow) {
//       this.setState({
//         ...dataTrue,
//         ...deviceTrue,
//       });
//       return;
//     }
//     if (dataVisible && !dataIsShow) { // 如果资料面板隐藏，资料面板展示
//       this.setState({
//         ...dataTrue,
//       });
//     }
//   };
//   // 开始截屏
//   capture = () => {
//     let vedioDom = document.querySelector('#local_stream video');
//     if (!vedioDom) return;
//     const canvas = document.createElement('canvas');
//     canvas.setAttribute('id', 'vedioCanvas');
//     canvas.setAttribute('class', 'vedioCanvas');
//
//     const ctx = canvas.getContext('2d');
//     let w = vedioDom.clientWidth;
//     let h = vedioDom.clientHeight;
//     canvas.height = h;
//     canvas.width = w;
//     ctx.drawImage(vedioDom, 0, 0, w, h);
//     if (document.getElementById('vedioCanvas') || document.getElementById('vedioCanvasDraw')) {
//       this.clearCapture();
//     }
//     this.setState({ step: 1 });
//     document.getElementById('contentWrap').appendChild(canvas);
//   };
//   // 画图
//   draw = () => {
//     if (document.getElementById('vedioCanvasDraw')) {
//       return;
//     }
//     if (!document.getElementById('vedioCanvas')) {
//       return;
//     }
//     Draw.init(document.getElementById('contentWrap'));
//     const canvas = document.getElementById('vedioCanvas');
//     this.setState({ step: 2 });
//     setTimeout(() => {
//       !!canvas && document.getElementById('contentWrap').removeChild(canvas);
//     }, 0);
//   };
//
//   // 取消截屏
//   clearCapture = () => {
//     const canvas = document.getElementById('vedioCanvas');
//     const canvasDraw = document.getElementById('vedioCanvasDraw');
//     this.setState({ step: 0 });
//     !!canvas && document.getElementById('contentWrap').removeChild(canvas);
//     !!canvasDraw && document.getElementById('contentWrap').removeChild(canvasDraw);
//   };
//
//   /* 重置功能 */
//   reset() {
//     Draw.clear();
//   }
//
//   toggleFull = () => {
//     const { toggleTeam, step } = this.state;
//     if (step) {
//       CMessage('已经存在截屏,不建议使用该功能', 'warn');
//     }
//     this.setState({ toggleTeam: !toggleTeam });
//   };
//   setDrawColor = (item) => {
//     this.setState({ drawColor: item });
//     Draw.setColor(item);
//   };
//
//   // 颜色
//   drawColor = () => {
//     let colorArr = [
//       'rgba(224, 50, 50, 1)',
//       'rgba(250, 100, 0, 1)',
//       'rgba(250, 184, 2, 1)',
//       'rgba(68, 215, 182, 1)',
//       'rgba(0, 145, 255, 1)',
//       'rgba(187, 57, 224, 1)',
//     ];
//     const { drawColor } = this.state;
//     return <div style={{ padding: '4px 13px 4px 0' }}>{
//       colorArr.map(item => {
//         return (
//           <span
//             key={item}
//             onClick={() => this.setDrawColor(item)}
//             className={`iconfont ${item === drawColor ? 'icon-select-ok' : 'icon-select-no'}`}
//             style={{ color: item, cursor: 'pointer', marginLeft: '13px' }}>
//         </span>);
//       })
//     }</div>;
//
//   };
//
//   render() {
//     const { userList, visible, toggleTeam, dataConfig, dataBtnVisible, deviceConfig, step, whiteboardIsShow, isShow } = this.state;
//     const { dataVisible, dataIsShow } = dataConfig;
//     const { userInfo } = this.props;
//     let localUser = userList.find(item => item.userID === userInfo.account) || {};
//     let currentUser = userList.find(item => item.inviteType === 1) || userList[0] || {};
//     const userDom = this.renderUserList();
//     const contentWrap = classNames({
//       [Styles.content]: !dataIsShow,
//       [Styles.videoWrapFix]: dataIsShow,
//       [Styles.fullContentWrap]: toggleTeam,
//     });
//     const colorDom = this.drawColor();
//     return <div className={Styles.contentWrap}>
//       <div className={contentWrap} id="contentWrap">
//         <div className={Styles.contentHead}>
//           <TimeUpdate/>
//           <div className={Styles.speak}>正在讲话：{currentUser.userName}</div>
//           <div className={dataIsShow ? Styles.none : Styles.whiteboard}
//                onClick={() => this.setState({ whiteboardIsShow: !whiteboardIsShow })}>
//             <i className="iconfont icon-toggle-whiteboard"></i> <span>{whiteboardIsShow ? '隐藏白板栏' : '显示白板栏'}</span>
//           </div>
//         </div>
//         <div className={Styles.videoWrap}>
//           <div className={dataBtnVisible ? `${Styles.databaseShow} database` : `${Styles.databaseHide} database`}
//                onClick={() => {
//                  if (!dataBtnVisible) {
//                    this.setState({ dataBtnVisible: true });
//                  } else {
//                    this.handleClickDatabase();
//                  }
//                }}
//           >
//             {dataBtnVisible ?
//               <span
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   this.setState({ dataBtnVisible: false });
//                 }}
//                 className={`${Styles.toRight} icon-database_toRight iconfont`}
//               ></span> : null}
//             <span className="iconfont icon-database_1"></span>
//             <span>资料库</span>
//           </div>
//           {!currentUser.hasCamera ? <div className={Styles.img}><img src={currentUser.useravatar} alt=""/></div> : null}
//           <div className={Styles.videoContent} id="local_stream"></div>
//         </div>
//         <div className={dataIsShow || !whiteboardIsShow ? Styles.none : Styles.draw}>
//           <CTooltip overlayStyle={{ zIndex: 23334 }} placement="left" title={'截屏'}>
//             <li className={`drawItem ${step === 1 ? 'active' : ''}`} onClick={() => {
//               this.capture();
//             }}><span className={`icon-capture iconfont`}></span></li>
//           </CTooltip>
//           <Popover overlayStyle={{ zIndex: 23334 }} placement="left"
//                    content={colorDom}
//           >
//             <li className={`drawItem ${step === 2 ? 'active' : ''}`} onMouseEnter={() => this.draw()}><span
//               className={`icon-panel iconfont`}></span></li>
//           </Popover>
//           <CTooltip overlayStyle={{ zIndex: 23334 }} placement="left" title={'清除画布'}>
//             <li onClick={() => this.reset()} className="drawItem"><span className={`icon-draw-del iconfont`}></span>
//             </li>
//           </CTooltip>
//           <CTooltip overlayStyle={{ zIndex: 23334 }} placement="left" title={'取消截屏'}>
//             <li onClick={() => this.clearCapture()} className="drawItem"><span
//               className={`icon-cancel iconfont`}></span></li>
//           </CTooltip>
//           <CTooltip overlayStyle={{ zIndex: 23334 }} placement="left" title={'发送截屏'}>
//             <li onClick={() => this.sendImageMessage()} className={`drawItem ${step === 3 ? 'active' : ''}`}>
//               <Spin spinning={step === 3}><span className={`icon-ok iconfont`}></span></Spin>
//             </li>
//           </CTooltip>
//         </div>
//         <Row className={dataIsShow ? Styles.none : Styles.controlWrap}>
//           <div className={Styles.control}>
//             <li className="controlIcon" onClick={() => this.toggleCamera(localUser.hasCamera)}>
//               <span className={`iconfont ${localUser.hasCamera ? 'icon-camera' : 'icon-camera_close'}`}></span>
//               <div>摄像头</div>
//             </li>
//             <li className="controlIcon" onClick={() => this.toggeleMic(localUser.hasMicrophone)}>
//               <span
//                 className={`iconfont ${localUser.hasMicrophone ? 'icon-Microphone' : 'icon-Microphone_close'}`}></span>
//               <div>麦克风</div>
//             </li>
//             <li className="controlIcon">
//               <span className={`iconfont icon-speaker`}></span>
//               <div>扬声器</div>
//             </li>
//             <li onClick={() => {
//               this.handleLeave();
//             }} className={`${Styles.handleUp}`}>
//               <span className="iconfont icon-Hang_up"></span>
//             </li>
//             <li className={`controlIcon ${isShow ? 'active' : ''}`}
//                 onClick={() => this.handleShow()}
//             >
//               <span className="iconfont icon-team_show"></span>
//               <div>{!isShow ? '分享' : '分享中'}</div>
//             </li>
//             <li className="controlIcon" onClick={() => this.setState({ visible: true })}>
//               <span className="iconfont icon-team_add"></span>
//               <div>邀请</div>
//             </li>
//             <li className="controlIcon" onClick={() => this.toggleFull()}>
//               <span className="iconfont icon-team_man"></span>
//               <div>成员({userList.length})</div>
//             </li>
//           </div>
//         </Row>
//       </div>
//       <div className={`${Styles.list} ${toggleTeam ? Styles.none : ''} ${dataIsShow ? Styles.none : ''}`}>
//         <div className={Styles.listHead}>
//           成员({userList.length})
//         </div>
//         {userDom}
//       </div>
//       {visible && <Proficient
//         visible={visible}
//         userList={userList}
//         updateState={this.updateState}
//         invit={this.invitation}
//       />}
//       <Drawer
//         visible={dataVisible}
//         placement="left"
//         className={dataIsShow ? Styles.drawer : ''}
//         mask={false}
//         closable={true}
//         width={1000}
//         maskClosable={true}
//         title={<span><FormattedMessage id="video.search.information"/></span>}
//         onClose={() => this.setState({
//           dataConfig: {
//             ...dataConfig,
//             dataIsShow: false,
//           },
//         })}
//         getContainer={() => document.getElementById('main-container')}
//       >
//         <DeviceContent update={this.updateState} deviceConfig={deviceConfig}/>
//       </Drawer>
//     </div>;
//   }
// }
//
// class TimeUpdate extends Component {
//   state = {
//     dateNow: 0,
//     longTime: 0,
//   };
//   timer = null;
//
//   componentDidMount() {
//     this.setState({
//       dateNow: Date.parse(new Date()),
//     }, () => {
//       this.startTime();
//     });
//   }
//
//   componentWillUnmount() {
//     cancelAnimationFrame(this.timer);
//     this.timer = null;
//   }
//
//
//   // 视频开始时间
//   startTime = () => {
//     const { dateNow } = this.state;
//     let that = this;
//     that.timer = requestAnimationFrame(function fn() {
//       let diff = (Date.parse(new Date()) - dateNow) / 1000;
//       that.timer = requestAnimationFrame(fn);
//       let time = getSeconds(diff);
//       that.setState({ longTime: time });
//     });
//   };
//
//   render() {
//     const { longTime } = this.state;
//     return <span className={Styles.time}>{longTime}</span>;
//   }
// }
//
// export default VideoContent;
