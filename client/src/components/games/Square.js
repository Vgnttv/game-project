import React from 'react';
import Square from 'Square.css'

export default class Square extends React.Component{
  render(){
    const color_ = this.props.color;
    return (
      <td className="single-td"
        style={{
          overflow:'hidden',
          width:'50px',
          height:'50px',
          backgroundColor:'#fff',
          color:'white',
          boarderColor: 'black',
          border:".5px solid black"
        }}
      onClick={this.props.handleClick} >
        <div
          style={{color:red,
                  border:"1px solid",
                  backgroundColor: color_,
                  borderRadius: "50%",
                  borderColor: red,
                  height:25}} >
        </div>
      </td>
    )
  }
}
