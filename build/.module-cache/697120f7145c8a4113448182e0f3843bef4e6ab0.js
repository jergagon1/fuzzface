// React.render(
//   <h1>Hello, world!</h1>,
//   document.body
// );


var HelloWorld = React.createClass({displayName: "HelloWorld",
    render: function() {
        return React.createElement("div", null, "Hello, world!");
    }
});

React.render(new HelloWorld(), document.body);	

