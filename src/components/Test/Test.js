import React, { Component, useState } from 'react';
import { DatePicker, Input, Table } from 'antd';
import ReactToPrint from 'react-to-print';

function Example() {
  // 声明一个叫 “count” 的 state 变量。
  const [count, setCount] = useState(0);
  const add = () => {
    setCount(count + 1);
  };

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => add()}>
        Click me
      </button>
    </div>
  );
}

// class ComponentToPrint extends React.Component {
//   render() {
//     const columns = [
//       {
//         title: 'Name',
//         dataIndex: 'name',
//         key: 'name',
//         render: text => <a>{text}</a>,
//       },
//       {
//         title: 'Age',
//         dataIndex: 'age',
//         key: 'age',
//       },
//       {
//         title: 'Address',
//         dataIndex: 'address',
//         key: 'address',
//       },
//       {
//         title: 'Tags',
//         key: 'tags',
//         dataIndex: 'tags',
//       },
//       {
//         title: 'Action',
//         key: 'action',
//         render: (text, record) => (
//           <div>
//             <span>{record.name}</span>
//             <span>Delete</span>
//           </div>
//         ),
//       },
//     ];
//     const data = [
//       {
//         key: '1',
//         name: 'John Brown',
//         age: 32,
//         address: 'New York No. 1 Lake Park',
//         tags: ['nice', 'developer'],
//       },
//       {
//         key: '2',
//         name: 'Jim Green',
//         age: 42,
//         address: 'London No. 1 Lake Park',
//         tags: ['loser'],
//       },
//       {
//         key: '3',
//         name: 'Joe Black',
//         age: 32,
//         address: 'Sidney No. 1 Lake Park',
//         tags: ['cool', 'teacher'],
//       },
//     ];
//     return (
//       <div>
//         <table>
//           <thead>
//           <th>column 1</th>
//           <th>column 2</th>
//           <th>column 3</th>
//           </thead>
//           <tbody>
//           <tr>
//             <td>data 1</td>
//             <td>data 2</td>
//             <td>data 3</td>
//           </tr>
//           <tr>
//             <td>data 1</td>
//             <td>data 2</td>
//             <td>data 3</td>
//           </tr>
//           <tr>
//             <td>data 1</td>
//             <td>data 2</td>
//             <td>data 3</td>
//           </tr>
//           </tbody>
//         </table>
//         <Table columns={columns} dataSource={data}/>
//       </div>
//     );
//   }
// }
//
// class Example extends React.Component {
//   render() {
//     return (
//       <div>
//         <ReactToPrint
//           trigger={() => <a href="#">Print this out!</a>}
//           content={() => this.componentRef}
//           copyStyles={true}
//         />
//         <ComponentToPrint ref={el => (this.componentRef = el)}/>
//       </div>
//     );
//   }
// }

export default Example;
